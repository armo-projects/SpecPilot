"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="text-lg font-semibold text-red-900">Could not load dashboard</h1>
      <p className="mt-2 text-sm text-red-700">Please try again. If the issue continues, check the server logs.</p>
      <div className="mt-5 flex justify-center">
        <Button type="button" onClick={reset}>
          Retry
        </Button>
      </div>
    </section>
  );
}
