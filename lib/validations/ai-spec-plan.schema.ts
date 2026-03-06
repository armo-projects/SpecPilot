import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const taskPrioritySchema = z.enum(["low", "medium", "high"]);
const endpointMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export const aiSpecTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  priority: taskPrioritySchema
});

export const aiDatabaseFieldSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(120),
  required: z.boolean()
});

export const aiDatabaseEntitySchema = z.object({
  entity: z.string().trim().min(1).max(120),
  fields: z.array(aiDatabaseFieldSchema).min(1).max(30)
});

export const aiApiEndpointSchema = z.object({
  method: endpointMethodSchema,
  path: z.string().trim().min(1).max(240),
  purpose: z.string().trim().min(1).max(400)
});

export const aiSpecPlanSchema = z.object({
  summary: z.string().trim().min(1).max(3000),
  requirements: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
  assumptions: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
  frontendTasks: z.array(aiSpecTaskSchema).min(1).max(30),
  backendTasks: z.array(aiSpecTaskSchema).min(1).max(30),
  databaseSchema: z.array(aiDatabaseEntitySchema).min(1).max(20),
  apiEndpoints: z.array(aiApiEndpointSchema).min(1).max(30),
  edgeCases: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
  testCases: z.array(z.string().trim().min(1).max(500)).min(1).max(40),
  risks: z.array(z.string().trim().min(1).max(500)).min(1).max(30)
});

export const AI_SPEC_PLAN_SCHEMA_NAME = "specpilot_plan";

// Single source of truth for OpenAI Structured Outputs.
// zodTextFormat converts the Zod schema to strict JSON schema for the Responses API.
export const aiSpecPlanTextFormat = zodTextFormat(aiSpecPlanSchema, AI_SPEC_PLAN_SCHEMA_NAME);

export type AiSpecPlan = z.infer<typeof aiSpecPlanSchema>;
