import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { aiSpecPlanSchema, aiSpecPlanTextFormat, type AiSpecPlan } from "@/lib/validations/ai-spec-plan.schema";
import { DEFAULT_OPENAI_MODEL, MissingOpenAIKeyError, getOpenAIClient } from "@/lib/openai";
import { getOrCreateMockUser } from "@/server/auth/mock-user";
import { getSpecForMockUser } from "@/server/services/specs.service";
import type { GenerationResultPayload, SpecDetail } from "@/types/spec";

type GenerationFailureCode = "OPENAI_API_KEY_MISSING" | "AI_RESPONSE_INVALID" | "OPENAI_REQUEST_FAILED" | "SPEC_NOT_FOUND";

class StructuredOutputValidationError extends Error {
  readonly details: unknown;

  constructor(message: string, details: unknown) {
    super(message);
    this.name = "StructuredOutputValidationError";
    this.details = details;
  }
}

type GeneratedPlanPayload = {
  plan: AiSpecPlan;
  rawAiResponse: Prisma.InputJsonValue;
  modelUsed: string;
  tokensUsed: number | null;
};

type GenerationFailure = {
  code: GenerationFailureCode;
  message: string;
};

export type GenerateSpecPlanResult =
  | {
      ok: true;
      spec: SpecDetail;
      planVersion: number;
      error: null;
    }
  | {
      ok: false;
      spec: SpecDetail;
      planVersion: null;
      error: GenerationFailure;
    };

const SYSTEM_PROMPT = `You are SpecPilot, an engineering planning assistant.
Produce a practical, implementation-oriented technical plan for a modern web product team.
Output must be strict JSON that follows the provided schema exactly.
Do not include markdown, prose wrappers, or extra keys.
Keep items concrete, concise, and executable.`;

function buildUserPrompt(input: {
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  correctiveNote?: string;
}): string {
  const sections = [
    `Spec title: ${input.title}`,
    `Priority: ${input.priority}`,
    `Product request:`,
    input.rawPrompt,
    `Additional context:`,
    input.context && input.context.trim().length > 0 ? input.context : "None provided."
  ];

  if (input.correctiveNote) {
    sections.push(`Correction required: ${input.correctiveNote}`);
  }

  return sections.join("\n\n");
}

async function generatePlanOnce(input: {
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  correctiveNote?: string;
}): Promise<GeneratedPlanPayload> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.2,
    input: [
      { role: "developer", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) }
    ],
    text: {
      format: aiSpecPlanTextFormat
    }
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(response.output_text);
  } catch (error) {
    throw new StructuredOutputValidationError("Model did not return valid JSON.", {
      message: error instanceof Error ? error.message : "Unknown JSON parse error",
      outputText: response.output_text
    });
  }

  const parsedPlan = aiSpecPlanSchema.safeParse(parsedJson);
  if (!parsedPlan.success) {
    throw new StructuredOutputValidationError("Model output failed schema validation.", parsedPlan.error.flatten());
  }

  return {
    plan: parsedPlan.data,
    modelUsed: response.model,
    tokensUsed: response.usage?.total_tokens ?? null,
    rawAiResponse: JSON.parse(
      JSON.stringify({
        id: response.id,
        model: response.model,
        status: response.status ?? null,
        outputText: response.output_text,
        output: response.output,
        usage: response.usage ?? null,
        error: response.error ?? null,
        incompleteDetails: response.incomplete_details ?? null
      })
    ) as Prisma.InputJsonValue
  };
}

async function generatePlanWithRetry(input: {
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
}): Promise<GeneratedPlanPayload> {
  try {
    return await generatePlanOnce(input);
  } catch (error) {
    if (!(error instanceof StructuredOutputValidationError)) {
      throw error;
    }

    const correctiveNote = "Previous output failed schema validation. Return valid JSON exactly matching the schema.";
    return generatePlanOnce({ ...input, correctiveNote });
  }
}

