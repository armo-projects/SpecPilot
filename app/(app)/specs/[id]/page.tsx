import Link from "next/link";
import { notFound } from "next/navigation";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { UpdateSpecForm } from "@/components/specs/update-spec-form";
import { Button } from "@/components/ui/button";
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

  return (
    <section className="mx-auto max-w-4xl space-y-6">
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
        <Button asChild>
          <Link href="/specs/new">New Spec</Link>
        </Button>
      </div>

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

        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-base font-semibold">Plan Output</h2>
          {spec.latestPlan ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Latest version: v{spec.latestPlan.version}</p>
              <p className="text-sm text-slate-700">{spec.latestPlan.summary}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No generated plan yet. Phase 4 will add AI generation and structured plan sections.
            </p>
          )}
        </article>

        <UpdateSpecForm spec={spec} />
      </div>
    </section>
  );
}
