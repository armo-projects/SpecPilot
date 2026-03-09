import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const executionModeSchema = z.enum(["greenfield", "existing_repo"]);
const endpointMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const boundedStringArray = (maxItems: number, maxItemLength: number) =>
  z.array(z.string().trim().min(1).max(maxItemLength)).min(1).max(maxItems);

export const aiCodingPromptStepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  instructions: boundedStringArray(10, 400)
});

export const aiCodingPromptDataModelSchema = z.object({
  name: z.string().trim().min(1).max(120),
  details: boundedStringArray(10, 300)
});

export const aiCodingPromptApiContractSchema = z.object({
  method: endpointMethodSchema,
  path: z.string().trim().min(1).max(240),
  purpose: z.string().trim().min(1).max(400),
  details: boundedStringArray(10, 300)
});

export const aiCodingPromptUiSurfaceSchema = z.object({
  name: z.string().trim().min(1).max(120),
  purpose: z.string().trim().min(1).max(300),
  details: boundedStringArray(10, 300)
});

export const aiCodingPromptSchema = z.object({
  executionMode: executionModeSchema,
  objective: z.string().trim().min(1).max(2000),
  inScope: boundedStringArray(20, 300),
  outOfScope: boundedStringArray(20, 300),
  adoptedDefaults: boundedStringArray(20, 300),
  implementationConstraints: boundedStringArray(20, 300),
  orderedImplementationSteps: z.array(aiCodingPromptStepSchema).min(1).max(20),
  dataModel: z.array(aiCodingPromptDataModelSchema).min(1).max(20),
  apiContracts: z.array(aiCodingPromptApiContractSchema).min(1).max(20),
  uiSurfaces: z.array(aiCodingPromptUiSurfaceSchema).min(1).max(20),
  acceptanceChecks: boundedStringArray(20, 300),
  agentInstructions: boundedStringArray(20, 300)
});

export const AI_CODING_PROMPT_SCHEMA_NAME = "specpilot_coding_prompt";

export const aiCodingPromptTextFormat = zodTextFormat(aiCodingPromptSchema, AI_CODING_PROMPT_SCHEMA_NAME);

export type AiCodingPrompt = z.infer<typeof aiCodingPromptSchema>;
