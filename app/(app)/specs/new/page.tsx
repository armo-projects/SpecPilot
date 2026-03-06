import Link from "next/link";
import { CreateSpecForm } from "@/components/specs/create-spec-form";

export default function NewSpecPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>{" "}
          / New Spec
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Create New Spec</h1>
        <p className="text-sm text-muted-foreground">
          Add a title and product request. AI planning output will be generated in Phase 4.
        </p>
      </div>
      <CreateSpecForm />
    </section>
  );
}
