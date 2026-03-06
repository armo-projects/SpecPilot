import type { SpecPriority, SpecStatus } from "@/types/domain";

export interface SpecPlanPreview {
  id: string;
  version: number;
  summary: string;
  createdAt: Date;
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
}

export interface CreateSpecApiResponse {
  spec: SpecDetail;
}

export interface ListSpecsApiResponse {
  specs: SpecListItem[];
}

export interface GetSpecApiResponse {
  spec: SpecDetail;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
