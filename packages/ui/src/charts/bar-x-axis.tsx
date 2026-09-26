"use client";

import { motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useChart, useChartStable } from "./chart-context";
import {
  type ChartLabelCount,
  resolveResponsiveChartLabelCount,
} from "./responsive-chart-label-count";

export interface BarXAxisProps {
  /** Width of the date ticker box for fade calculation. Default: 50 */
  tickerHalfWidth?: number;
  /** Whether to show all labels or skip some for dense data. Default: false */
  showAllLabels?: boolean;
  /** Maximum number of labels to show. Supports responsive breakpoints. */
  maxLabels?: ChartLabelCount;
}

interface BarXAxisLabelProps {
  label: string;
  x: number;
  crosshairX: number | null;
  isHovering: boolean;
  tickerHalfWidth: number;
}

function BarXAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}: BarXAxisLabelProps) {
  const fadeBuffer = 20;
  const fadeRadius = tickerHalfWidth + fadeBuffer;

  let opacity = 1;
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX);
    if (distance < tickerHalfWidth) {
      opacity = 0;
    } else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer;
    }
  }

  // Zero-width container approach for perfect centering
  return (
    <div
      className="absolute"
      style={{
        left: x,
        bottom: 12,
        width: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.span
        animate={{ opacity }}
        className={cn("whitespace-nowrap text-chart-label text-xs")}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function BarXAxis(props: BarXAxisProps) {
  const { containerRef, barScale } = useChartStable();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  if (!barScale) {
    return null;
  }

  return <BarXAxisInner {...props} container={container} />;
}

const BarXAxisInner = memo(function BarXAxisInner({
  tickerHalfWidth = 50,
  showAllLabels = false,
  maxLabels = 12,
  container,
}: BarXAxisProps & { container: HTMLDivElement }) {
  const { margin, tooltipData, barScale, bandWidth, barXAccessor, data } =
    useChart();
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const resolvedMaxLabels = useMemo(
    () => resolveResponsiveChartLabelCount(maxLabels, viewportWidth, 12),
    [maxLabels, viewportWidth]
  );

  // Generate labels for each bar
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }

    const allLabels = data.map((d) => {
      const label = barXAccessor(d);
      const bandX = barScale(label) ?? 0;
      // Center the label under the bar group
      const x = bandX + bandWidth / 2 + margin.left;
      return { label, x };
    });

    // If showAllLabels is true or we have fewer than maxLabels, show all
    if (showAllLabels || allLabels.length <= resolvedMaxLabels) {
      return allLabels;
    }

    // Otherwise, distribute labels across the full range so both endpoints
    // remain visible and the chart does not appear to end with an empty tail.
    const labelCount = Math.max(2, resolvedMaxLabels);
    const visibleCount = Math.min(labelCount, allLabels.length);
    const lastIndex = allLabels.length - 1;
    const indices = Array.from({ length: visibleCount }, (_, index) =>
      Math.round((index * lastIndex) / (visibleCount - 1))
    );
    return [...new Set(indices)].map((index) => allLabels[index]!);
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    margin.left,
    showAllLabels,
    resolvedMaxLabels,
  ]);

  const isHovering = tooltipData !== null;
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null;

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <BarXAxisLabel
          crosshairX={crosshairX}
          isHovering={isHovering}
          key={`${item.label}-${item.x}`}
          label={item.label}
          tickerHalfWidth={tickerHalfWidth}
          x={item.x}
        />
      ))}
    </div>,
    container
  );
});

BarXAxis.displayName = "BarXAxis";

export default BarXAxis;
