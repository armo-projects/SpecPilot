import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpecNotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border bg-card p-10 text-center shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Spec Not Found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This spec does not exist, or it is not available for the current user context.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/specs/new">Create New Spec</Link>
        </Button>
      </div>
    </section>
  );
}
