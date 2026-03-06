export const SPEC_STATUS_VALUES = ["DRAFT", "GENERATING", "COMPLETED", "FAILED"] as const;
export const SPEC_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export const RUN_STATUS_VALUES = ["STARTED", "SUCCEEDED", "FAILED"] as const;

export type SpecStatus = (typeof SPEC_STATUS_VALUES)[number];
export type SpecPriority = (typeof SPEC_PRIORITY_VALUES)[number];
export type RunStatus = (typeof RUN_STATUS_VALUES)[number];

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
