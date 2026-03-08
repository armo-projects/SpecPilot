import "server-only";
import { parseResolvedExportConfig } from "@/lib/validations/export.schema";
import { MissingSpecPlanDataError, renderSpecMarkdownArtifact } from "@/server/services/spec-export.renderer";
import { getSpecForMockUser } from "@/server/services/specs.service";
import type { ExportFormat, ExportMode, ExportSectionKey } from "@/types/export";

export type SpecExportServiceErrorCode = "SPEC_NOT_FOUND" | "PLAN_NOT_FOUND";

export class SpecExportServiceError extends Error {
  readonly code: SpecExportServiceErrorCode;
  readonly statusCode: number;

  constructor(code: SpecExportServiceErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = "SpecExportServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isSpecExportServiceError(error: unknown): error is SpecExportServiceError {
  return error instanceof SpecExportServiceError;
}

export type BuildSpecExportOptions = {
  specId: string;
  query: unknown;
};

export type SpecExportArtifact = {
  specId: string;
  title: string;
  filename: string;
  mode: ExportMode;
  format: ExportFormat;
  sections: readonly ExportSectionKey[];
  content: string;
  generatedAt: Date;
  contentType: "text/markdown; charset=utf-8" | "text/plain; charset=utf-8";
};

function toSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return slug.length > 0 ? slug.slice(0, 80) : "specpilot-export";
}

function buildExportFilename(title: string, mode: ExportMode, format: ExportFormat): string {
  const extension = format === "markdown" ? "md" : "txt";
  return `${toSlug(title)}-${mode}.${extension}`;
}

function toPlainTextFromMarkdown(markdown: string): string {
  // Keep markdown as the canonical source and return it as plain text bytes.
  return markdown;
}

export async function buildSpecExportForMockUser(options: BuildSpecExportOptions): Promise<SpecExportArtifact> {
  const resolved = parseResolvedExportConfig(options.query);
  const spec = await getSpecForMockUser(options.specId);

  if (!spec) {
    throw new SpecExportServiceError("SPEC_NOT_FOUND", "Spec not found.", 404);
  }

  try {
    const rendered = renderSpecMarkdownArtifact({
      spec,
      mode: resolved.mode,
      sections: resolved.sections
    });

    const content =
      resolved.format === "markdown"
        ? rendered.content
        : toPlainTextFromMarkdown(rendered.content);

    return {
      specId: spec.id,
      title: rendered.title,
      filename: buildExportFilename(spec.title, resolved.mode, resolved.format),
      mode: resolved.mode,
      format: resolved.format,
      sections: rendered.sections,
      content,
      generatedAt: rendered.generatedAt,
      contentType:
        resolved.format === "markdown"
          ? "text/markdown; charset=utf-8"
          : "text/plain; charset=utf-8"
    };
  } catch (error) {
    if (error instanceof MissingSpecPlanDataError) {
      throw new SpecExportServiceError(
        "PLAN_NOT_FOUND",
        "No generated plan is available for export.",
        409
      );
    }

    throw error;
  }
}
