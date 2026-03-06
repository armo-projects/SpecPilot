import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpecCard } from "@/components/specs/spec-card";
import { listSpecsForMockUser } from "@/server/services/specs.service";

export default async function DashboardPage() {
  const specs = await listSpecsForMockUser();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Specs Dashboard</h1>
          <p className="text-sm text-muted-foreground">Create and track technical planning specs.</p>
        </div>
        <Button asChild>
          <Link href="/specs/new">New Spec</Link>
        </Button>
      </div>

      {specs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold">No specs yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start by creating your first product or feature request.</p>
          <div className="mt-5">
            <Button asChild>
              <Link href="/specs/new">Create Spec</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} />
          ))}
        </div>
      )}
    </section>
  );
}
