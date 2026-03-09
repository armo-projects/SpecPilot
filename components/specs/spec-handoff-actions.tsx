"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clipboard, ClipboardList, Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SpecExportOptions } from "@/components/specs/spec-export-options";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/types/domain";
import {
  DEFAULT_EXPORT_SECTIONS_BY_MODE,
  EXPORT_MODE_VALUES,
  EXPORT_SECTION_KEYS,
  EXPORT_SECTION_ORDER,
  modeUsesSelectableSections,
  type ExportMode,
  type ExportSectionKey
} from "@/types/export";

type SpecHandoffActionsProps = {
  specId: string;
  disabled?: boolean;
  disabledReason?: string | null;
  codexReadyArtifact?: {
    status: RunStatus;
    errorMessage: string | null;
  } | null;
  className?: string;
  compact?: boolean;
};

type PersistedExportState = {
  mode: ExportMode;
  sections: ExportSectionKey[];
};

type BusyAction = "copy_full" | "copy_selected" | "download_markdown" | null;

const STORAGE_KEY = "specpilot.export.preferences.v1";
const MODE_LABELS: Readonly<Record<ExportMode, string>> = {
  human: "Human Spec",
  codex_ready: "Codex-Ready",
  compact_brief: "Compact Brief"
} as const;

function getDefaultSections(mode: ExportMode): ExportSectionKey[] {
  if (!modeUsesSelectableSections(mode)) {
    return [];
  }

  return [...DEFAULT_EXPORT_SECTIONS_BY_MODE[mode]];
}

function isExportMode(value: unknown): value is ExportMode {
  return typeof value === "string" && EXPORT_MODE_VALUES.includes(value as ExportMode);
}

function normalizeSections(sections: readonly ExportSectionKey[]): ExportSectionKey[] {
  const allowed = new Set<ExportSectionKey>(EXPORT_SECTION_KEYS);
  const selected = new Set<ExportSectionKey>(
    sections.filter((section): section is ExportSectionKey => allowed.has(section))
  );
  return EXPORT_SECTION_ORDER.filter((section) => selected.has(section));
}

function toQuery(mode: ExportMode, format: "markdown" | "text", sections: readonly ExportSectionKey[]): string {
  const searchParams = new URLSearchParams();
  searchParams.set("mode", mode);
  searchParams.set("format", format);

  if (sections.length > 0) {
    searchParams.set("sections", sections.join(","));
  }

  return searchParams.toString();
}

function getExportErrorMessage(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return "Failed to export content.";
}

async function fetchExportContent(specId: string, mode: ExportMode, sections: readonly ExportSectionKey[], format: "markdown" | "text") {
  const query = toQuery(mode, format, sections);
  const response = await fetch(`/api/specs/${specId}/export?${query}`, {
    method: "GET"
  });

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(getExportErrorMessage(payload));
  }

  return response;
}

