import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/90">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-base font-semibold tracking-tight">SpecPilot</span>
          <Button asChild size="sm">
            <Link href="/dashboard">Open App</Link>
          </Button>
        </div>
      </header>

      <section className="container py-24">
        <p className="mb-4 inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground">
          AI Planning Assistant
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn raw feature requests into structured technical execution plans.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          SpecPilot converts product tickets into implementation-ready specs with requirements, tasks, schema
          suggestions, endpoints, edge cases, tests, and risks.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/dashboard">Start Building Specs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
