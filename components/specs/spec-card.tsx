import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { formatRelativeTime } from "@/lib/format";
import type { SpecListItem } from "@/types/spec";

type SpecCardProps = {
  spec: SpecListItem;
};

export function SpecCard({ spec }: SpecCardProps) {
  return (
    <article className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/specs/${spec.id}`}
            className="line-clamp-2 text-base font-semibold tracking-tight text-slate-900 hover:underline"
          >
            {spec.title}
          </Link>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            Updated {formatRelativeTime(spec.updatedAt)}
          </p>
        </div>
        <SpecStatusBadge status={spec.status} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SpecPriorityBadge priority={spec.priority} />
        {spec.latestPlan ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
            Plan v{spec.latestPlan.version}
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            No plan yet
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="line-clamp-2 min-h-10 text-sm text-slate-600">
          {spec.latestPlan?.summary ?? "This spec has not been generated yet. Open it to generate the first plan."}
        </p>
        <Link
          href={`/specs/${spec.id}`}
          className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
