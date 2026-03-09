import { SpecCardSkeleton } from "@/components/specs/spec-card-skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-7 w-10 animate-pulse rounded bg-slate-200" />
          </article>
        ))}
      </div>

      <article className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-9 w-full max-w-md animate-pulse rounded bg-slate-200" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-7 w-16 animate-pulse rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SpecCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
