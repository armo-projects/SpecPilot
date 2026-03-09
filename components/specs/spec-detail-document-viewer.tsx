"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SpecMarkdownContent } from "@/components/specs/spec-markdown-content";
import { SpecPlanSections } from "@/components/specs/spec-plan-sections";
import type { SpecDetail } from "@/types/spec";

type DocumentView = "human" | "codex";

type SpecDetailDocumentViewerProps = {
  spec: Pick<SpecDetail, "rawPrompt" | "context" | "latestPlanData">;
  className?: string;
};

function ToggleButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function SpecDetailDocumentViewer({ spec, className }: SpecDetailDocumentViewerProps) {
  const [view, setView] = useState<DocumentView>("human");
  const codexMarkdown = spec.latestPlanData?.codexReadyArtifact?.markdown ?? null;
  const canShowCodexPrompt = typeof codexMarkdown === "string" && codexMarkdown.trim().length > 0;

  return (
    <div className={cn("space-y-5", className)}>
      <section className="space-y-2 rounded-lg border bg-slate-50/70 p-4">
        <h3 className="text-base font-semibold">Product Request</h3>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{spec.rawPrompt}</p>
      </section>

      <section className="space-y-2 rounded-lg border bg-slate-50/70 p-4">
        <h3 className="text-base font-semibold">Additional Context</h3>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {spec.context ? spec.context : "No additional context provided."}
        </p>
      </section>

      {canShowCodexPrompt ? (
        <div className="inline-flex items-center gap-1 rounded-lg border bg-slate-100 p-1">
          <ToggleButton label="Human Spec" active={view === "human"} onClick={() => setView("human")} />
          <ToggleButton label="Codex Prompt" active={view === "codex"} onClick={() => setView("codex")} />
        </div>
      ) : null}

      {spec.latestPlanData ? (
        view === "codex" && canShowCodexPrompt ? (
          <article className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Codex Prompt</h3>
                <p className="text-sm text-muted-foreground">
                  Artifact-backed coding-agent prompt rendered from the latest plan version.
                </p>
              </div>
            </div>
            <SpecMarkdownContent markdown={codexMarkdown} className="prose prose-slate max-w-none text-sm" />
          </article>
        ) : (
          <SpecPlanSections plan={spec.latestPlanData} variant="document" />
        )
      ) : (
        <section className="space-y-2 rounded-lg border bg-slate-50/70 p-4">
          <h3 className="text-base font-semibold">Plan Output</h3>
          <p className="text-sm text-muted-foreground">
            No generated plan yet. Click Regenerate Plan to create the first version.
          </p>
        </section>
      )}
    </div>
  );
}
