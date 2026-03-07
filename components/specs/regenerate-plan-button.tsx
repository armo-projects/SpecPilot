"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ApiErrorResponse, GenerateSpecApiResponse } from "@/types/spec";

type RegeneratePlanButtonProps = {
  specId: string;
  disabled?: boolean;
};

export function RegeneratePlanButton({ specId, disabled = false }: RegeneratePlanButtonProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegenerate(): Promise<void> {
    setErrorMessage(null);
    setIsRunning(true);
    const toastId = toast.loading("Generating a new plan version...");

    try {
      const response = await fetch(`/api/specs/${specId}/generate`, {
        method: "POST"
      });

      const data = (await response.json()) as GenerateSpecApiResponse | ApiErrorResponse;
      if (!response.ok) {
        const message = "error" in data ? data.error : "Failed to regenerate.";
        setErrorMessage(message);
        toast.error(message, { id: toastId });
        return;
      }

      if ("generation" in data && !data.generation.ok) {
        const message = data.generation.error?.message ?? "Generation failed.";
        setErrorMessage(message);
        toast.error(message, { id: toastId });
      } else if ("generation" in data) {
        toast.success(`Plan regenerated (v${data.generation.planVersion}).`, { id: toastId });
      }

      router.refresh();
    } catch (error) {
      console.error("Regeneration failed:", error);
      const message = "Request failed. Please try again.";
      setErrorMessage(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" onClick={handleRegenerate} disabled={disabled || isRunning}>
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Regenerate Plan
          </>
        )}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
