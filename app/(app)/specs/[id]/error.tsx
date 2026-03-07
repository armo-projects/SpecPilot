"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SpecDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SpecDetailError({ error, reset }: SpecDetailErrorProps) {
  useEffect(() => {
    console.error("Spec detail route error:", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
      <h1 className="text-lg font-semibold text-red-900">Failed to load this spec</h1>
      <p className="mt-2 text-sm text-red-700">
        Something went wrong while fetching detail data. Retry now, or return to dashboard.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </section>
  );
}
