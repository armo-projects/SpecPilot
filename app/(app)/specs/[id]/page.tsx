import Link from "next/link";
import { notFound } from "next/navigation";
import { RegeneratePlanButton } from "@/components/specs/regenerate-plan-button";
import { SpecPlanSections } from "@/components/specs/spec-plan-sections";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { UpdateSpecForm } from "@/components/specs/update-spec-form";
import { Button } from "@/components/ui/button";
import { getSpecForMockUser } from "@/server/services/specs.service";

type SpecDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

export default async function SpecDetailPage({ params }: SpecDetailPageProps) {
  const { id } = await params;
  const spec = await getSpecForMockUser(id);

  if (!spec) {
    notFound();
  }

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
          <RegeneratePlanButton specId={spec.id} />
          <Button asChild variant="outline">
            <Link href="/specs/new">New Spec</Link>
          </Button>
        </div>
      </div>

      {spec.latestGenerationRun?.status === "FAILED" ? (
        <article className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Generation failed</p>
          <p className="mt-1">
            {spec.latestGenerationRun.errorMessage ?? "The model response could not be validated. Please regenerate."}
          </p>
        </article>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold">Product Request</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{spec.rawPrompt}</p>
          </article>

          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold">Additional Context</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {spec.context ? spec.context : "No additional context provided."}
            </p>
          </article>

          {spec.latestPlanData ? (
            <SpecPlanSections plan={spec.latestPlanData} />
          ) : (
            <article className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-2 text-base font-semibold">Plan Output</h2>
              <p className="text-sm text-muted-foreground">
                No generated plan yet. Click <span className="font-medium">Regenerate Plan</span> to create one.
              </p>
            </article>
          )}

          <UpdateSpecForm spec={spec} />
        </div>

        <aside className="space-y-5">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Plan Versions</h3>
            {spec.planVersions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No versions yet.</p>
            ) : (
              <ul className="space-y-2">
                {spec.planVersions.map((version) => (
                  <li key={version.id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium text-slate-900">v{version.version}</p>
                    <p className="line-clamp-2 text-slate-600">{version.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(version.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Latest Generation</h3>
            {spec.latestGenerationRun ? (
              <div className="space-y-1 text-sm text-slate-700">
                <p>Status: {spec.latestGenerationRun.status}</p>
                <p>Started: {formatDate(spec.latestGenerationRun.startedAt)}</p>
                <p>
                  Finished:{" "}
                  {spec.latestGenerationRun.finishedAt ? formatDate(spec.latestGenerationRun.finishedAt) : "Not finished"}
                </p>
                <p>Tokens: {spec.latestGenerationRun.tokensUsed ?? "Unknown"}</p>
                <p>Latency: {spec.latestGenerationRun.latencyMs ?? "Unknown"} ms</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No generation runs yet.</p>
            )}
          </article>
        </aside>
      </div>
    </section>
  );
}
