import { z } from "zod";
import { specPrioritySchema } from "@/lib/validations/domain.schema";

const titleSchema = z.string().trim().min(3).max(140);
const promptSchema = z.string().trim().min(10).max(8000);
const contextSchema = z.string().trim().max(8000);

export const specIdParamsSchema = z.object({
  id: z.string().cuid()
});

export const createSpecInputSchema = z.object({
  title: titleSchema,
  rawPrompt: promptSchema,
  context: contextSchema.optional(),
  priority: specPrioritySchema.default("MEDIUM")
});

export const updateSpecInputSchema = z
  .object({
    title: titleSchema.optional(),
    rawPrompt: promptSchema.optional(),
    context: contextSchema.nullable().optional(),
    priority: specPrioritySchema.optional()
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "At least one field must be provided for update."
  });

export type CreateSpecInput = z.infer<typeof createSpecInputSchema>;
export type UpdateSpecInput = z.infer<typeof updateSpecInputSchema>;
