"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useHeatmap } from "./heatmap-context";

export interface HeatmapXAxisProps {
  /** Additional class name for labels */
  className?: string;
}

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });

export const HeatmapXAxis = memo(function HeatmapXAxis({
  className,
}: HeatmapXAxisProps) {
  const { containerRef, data, margin, binWidth, xScale } = useHeatmap();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels = useMemo(() => {
    const ticks: { label: string; x: number; key: string }[] = [];
    let lastMonth = -1;

    for (let columnIndex = 0; columnIndex < data.length; columnIndex++) {
      const firstDate = data[columnIndex]?.bins[0]?.date;
      if (!firstDate) {
        continue;
      }

      const month = firstDate.getMonth();
      if (month === lastMonth) {
        continue;
      }

      ticks.push({
        label: monthFmt.format(firstDate),
        x: margin.left + xScale(columnIndex) + binWidth / 2,
        key: `${columnIndex}-${month}`,
      });
      lastMonth = month;
    }

    return ticks;
  }, [binWidth, data, margin.left, xScale]);

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  return createPortal(
    labels.map((tick) => (
      <div
        className="pointer-events-none absolute top-0"
        key={tick.key}
        style={{
          left: tick.x,
          width: 0,
          display: "flex",
          justifyContent: "center",
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

HeatmapXAxis.displayName = "HeatmapXAxis";

export default HeatmapXAxis;
