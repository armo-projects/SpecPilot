import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardSpecsPanel } from "@/components/specs/dashboard-specs-panel";
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

      <DashboardSpecsPanel specs={specs} />
    </section>
  );
}
