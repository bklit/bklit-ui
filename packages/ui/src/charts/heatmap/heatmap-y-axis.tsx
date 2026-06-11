"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useHeatmap } from "./heatmap-context";

export interface HeatmapYAxisProps {
  /** Additional class name for labels */
  className?: string;
}

const DAY_LABELS = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
] as const;

export const HeatmapYAxis = memo(function HeatmapYAxis({
  className,
}: HeatmapYAxisProps) {
  const { containerRef, margin, binHeight, gap, yScale } = useHeatmap();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels = useMemo(
    () =>
      DAY_LABELS.map((item) => ({
        ...item,
        y: margin.top + yScale(item.row) + (binHeight - gap) / 2,
      })),
    [binHeight, gap, margin.top, yScale]
  );

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  return createPortal(
    labels.map((tick) => (
      <div
        className="pointer-events-none absolute"
        key={tick.label}
        style={{
          top: tick.y,
          left: 4,
          width: Math.max(margin.left - 12, 0),
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          transform: "translateY(-50%)",
        }}
      >
        <span
          className={cn(
            "whitespace-nowrap text-chart-label text-xs",
            className
          )}
        >
          {tick.label}
        </span>
      </div>
    )),
    container
  );
});

HeatmapYAxis.displayName = "HeatmapYAxis";

export default HeatmapYAxis;
