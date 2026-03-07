import { cn } from "@/lib/utils";
import type { SpecPriority } from "@/types/domain";

const PRIORITY_LABELS: Record<SpecPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

const PRIORITY_CLASSES: Record<SpecPriority, string> = {
  LOW: "border-emerald-200 bg-emerald-100/80 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-100/80 text-amber-700",
  HIGH: "border-rose-200 bg-rose-100/80 text-rose-700"
};

type SpecPriorityBadgeProps = {
  priority: SpecPriority;
};

export function SpecPriorityBadge({ priority }: SpecPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        PRIORITY_CLASSES[priority]
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