export function SpecHandoffActions({
  specId,
  disabled = false,
  disabledReason = null,
  codexReadyArtifact = null,
  className,
  compact = false
}: SpecHandoffActionsProps) {
  const [mode, setMode] = useState<ExportMode>("human");
  const [selectedSections, setSelectedSections] = useState<ExportSectionKey[]>([
    ...DEFAULT_EXPORT_SECTIONS_BY_MODE.human
  ]);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const usesSelectableSections = modeUsesSelectableSections(mode);
  const codexActionsUnavailable =
    mode === "codex_ready" && codexReadyArtifact !== null && codexReadyArtifact.status !== "SUCCEEDED";
  const codexDisabledReason =
    mode === "codex_ready" && codexReadyArtifact?.status === "FAILED"
      ? codexReadyArtifact.errorMessage ?? "Codex-ready prompt is unavailable for the latest plan version."
      : mode === "codex_ready" && codexReadyArtifact?.status === "STARTED"
        ? "Codex-ready prompt is still being prepared."
        : null;
  const isBusy = busyAction !== null;
  const isControlsDisabled = disabled || isBusy;
  const isActionDisabled = isControlsDisabled || codexActionsUnavailable;
  const effectiveDisabledReason = disabledReason ?? codexDisabledReason;

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedExportState>;
      const nextMode = isExportMode(parsed.mode) ? parsed.mode : "human";
      const normalized = Array.isArray(parsed.sections)
        ? normalizeSections(parsed.sections as ExportSectionKey[])
        : getDefaultSections(nextMode);
      const nextSections = normalized.length > 0 ? normalized : getDefaultSections(nextMode);

      setMode(nextMode);
      setSelectedSections(nextSections);
    } catch (error) {
      console.error("Failed to restore export preferences:", error);
    }
  }, []);

  useEffect(() => {
    const normalized = normalizeSections(selectedSections);
    const safeSections = normalized.length > 0 ? normalized : getDefaultSections(mode);
    const payload: PersistedExportState = {
      mode,
      sections: safeSections
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [mode, selectedSections]);

  const selectedSectionsOrdered = useMemo(
    () => {
      if (!usesSelectableSections) {
        return [];
      }

      const normalized = normalizeSections(selectedSections);
      return normalized.length > 0 ? normalized : getDefaultSections(mode);
    },
    [mode, selectedSections, usesSelectableSections]
  );

  function handleModeChange(nextMode: ExportMode): void {
    setMode(nextMode);
    setSelectedSections(getDefaultSections(nextMode));
  }

  function handleToggleSection(section: ExportSectionKey, checked: boolean): void {
    setSelectedSections((current) => {
      if (!checked && current.length === 1 && current.includes(section)) {
        toast.message("At least one section must remain selected.");
        return current;
      }

      const next = new Set(current);
      if (checked) {
        next.add(section);
      } else {
        next.delete(section);
      }
      return normalizeSections([...next]);
    });
  }

  function handleSelectAll(): void {
    if (!usesSelectableSections) {
      return;
    }

    setSelectedSections([...EXPORT_SECTION_ORDER]);
  }

  function handleResetDefaults(): void {
    setSelectedSections(getDefaultSections(mode));
  }

  async function copyFullPlan(): Promise<void> {
    setBusyAction("copy_full");
    try {
      const response = await fetchExportContent(
        specId,
        mode,
        usesSelectableSections ? EXPORT_SECTION_ORDER : [],
        "text"
      );
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      toast.success(usesSelectableSections ? "Copied full plan to clipboard." : "Copied prompt to clipboard.");
    } catch (error) {
      console.error("Failed to copy full plan:", error);
      toast.error(error instanceof Error ? error.message : usesSelectableSections ? "Failed to copy full plan." : "Failed to copy prompt.");
    } finally {
      setBusyAction(null);
    }
  }

  async function copySelectedSections(): Promise<void> {
    if (!usesSelectableSections) {
      return;
    }

    setBusyAction("copy_selected");
    try {
      const response = await fetchExportContent(specId, mode, selectedSectionsOrdered, "text");
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      toast.success("Copied selected sections to clipboard.");
    } catch (error) {
      console.error("Failed to copy selected sections:", error);
      toast.error(error instanceof Error ? error.message : "Failed to copy selected sections.");
    } finally {
      setBusyAction(null);
    }
  }

  async function downloadMarkdown(): Promise<void> {
    setBusyAction("download_markdown");
    try {
      const response = await fetchExportContent(
        specId,
        mode,
        usesSelectableSections ? selectedSectionsOrdered : [],
        "markdown"
      );
      const blob = await response.blob();

      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = /filename="([^"]+)"/i.exec(disposition);
      const fallback = `specpilot-${mode}.md`;
      const filename = filenameMatch?.[1] ?? fallback;

      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);

      toast.success("Markdown file downloaded.");
    } catch (error) {
      console.error("Failed to download markdown export:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download markdown export.");
    } finally {
      setBusyAction(null);
    }
  }

  function openPdfEntryPoint(): void {
    const searchParams = new URLSearchParams();
    searchParams.set("mode", mode);
    if (usesSelectableSections && selectedSectionsOrdered.length > 0) {
      searchParams.set("sections", selectedSectionsOrdered.join(","));
    }

    const printUrl = `/specs/${specId}/print?${searchParams.toString()}`;
    const popup = window.open(printUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      toast.error("Could not open print view. Check browser popup settings.");
      return;
    }

    toast.success("Opened print view. Use Print to save as PDF.");
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <article className={cn("space-y-3 rounded-xl border bg-card shadow-sm", compact ? "p-3" : "p-4")}>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Handoff</h2>
          <p className="text-xs text-muted-foreground">Copy or export execution-ready output from the canonical export path.</p>
          <p className="text-xs text-slate-500">
            Mode: {MODE_LABELS[mode]} | {usesSelectableSections ? `Sections: ${selectedSectionsOrdered.length}` : "Fixed prompt"}
          </p>
          {effectiveDisabledReason ? <p className="text-xs text-amber-700">{effectiveDisabledReason}</p> : null}
        </div>

        <div className={cn("grid gap-2 sm:grid-cols-2")}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyFullPlan}
            disabled={isActionDisabled}
            className={cn("w-full justify-center whitespace-nowrap", compact && "px-2 text-xs")}
          >
            {busyAction === "copy_full" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clipboard className="mr-2 h-4 w-4" />}
            {busyAction === "copy_full" ? "Copying..." : usesSelectableSections ? "Copy Full Plan" : "Copy Prompt"}
          </Button>
          {usesSelectableSections ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copySelectedSections}
              disabled={isActionDisabled}
              className={cn("w-full justify-center whitespace-nowrap", compact && "px-2 text-xs")}
            >
              {busyAction === "copy_selected" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardList className="mr-2 h-4 w-4" />}
              {busyAction === "copy_selected" ? "Copying..." : "Copy Selected"}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={downloadMarkdown}
            disabled={isActionDisabled}
            className={cn("w-full justify-center whitespace-nowrap", compact && "px-2 text-xs")}
          >
            {busyAction === "download_markdown" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {busyAction === "download_markdown" ? "Downloading..." : "Export Markdown"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openPdfEntryPoint}
            disabled={isActionDisabled}
            className={cn("w-full justify-center whitespace-nowrap", compact && "px-2 text-xs")}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Open PDF View
          </Button>
        </div>
      </article>

      {compact ? (
        <article className="rounded-xl border bg-card p-3 shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-1 py-0.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => setIsOptionsOpen((current) => !current)}
            aria-expanded={isOptionsOpen}
            aria-controls="spec-export-options-panel"
          >
            <span>Export Options</span>
            <ChevronDown
              className={cn("h-4 w-4 text-slate-500 transition-transform duration-200", isOptionsOpen && "rotate-180")}
            />
          </button>
          {isOptionsOpen ? (
            <div id="spec-export-options-panel" className="mt-3">
              <SpecExportOptions
                mode={mode}
                selectedSections={selectedSectionsOrdered}
                disabled={isControlsDisabled}
                compact
                onModeChange={handleModeChange}
                onToggleSection={handleToggleSection}
                onSelectAll={handleSelectAll}
                onResetToModeDefaults={handleResetDefaults}
              />
            </div>
          ) : null}
        </article>
      ) : (
        <SpecExportOptions
          mode={mode}
          selectedSections={selectedSectionsOrdered}
          disabled={isControlsDisabled}
          onModeChange={handleModeChange}
          onToggleSection={handleToggleSection}
          onSelectAll={handleSelectAll}
          onResetToModeDefaults={handleResetDefaults}
        />
      )}
    </div>
  );
}
