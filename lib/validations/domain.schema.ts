import { z } from "zod";
import { RUN_STATUS_VALUES, SPEC_PRIORITY_VALUES, SPEC_STATUS_VALUES } from "@/types/domain";

export const specStatusSchema = z.enum(SPEC_STATUS_VALUES);
export const specPrioritySchema = z.enum(SPEC_PRIORITY_VALUES);
export const runStatusSchema = z.enum(RUN_STATUS_VALUES);

export const userRecordSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const specRecordSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  title: z.string().min(1),
  rawPrompt: z.string().min(1),
  context: z.string().nullable(),
  priority: specPrioritySchema,
  status: specStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

export const specPlanRecordSchema = z.object({
  id: z.string().cuid(),
  specId: z.string().cuid(),
  version: z.number().int().positive(),
  summary: z.string().min(1),
  requirements: z.unknown(),
  assumptions: z.unknown(),
  frontendTasks: z.unknown(),
  backendTasks: z.unknown(),
  databaseSchema: z.unknown(),
  apiEndpoints: z.unknown(),
  edgeCases: z.unknown(),
  testCases: z.unknown(),
  risks: z.unknown(),
  rawAiResponse: z.unknown(),
  modelUsed: z.string().min(1),
  createdAt: z.date()
});

export const generationRunRecordSchema = z.object({
  id: z.string().cuid(),
  specId: z.string().cuid(),
  status: runStatusSchema,
  startedAt: z.date(),
  finishedAt: z.date().nullable(),
  errorMessage: z.string().nullable(),
  tokensUsed: z.number().int().nullable(),
  latencyMs: z.number().int().nullable()
});

export type UserRecord = z.infer<typeof userRecordSchema>;
export type SpecRecord = z.infer<typeof specRecordSchema>;
export type SpecPlanRecord = z.infer<typeof specPlanRecordSchema>;
export type GenerationRunRecord = z.infer<typeof generationRunRecordSchema>;
