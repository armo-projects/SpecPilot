import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecCard } from "@/components/specs/spec-card";
import { listSpecsForMockUser } from "@/server/services/specs.service";

export default async function DashboardPage() {
  const specs = await listSpecsForMockUser();

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Specs Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track requests, generated plans, and iteration history in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/specs/new">Create Spec</Link>
          </Button>
        </div>
      </div>

      {specs.length === 0 ? (
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {specs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} />
          ))}
        </div>
      )}
    </section>
  );
}
