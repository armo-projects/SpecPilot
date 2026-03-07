import type { SpecDetail } from "@/types/spec";

export const EXPORT_MODE_VALUES = ["human", "codex_ready", "compact_brief"] as const;
export type ExportMode = (typeof EXPORT_MODE_VALUES)[number];

export const EXPORT_FORMAT_VALUES = ["markdown", "text"] as const;
export type ExportFormat = (typeof EXPORT_FORMAT_VALUES)[number];

export const EXPORT_SECTION_KEYS = [
  "product_request",
  "additional_context",
  "summary",
  "requirements",
  "assumptions",
  "frontend_tasks",
  "backend_tasks",
  "database_schema",
  "api_endpoints",
  "edge_cases",
  "test_cases",
  "risks"
] as const;
export type ExportSectionKey = (typeof EXPORT_SECTION_KEYS)[number];

export const EXPORT_SECTION_ORDER: readonly ExportSectionKey[] = [
  "product_request",
  "additional_context",
  "summary",
  "requirements",
  "assumptions",
  "frontend_tasks",
  "backend_tasks",
  "database_schema",
  "api_endpoints",
  "edge_cases",
  "test_cases",
  "risks"
] as const;

export const DEFAULT_EXPORT_SECTIONS_BY_MODE: Readonly<Record<ExportMode, readonly ExportSectionKey[]>> = {
  human: EXPORT_SECTION_ORDER,
  codex_ready: [
    "product_request",
    "additional_context",
    "requirements",
    "assumptions",
    "frontend_tasks",
    "backend_tasks",
    "database_schema",
    "api_endpoints",
    "edge_cases",
    "test_cases",
    "risks"
  ],
  compact_brief: ["summary", "requirements", "frontend_tasks", "backend_tasks", "api_endpoints", "test_cases", "risks"]
} as const;

export type ResolvedExportConfig = {
  mode: ExportMode;
  format: ExportFormat;
  sections: readonly ExportSectionKey[];
};

export type RenderMarkdownInput = {
  spec: SpecDetail;
  mode: ExportMode;
  sections: readonly ExportSectionKey[];
  generatedAt?: Date;
};

export type RenderedMarkdownArtifact = {
  content: string;
  title: string;
  mode: ExportMode;
  sections: readonly ExportSectionKey[];
  generatedAt: Date;
};