function mapToFailure(error: unknown): GenerationFailure {
  if (error instanceof MissingOpenAIKeyError) {
    return {
      code: "OPENAI_API_KEY_MISSING",
      message: error.message
    };
  }

  if (error instanceof StructuredOutputValidationError) {
    return {
      code: "AI_RESPONSE_INVALID",
      message: error.message
    };
  }

  if (error instanceof Error) {
    return {
      code: "OPENAI_REQUEST_FAILED",
      message: error.message
    };
  }

  return {
    code: "OPENAI_REQUEST_FAILED",
    message: "Unknown generation failure."
  };
}

function generationPayloadFromFailure(error: GenerationFailure): GenerationResultPayload {
  return {
    ok: false,
    planVersion: null,
    error
  };
}

function generationPayloadFromSuccess(planVersion: number): GenerationResultPayload {
  return {
    ok: true,
    planVersion,
    error: null
  };
}

export async function generateSpecPlanForMockUser(specId: string): Promise<GenerateSpecPlanResult | null> {
  const user = await getOrCreateMockUser();
  const spec = await db.spec.findFirst({
    where: { id: specId, userId: user.id },
    select: {
      id: true,
      title: true,
      rawPrompt: true,
      context: true,
      priority: true
    }
  });

  if (!spec) {
    return null;
  }

  const startedAtMs = Date.now();
  const run = await db.generationRun.create({
    data: {
      specId: spec.id,
      status: "STARTED"
    }
  });

  await db.spec.update({
    where: { id: spec.id },
    data: { status: "GENERATING" }
  });

  try {
    const generated = await generatePlanWithRetry({
      title: spec.title,
      rawPrompt: spec.rawPrompt,
      context: spec.context,
      priority: spec.priority
    });

    const planVersion = await db.$transaction(async (tx) => {
      const latestVersion = await tx.specPlan.findFirst({
        where: { specId: spec.id },
        orderBy: { version: "desc" },
        select: { version: true }
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;
      await tx.specPlan.create({
        data: {
          specId: spec.id,
          version: nextVersion,
          summary: generated.plan.summary,
          requirements: generated.plan.requirements,
          assumptions: generated.plan.assumptions,
          frontendTasks: generated.plan.frontendTasks,
          backendTasks: generated.plan.backendTasks,
          databaseSchema: generated.plan.databaseSchema,
          apiEndpoints: generated.plan.apiEndpoints,
          edgeCases: generated.plan.edgeCases,
          testCases: generated.plan.testCases,
          risks: generated.plan.risks,
          rawAiResponse: generated.rawAiResponse,
          modelUsed: generated.modelUsed
        }
      });

      await tx.generationRun.update({
        where: { id: run.id },
        data: {
          status: "SUCCEEDED",
          finishedAt: new Date(),
          tokensUsed: generated.tokensUsed,
          latencyMs: Date.now() - startedAtMs,
          errorMessage: null
        }
      });

      await tx.spec.update({
        where: { id: spec.id },
        data: { status: "COMPLETED" }
      });

      return nextVersion;
    });

    const refreshed = await getSpecForMockUser(spec.id);
    if (!refreshed) {
      throw new Error("Spec disappeared after successful generation.");
    }

    return {
      ok: true,
      spec: refreshed,
      planVersion,
      error: null
    };
  } catch (error) {
    const failure = mapToFailure(error);
    await db.$transaction([
      db.generationRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          latencyMs: Date.now() - startedAtMs,
          errorMessage: `[${failure.code}] ${failure.message}`
        }
      }),
      db.spec.update({
        where: { id: spec.id },
        data: { status: "FAILED" }
      })
    ]);

    const refreshed = await getSpecForMockUser(spec.id);
    if (!refreshed) {
      throw new Error("Spec disappeared after failed generation.");
    }

    return {
      ok: false,
      spec: refreshed,
      planVersion: null,
      error: failure
    };
  }
}

export function toGenerationPayload(
  result: GenerateSpecPlanResult | null,
  notFoundMessage = "Spec not found."
): GenerationResultPayload {
  if (!result) {
    return {
      ok: false,
      planVersion: null,
      error: {
        code: "SPEC_NOT_FOUND",
        message: notFoundMessage
      }
    };
  }

  if (!result.ok) {
    return generationPayloadFromFailure(result.error);
  }

  return generationPayloadFromSuccess(result.planVersion);
}
