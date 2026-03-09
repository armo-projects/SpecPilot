export const SPEC_STATUS_VALUES = ["DRAFT", "GENERATING", "COMPLETED", "FAILED"] as const;
export const SPEC_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export const RUN_STATUS_VALUES = ["STARTED", "SUCCEEDED", "FAILED"] as const;
export const PROMPT_ARTIFACT_MODE_VALUES = ["CODEX_READY"] as const;
export const PROMPT_ARTIFACT_TARGET_VALUES = ["GENERIC"] as const;

export type SpecStatus = (typeof SPEC_STATUS_VALUES)[number];
export type SpecPriority = (typeof SPEC_PRIORITY_VALUES)[number];
export type RunStatus = (typeof RUN_STATUS_VALUES)[number];
export type PromptArtifactMode = (typeof PROMPT_ARTIFACT_MODE_VALUES)[number];
export type PromptArtifactTarget = (typeof PROMPT_ARTIFACT_TARGET_VALUES)[number];

export interface DomainUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainSpec {
  id: string;
  userId: string;
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: SpecPriority;
  status: SpecStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainSpecPlan {
  id: string;
  specId: string;
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
  rawAiResponse: unknown;
  modelUsed: string;
  createdAt: Date;
}

export interface DomainGenerationRun {
  id: string;
  specId: string;
  status: RunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  errorMessage: string | null;
  tokensUsed: number | null;
  latencyMs: number | null;
}

export interface DomainSpecPromptArtifact {
  id: string;
  specPlanId: string;
  mode: PromptArtifactMode;
  target: PromptArtifactTarget;
  status: RunStatus;
  markdown: string | null;
  structuredData: unknown;
  modelUsed: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
