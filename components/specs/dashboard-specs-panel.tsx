"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { SpecCard } from "@/components/specs/spec-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SpecStatus } from "@/types/domain";
import type { SpecListItem } from "@/types/spec";

type DashboardSpecsPanelProps = {
  specs: SpecListItem[];
};

type StatusFilter = "ALL" | SpecStatus;

const FILTERS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "GENERATING", label: "Generating" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" }
] as const;

export function DashboardSpecsPanel({ specs }: DashboardSpecsPanelProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const stats = useMemo(() => {
    const total = specs.length;
    const completed = specs.filter((spec) => spec.status === "COMPLETED").length;
    const draft = specs.filter((spec) => spec.status === "DRAFT").length;
    const withPlan = specs.filter((spec) => spec.latestPlan !== null).length;
    return { total, completed, draft, withPlan };
  }, [specs]);

  const filteredSpecs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return specs.filter((spec) => {
      if (statusFilter !== "ALL" && spec.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = `${spec.title} ${spec.latestPlan?.summary ?? ""}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query, specs, statusFilter]);

  if (specs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">No specs yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Start with a product ticket or feature request and let SpecPilot generate a structured implementation plan.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/specs/new">Create your first spec</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Specs" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="With Plan" value={stats.withPlan} />
      </div>

      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or summary..."
              className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  statusFilter === filter.value
                    ? "border-slate-300 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredSpecs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">No specs match your filters</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search term or status filter.</p>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
              }}
            >
              Reset filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSpecs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border bg-card px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}
