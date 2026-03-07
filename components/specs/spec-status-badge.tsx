import { cn } from "@/lib/utils";
import type { SpecStatus } from "@/types/domain";

const STATUS_LABELS: Record<SpecStatus, string> = {
  DRAFT: "Draft",
  GENERATING: "Generating",
  COMPLETED: "Completed",
  FAILED: "Failed"
};

const STATUS_CLASSES: Record<SpecStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-100/80 text-slate-700",
  GENERATING: "border-blue-200 bg-blue-100/80 text-blue-700",
  COMPLETED: "border-emerald-200 bg-emerald-100/80 text-emerald-700",
  FAILED: "border-red-200 bg-red-100/80 text-red-700"
};

type SpecStatusBadgeProps = {
  status: SpecStatus;
};

export function SpecStatusBadge({ status }: SpecStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        STATUS_CLASSES[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status === "GENERATING" ? "animate-pulse" : "")} />
      {STATUS_LABELS[status]}
    </span>
  );
}
