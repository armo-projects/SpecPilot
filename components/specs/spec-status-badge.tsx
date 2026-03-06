import { cn } from "@/lib/utils";
import type { SpecStatus } from "@/types/domain";

const STATUS_LABELS: Record<SpecStatus, string> = {
  DRAFT: "Draft",
  GENERATING: "Generating",
  COMPLETED: "Completed",
  FAILED: "Failed"
};

const STATUS_CLASSES: Record<SpecStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  GENERATING: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  FAILED: "bg-red-100 text-red-700 border-red-200"
};

type SpecStatusBadgeProps = {
  status: SpecStatus;
};

export function SpecStatusBadge({ status }: SpecStatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
