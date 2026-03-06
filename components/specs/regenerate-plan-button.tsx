"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ApiErrorResponse, GenerateSpecApiResponse } from "@/types/spec";

type RegeneratePlanButtonProps = {
  specId: string;
};

export function RegeneratePlanButton({ specId }: RegeneratePlanButtonProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegenerate(): Promise<void> {
    setErrorMessage(null);
    setIsRunning(true);

    try {
      const response = await fetch(`/api/specs/${specId}/generate`, {
        method: "POST"
      });

      const data = (await response.json()) as GenerateSpecApiResponse | ApiErrorResponse;
      if (!response.ok) {
        setErrorMessage("error" in data ? data.error : "Failed to regenerate.");
        return;
      }

      if ("generation" in data && !data.generation.ok) {
        setErrorMessage(data.generation.error?.message ?? "Generation failed.");
      }

      router.refresh();
    } catch (error) {
      console.error("Regeneration failed:", error);
      setErrorMessage("Request failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" onClick={handleRegenerate} disabled={isRunning}>
        {isRunning ? "Generating..." : "Regenerate Plan"}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
