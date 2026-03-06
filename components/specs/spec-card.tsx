import Link from "next/link";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import type { SpecListItem } from "@/types/spec";

type SpecCardProps = {
  spec: SpecListItem;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export function SpecCard({ spec }: SpecCardProps) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Link href={`/specs/${spec.id}`} className="line-clamp-2 text-base font-semibold tracking-tight hover:underline">
          {spec.title}
        </Link>
        <SpecStatusBadge status={spec.status} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <SpecPriorityBadge priority={spec.priority} />
        {spec.latestPlan ? (
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600">
            Plan v{spec.latestPlan.version}
          </span>
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600">
            No plan yet
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">Updated {formatDate(spec.updatedAt)}</p>
    </article>
  );
}
