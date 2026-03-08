import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { SpecHandoffActions } from "@/components/specs/spec-handoff-actions";
import { RegeneratePlanButton } from "@/components/specs/regenerate-plan-button";
import { SpecPlanSections } from "@/components/specs/spec-plan-sections";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { UpdateSpecForm } from "@/components/specs/update-spec-form";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { getSpecForMockUser } from "@/server/services/specs.service";

type SpecDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpecDetailPage({ params }: SpecDetailPageProps) {
  const { id } = await params;
  const spec = await getSpecForMockUser(id);

  if (!spec) {
    notFound();
  }

  const isGenerating = spec.status === "GENERATING";
  const generationFailed = spec.latestGenerationRun?.status === "FAILED";
  const hasVersionHistory = spec.planVersions.length > 0;
  const hasExportablePlan = Boolean(spec.latestPlanData);
  const exportDisabledReason = isGenerating
    ? "Handoff actions are disabled while generation is running."
    : !hasExportablePlan
      ? "Generate a plan to enable copy/export actions."
      : null;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>{" "}
            / Spec
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{spec.title}</h1>
          <div className="flex items-center gap-2">
            <SpecStatusBadge status={spec.status} />
            <SpecPriorityBadge priority={spec.priority} />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <RegeneratePlanButton specId={spec.id} disabled={isGenerating} />
          <Button asChild variant="outline">
            <Link href="/specs/new">New Spec</Link>
          </Button>
        </div>
      </div>

      {isGenerating ? (
        <article className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <Loader2 className="mt-0.5 h-4 w-4 animate-spin" />
            <div>
              <p className="font-semibold">Generation in progress</p>
              <p className="mt-1">A new plan version is being generated. The page will update after completion.</p>
            </div>
          </div>
        </article>
      ) : null}

      {generationFailed ? (
        <article className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">Generation failed</p>
              <p className="mt-1">
                {spec.latestGenerationRun?.errorMessage ?? "The model response could not be validated."} Use
                <span className="font-medium"> Regenerate Plan</span> to retry.
              </p>
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold tracking-tight">Spec Document</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unified execution document generated from this request and latest plan output.
            </p>
            <div className="mt-5 space-y-5">
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

              {spec.latestPlanData ? (
                <SpecPlanSections plan={spec.latestPlanData} variant="document" />
              ) : (
                <section className="space-y-2 rounded-lg border bg-slate-50/70 p-4">
                  <h3 className="text-base font-semibold">Plan Output</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasVersionHistory
                      ? "A plan version exists but could not be rendered safely. Regenerate to create a clean version."
                      : "No generated plan yet. Click Regenerate Plan to create the first version."}
                  </p>
                </section>
              )}
            </div>
          </article>

          <UpdateSpecForm spec={spec} disabled={isGenerating} />
        </div>

        <aside className="space-y-5">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Plan Versions</h3>
            {spec.planVersions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No versions yet.</p>
            ) : (
              <ul className="space-y-2">
                {spec.planVersions.map((version, index) => (
                  <li
                    key={version.id}
                    className={`rounded-md border p-3 text-sm ${index === 0 ? "border-blue-200 bg-blue-50" : "bg-white"}`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">v{version.version}</p>
                      {index === 0 ? (
                        <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[11px] text-blue-700">
                          Latest
                        </span>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-slate-600">{version.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(version.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Latest Generation</h3>
            {spec.latestGenerationRun ? (
              <dl className="space-y-1 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium">{spec.latestGenerationRun.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Started</dt>
                  <dd>{formatDateTime(spec.latestGenerationRun.startedAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Finished</dt>
                  <dd>{spec.latestGenerationRun.finishedAt ? formatDateTime(spec.latestGenerationRun.finishedAt) : "Not finished"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Tokens</dt>
                  <dd>{spec.latestGenerationRun.tokensUsed ?? "Unknown"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Latency</dt>
                  <dd>{spec.latestGenerationRun.latencyMs ?? "Unknown"} ms</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No generation runs yet.</p>
            )}
          </article>

          <SpecHandoffActions
            specId={spec.id}
            disabled={isGenerating || !hasExportablePlan}
            disabledReason={exportDisabledReason}
            compact
          />
        </aside>
      </div>
    </section>
  );
}
