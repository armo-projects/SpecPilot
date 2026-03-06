import "server-only";
import type { Prisma } from "@prisma/client";
import { aiSpecPlanSchema } from "@/lib/validations/ai-spec-plan.schema";
import { db } from "@/lib/db";
import type { CreateSpecInput, UpdateSpecInput } from "@/lib/validations/spec-input.schema";
import { getOrCreateMockUser } from "@/server/auth/mock-user";
import type {
  GenerationRunSummary,
  SpecDetail,
  SpecListItem,
  SpecPlanData,
  SpecPlanPreview,
  SpecPlanVersion
} from "@/types/spec";

const listInclude = {
  plans: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      version: true,
      summary: true,
      createdAt: true
    }
  }
} satisfies Prisma.SpecInclude;

const detailInclude = {
  plans: {
    orderBy: [{ version: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      version: true,
      summary: true,
      requirements: true,
      assumptions: true,
      frontendTasks: true,
      backendTasks: true,
      databaseSchema: true,
      apiEndpoints: true,
      edgeCases: true,
      testCases: true,
      risks: true,
      modelUsed: true,
      createdAt: true
    }
  },
  generationRuns: {
    orderBy: { startedAt: "desc" },
    take: 1,
    select: {
      id: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      errorMessage: true,
      tokensUsed: true,
      latencyMs: true
    }
  }
} satisfies Prisma.SpecInclude;

function normalizeOptionalContext(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapPlanPreview(plan: { id: string; version: number; summary: string; createdAt: Date } | undefined): SpecPlanPreview | null {
  if (!plan) {
    return null;
  }

  return {
    id: plan.id,
    version: plan.version,
    summary: plan.summary,
    createdAt: plan.createdAt
  };
}

function mapPlanVersion(plan: { id: string; version: number; summary: string; createdAt: Date }): SpecPlanVersion {
  return {
    id: plan.id,
    version: plan.version,
    summary: plan.summary,
    createdAt: plan.createdAt
  };
}

function mapGenerationRun(run: {
  id: string;
  status: "STARTED" | "SUCCEEDED" | "FAILED";
  startedAt: Date;
  finishedAt: Date | null;
  errorMessage: string | null;
  tokensUsed: number | null;
  latencyMs: number | null;
} | null): GenerationRunSummary | null {
  if (!run) {
    return null;
  }

  return {
    id: run.id,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    errorMessage: run.errorMessage,
    tokensUsed: run.tokensUsed,
    latencyMs: run.latencyMs
  };
}

function mapPlanData(plan: {
  id: string;
  version: number;
  summary: string;
  requirements: unknown;
  assumptions: unknown;
  frontendTasks: unknown;
  backendTasks: unknown;
  databaseSchema: unknown;
  apiEndpoints: unknown;
  edgeCases: unknown;
  testCases: unknown;
  risks: unknown;
  modelUsed: string;
  createdAt: Date;
} | undefined): SpecPlanData | null {
  if (!plan) {
    return null;
  }

  const parsed = aiSpecPlanSchema.safeParse({
    summary: plan.summary,
    requirements: plan.requirements,
    assumptions: plan.assumptions,
    frontendTasks: plan.frontendTasks,
    backendTasks: plan.backendTasks,
    databaseSchema: plan.databaseSchema,
    apiEndpoints: plan.apiEndpoints,
    edgeCases: plan.edgeCases,
    testCases: plan.testCases,
    risks: plan.risks
  });

  if (!parsed.success) {
    console.error(`Invalid persisted plan payload for plan ${plan.id}:`, parsed.error.flatten());
    return null;
  }

  return {
    id: plan.id,
    version: plan.version,
    createdAt: plan.createdAt,
    modelUsed: plan.modelUsed,
    ...parsed.data
  };
}

function mapSpecToListItem(spec: {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  plans: Array<{ id: string; version: number; summary: string; createdAt: Date }>;
}): SpecListItem {
  return {
    id: spec.id,
    title: spec.title,
    priority: spec.priority,
    status: spec.status,
    createdAt: spec.createdAt,
    updatedAt: spec.updatedAt,
    latestPlan: mapPlanPreview(spec.plans[0])
  };
}

function mapSpecToDetail(spec: {
  id: string;
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  plans: Array<{
    id: string;
    version: number;
    summary: string;
    requirements: unknown;
    assumptions: unknown;
    frontendTasks: unknown;
    backendTasks: unknown;
    databaseSchema: unknown;
    apiEndpoints: unknown;
    edgeCases: unknown;
    testCases: unknown;
    risks: unknown;
    modelUsed: string;
    createdAt: Date;
  }>;
  generationRuns: Array<{
    id: string;
    status: "STARTED" | "SUCCEEDED" | "FAILED";
    startedAt: Date;
    finishedAt: Date | null;
    errorMessage: string | null;
    tokensUsed: number | null;
    latencyMs: number | null;
  }>;
}): SpecDetail {
  return {
    id: spec.id,
    title: spec.title,
    rawPrompt: spec.rawPrompt,
    context: spec.context,
    priority: spec.priority,
    status: spec.status,
    createdAt: spec.createdAt,
    updatedAt: spec.updatedAt,
    latestPlan: mapPlanPreview(spec.plans[0]),
    latestPlanData: mapPlanData(spec.plans[0]),
    planVersions: spec.plans.map(mapPlanVersion),
    latestGenerationRun: mapGenerationRun(spec.generationRuns[0] ?? null)
  };
}

export async function listSpecsForMockUser(): Promise<SpecListItem[]> {
  const user = await getOrCreateMockUser();
  const specs = await db.spec.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: listInclude
  });

  return specs.map(mapSpecToListItem);
}

export async function createSpecForMockUser(input: CreateSpecInput): Promise<SpecDetail> {
  const user = await getOrCreateMockUser();
  const spec = await db.spec.create({
    data: {
      userId: user.id,
      title: input.title,
      rawPrompt: input.rawPrompt,
      context: normalizeOptionalContext(input.context),
      priority: input.priority,
      status: "DRAFT"
    },
    include: detailInclude
  });

  return mapSpecToDetail(spec);
}

export async function getSpecForMockUser(specId: string): Promise<SpecDetail | null> {
  const user = await getOrCreateMockUser();
  const spec = await db.spec.findFirst({
    where: { id: specId, userId: user.id },
    include: detailInclude
  });

  return spec ? mapSpecToDetail(spec) : null;
}

export async function updateSpecForMockUser(specId: string, input: UpdateSpecInput): Promise<SpecDetail | null> {
  const user = await getOrCreateMockUser();
  const existing = await db.spec.findFirst({
    where: { id: specId, userId: user.id },
    select: { id: true }
  });

  if (!existing) {
    return null;
  }

  const updateData: Prisma.SpecUpdateInput = {};
  if (input.title !== undefined) {
    updateData.title = input.title;
  }
  if (input.rawPrompt !== undefined) {
    updateData.rawPrompt = input.rawPrompt;
  }
  if (input.context !== undefined) {
    updateData.context = normalizeOptionalContext(input.context);
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority;
  }

  const spec = await db.spec.update({
    where: { id: specId },
    data: updateData,
    include: detailInclude
  });

  return mapSpecToDetail(spec);
}
