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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SpecCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
