"use client";

import type { ExportMode, ExportSectionKey } from "@/types/export";
import { DEFAULT_EXPORT_SECTIONS_BY_MODE, EXPORT_SECTION_ORDER } from "@/types/export";
import { Button } from "@/components/ui/button";

type SpecExportOptionsProps = {
  mode: ExportMode;
  selectedSections: readonly ExportSectionKey[];
  disabled?: boolean;
  compact?: boolean;
  onModeChange: (mode: ExportMode) => void;
  onToggleSection: (section: ExportSectionKey, checked: boolean) => void;
  onSelectAll: () => void;
  onResetToModeDefaults: () => void;
};

const SECTION_LABELS: Readonly<Record<ExportSectionKey, string>> = {
  product_request: "Product Request",
  additional_context: "Additional Context",
  summary: "Summary",
  requirements: "Requirements",
  assumptions: "Assumptions",
  frontend_tasks: "Frontend Tasks",
  backend_tasks: "Backend Tasks",
  database_schema: "Database Schema",
  api_endpoints: "API Endpoints",
  edge_cases: "Edge Cases",
  test_cases: "Test Cases",
  risks: "Risks and Unknowns"
} as const;

const MODE_LABELS: Readonly<Record<ExportMode, string>> = {
  human: "Human Spec",
  codex_ready: "Codex-Ready",
  compact_brief: "Compact Brief"
} as const;

export function SpecExportOptions({
  mode,
  selectedSections,
  disabled = false,
  compact = false,
  onModeChange,
  onToggleSection,
  onSelectAll,
  onResetToModeDefaults
}: SpecExportOptionsProps) {
  const selectedSet = new Set(selectedSections);
  const defaultsForMode = DEFAULT_EXPORT_SECTIONS_BY_MODE[mode];
  const containerClassName = compact
    ? "space-y-3"
    : "space-y-3 rounded-xl border bg-card p-4 shadow-sm";

  return (
    <article className={containerClassName}>
      {!compact ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">Export Options</h3>
          <p className="text-xs text-muted-foreground">Choose mode and sections included in copy/export output.</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="export-mode" className="text-xs font-medium text-slate-700">
          Mode
        </label>
        <select
          id="export-mode"
          value={mode}
          onChange={(event) => onModeChange(event.target.value as ExportMode)}
          disabled={disabled}
          className="w-full rounded-md border bg-background px-2.5 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Object.entries(MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-700">Sections ({selectedSections.length})</p>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={onSelectAll} disabled={disabled} className="h-7 px-2 text-xs">
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetToModeDefaults}
              disabled={disabled}
              className="h-7 px-2 text-xs"
            >
              Reset defaults
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">At least one section must remain selected.</p>

        <div className={`grid gap-1.5 rounded-md border bg-slate-50/70 p-2 ${compact ? "max-h-44 overflow-y-auto" : ""}`}>
          {EXPORT_SECTION_ORDER.map((section) => (
            <label
              key={section}
              className="flex items-center gap-2 rounded px-1.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(section)}
                onChange={(event) => onToggleSection(section, event.target.checked)}
                disabled={disabled || (selectedSections.length === 1 && selectedSet.has(section))}
                className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>{SECTION_LABELS[section]}</span>
            </label>
          ))}
        </div>

        <p className="text-[11px] text-slate-500">
          Defaults for {MODE_LABELS[mode]} include {defaultsForMode.length} sections.
        </p>
      </div>
    </article>
  );
}
