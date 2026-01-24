"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { chartCssVars, useChart } from "./chart-context";

export interface XAxisProps {
  /** Number of ticks to show. Default: 6 */
  numTicks?: number;
  /** Width of the date ticker box for fade calculation. Default: 50 */
  tickerHalfWidth?: number;
}

interface XAxisLabelProps {
  label: string;
  x: number;
  crosshairX: number | null;
  isHovering: boolean;
  tickerHalfWidth: number;
}

function XAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}: XAxisLabelProps) {
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

  return (
    <motion.div
      animate={{ opacity }}
      className="absolute whitespace-nowrap text-xs"
      initial={{ opacity: 1 }}
      style={{
        left: x,
        bottom: 12,
        transform: "translateX(-50%)",
        color: chartCssVars.foregroundMuted,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {label}
    </motion.div>
  );
}

export function XAxis({ numTicks = 6, tickerHalfWidth = 50 }: XAxisProps) {
  const { xScale, margin, tooltipData, containerRef } = useChart();
  const [mounted, setMounted] = useState(false);

  // Only render on client side after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const labelsToShow = useMemo(() => {
    const tickValues = xScale.ticks(numTicks);

    return tickValues.map((date) => ({
      date,
      x: (xScale(date) ?? 0) + margin.left,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [xScale, margin.left, numTicks]);

  const isHovering = tooltipData !== null;
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null;

  // Use portal to render into the chart container
  // Only render after mount on client side
  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  // Dynamic import to avoid SSR issues
  const { createPortal } = require("react-dom") as typeof import("react-dom");

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <XAxisLabel
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
}

XAxis.displayName = "XAxis";

export default XAxis;
