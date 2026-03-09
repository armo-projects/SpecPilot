"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SpecPriorityBadge } from "@/components/specs/spec-priority-badge";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import type { ApiErrorResponse, SpecListItem } from "@/types/spec";

type SpecCardProps = {
  spec: SpecListItem;
};

function statusAccentClass(status: SpecListItem["status"]): string {
  switch (status) {
    case "COMPLETED":
      return "from-emerald-400/50 to-emerald-200/10";
    case "GENERATING":
      return "from-blue-400/50 to-blue-200/10";
    case "FAILED":
      return "from-red-400/50 to-red-200/10";
    case "DRAFT":
    default:
      return "from-slate-400/50 to-slate-200/10";
  }
}

function stopCardNavigation(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof (payload as ApiErrorResponse).error === "string") {
    return (payload as ApiErrorResponse).error;
  }

  return fallback;
}

export function SpecCard({ spec }: SpecCardProps) {
  const router = useRouter();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleCardLinkKeyDown(event: KeyboardEvent<HTMLAnchorElement>): void {
    if (event.key === " ") {
      event.preventDefault();
      router.push(`/specs/${spec.id}`);
    }
  }

  function startDelete(event: MouseEvent<HTMLButtonElement>): void {
    stopCardNavigation(event);
    setIsConfirmingDelete(true);
  }

  function cancelDelete(event: MouseEvent<HTMLButtonElement>): void {
    stopCardNavigation(event);
    if (isDeleting) {
      return;
    }
    setIsConfirmingDelete(false);
  }

  async function confirmDelete(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    stopCardNavigation(event);
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/specs/${spec.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        throw new Error(readErrorMessage(payload, "Failed to delete spec."));
      }

      toast.success("Spec deleted.");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete spec:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete spec.");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${statusAccentClass(spec.status)}`}
      />
      <Link
        href={`/specs/${spec.id}`}
        aria-label={`Open spec ${spec.title}`}
        onKeyDown={handleCardLinkKeyDown}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />

      <div className="relative z-0 mb-3 flex items-start justify-between gap-3 pt-1">
        <div className="min-w-0 space-y-1">
          <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-slate-900">{spec.title}</h2>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            Updated {formatRelativeTime(spec.updatedAt)}
          </p>
        </div>
        <SpecStatusBadge status={spec.status} />
      </div>

      <div className="relative z-0 mb-4 flex flex-wrap items-center gap-2">
        <SpecPriorityBadge priority={spec.priority} />
        {spec.latestPlan ? (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
            Plan v{spec.latestPlan.version}
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            No plan yet
          </span>
        )}
      </div>

      <div className="relative z-0 min-h-14">
        <p className="line-clamp-2 text-sm text-slate-600">
          {spec.latestPlan?.summary ?? "This spec has not been generated yet. Generate the first plan from the detail page."}
        </p>
      </div>

      <div className="relative z-20 mt-4 border-t border-slate-200/80 pt-3">
        {isConfirmingDelete ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200/70 bg-red-50/50 p-2">
            <p className="text-xs text-red-700">Delete this spec permanently?</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="h-8 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="h-8 bg-red-600 px-2 text-xs text-white hover:bg-red-700 focus-visible:ring-red-500"
              >
                {isDeleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={startDelete}
            disabled={isDeleting}
            className="h-8 px-2 text-xs text-slate-600"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete spec
          </Button>
        )}
      </div>
    </article>
  );
}
