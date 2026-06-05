"use client";

import { ShimmeringText } from "@/components/shimmering-text";
import { cn } from "@/lib/utils";

export interface ChartLoadingLabelProps {
  /** Label shown centered over the chart. */
  text?: string;
  className?: string;
}

export function ChartLoadingLabel({
  text = "Loading",
  className,
}: ChartLoadingLabelProps) {
  if (!text.trim()) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className
      )}
      role="status"
    >
      <ShimmeringText
        className="font-medium text-sm tracking-wide [--color:var(--muted-foreground)] [--shimmering-color:var(--foreground)]"
        text={text}
      />
    </div>
  );
}

export default ChartLoadingLabel;
