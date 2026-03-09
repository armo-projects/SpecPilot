import type { AiCodingPrompt } from "@/lib/validations/ai-coding-prompt.schema";
import type { RunStatus, SpecPriority, SpecStatus } from "@/types/domain";
import type { AiSpecPlan } from "@/lib/validations/ai-spec-plan.schema";
import type { PromptArtifactMode, PromptArtifactTarget } from "@/types/domain";

export interface SpecPlanPreview {
  id: string;
  version: number;
  summary: string;
  createdAt: Date;
}

export type SpecPlanVersion = SpecPlanPreview;

export interface SpecPlanData extends SpecPlanVersion, AiSpecPlan {
  modelUsed: string;
  codexReadyArtifact: SpecPromptArtifactSummary | null;
}

export interface SpecPromptArtifactSummary {
  id: string;
  mode: PromptArtifactMode;
  target: PromptArtifactTarget;
  status: RunStatus;
  markdown: string | null;
  errorMessage: string | null;
  modelUsed: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecPromptArtifactData extends SpecPromptArtifactSummary {
  structuredData: AiCodingPrompt | null;
}

export interface GenerationRunSummary {
  id: string;
  status: RunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  errorMessage: string | null;
  tokensUsed: number | null;
  latencyMs: number | null;
}

export interface SpecListItem {
  id: string;
  title: string;
  priority: SpecPriority;
  status: SpecStatus;
  createdAt: Date;
  updatedAt: Date;
  latestPlan: SpecPlanPreview | null;
}

export interface SpecDetail extends SpecListItem {
  rawPrompt: string;
  context: string | null;
  latestPlanData: SpecPlanData | null;
  planVersions: SpecPlanVersion[];
  latestGenerationRun: GenerationRunSummary | null;
}

export interface CreateSpecApiResponse {
  spec: SpecDetail;
  generation: GenerationResultPayload;
}

export interface ListSpecsApiResponse {
  specs: SpecListItem[];
}

export interface GetSpecApiResponse {
  spec: SpecDetail;
}

export interface GenerateSpecApiResponse {
  spec: SpecDetail;
  generation: GenerationResultPayload;
}

export interface GenerationResultPayload {
  ok: boolean;
  planVersion: number | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
