import { z } from "zod";
import {
  DEFAULT_EXPORT_SECTIONS_BY_MODE,
  EXPORT_FORMAT_VALUES,
  EXPORT_MODE_VALUES,
  EXPORT_SECTION_KEYS,
  EXPORT_SECTION_ORDER,
  type ExportMode,
  type ExportSectionKey,
  type ResolvedExportConfig
} from "@/types/export";

export const exportModeSchema = z.enum(EXPORT_MODE_VALUES);
export const exportFormatSchema = z.enum(EXPORT_FORMAT_VALUES);
export const exportSectionKeySchema = z.enum(EXPORT_SECTION_KEYS);

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeRawSections(value: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return splitCsv(value);
  }

  if (Array.isArray(value)) {
    const flattened: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") {
        return value;
      }
      flattened.push(...splitCsv(item));
    }
    return flattened;
  }

  return value;
}

export const exportSectionsSchema = z.preprocess(
  normalizeRawSections,
  z.array(exportSectionKeySchema).optional()
);

export const exportQuerySchema = z.object({
  mode: exportModeSchema.default("human"),
  format: exportFormatSchema.default("markdown"),
  sections: exportSectionsSchema
});

export type ExportQueryInput = z.input<typeof exportQuerySchema>;
export type ParsedExportQuery = z.output<typeof exportQuerySchema>;

function coerceQueryObject(input: unknown): Record<string, unknown> {
  if (input instanceof URLSearchParams) {
    const sectionValues = input.getAll("sections");
    return {
      mode: input.get("mode") ?? undefined,
      format: input.get("format") ?? undefined,
      sections: sectionValues.length > 0 ? sectionValues : undefined
    };
  }

  if (typeof input === "object" && input !== null) {
    return input as Record<string, unknown>;
  }

  return {};
}

export function resolveExportSections(
  mode: ExportMode,
  sections: readonly ExportSectionKey[] | undefined
): ExportSectionKey[] {
  const sourceSections =
    sections && sections.length > 0 ? sections : DEFAULT_EXPORT_SECTIONS_BY_MODE[mode];
  const unique = new Set<ExportSectionKey>(sourceSections);

  return EXPORT_SECTION_ORDER.filter((section) => unique.has(section));
}

export function parseExportQuery(input: unknown): ParsedExportQuery {
  return exportQuerySchema.parse(coerceQueryObject(input));
}

export function parseResolvedExportConfig(input: unknown): ResolvedExportConfig {
  const parsed = parseExportQuery(input);

  return {
    mode: parsed.mode,
    format: parsed.format,
    sections: resolveExportSections(parsed.mode, parsed.sections)
  };
}
