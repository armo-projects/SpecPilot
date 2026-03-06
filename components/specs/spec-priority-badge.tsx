import { cn } from "@/lib/utils";
import type { SpecPriority } from "@/types/domain";

const PRIORITY_LABELS: Record<SpecPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

const PRIORITY_CLASSES: Record<SpecPriority, string> = {
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  HIGH: "bg-rose-100 text-rose-700 border-rose-200"
};

type SpecPriorityBadgeProps = {
  priority: SpecPriority;
};

export function SpecPriorityBadge({ priority }: SpecPriorityBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", PRIORITY_CLASSES[priority])}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
