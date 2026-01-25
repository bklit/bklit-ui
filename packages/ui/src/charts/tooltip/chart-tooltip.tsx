"use client";

import { motion, useSpring } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { chartCssVars, useChart } from "../chart-context";
import { DateTicker } from "./date-ticker";
import { TooltipContent, type TooltipRow } from "./tooltip-content";
import { TooltipDot } from "./tooltip-dot";
import { TooltipIndicator } from "./tooltip-indicator";

// Spring configs
const springConfig = { stiffness: 100, damping: 20 };
const crosshairSpringConfig = { stiffness: 300, damping: 30 };

export interface ChartTooltipProps {
  /** Whether to show the date pill at bottom. Default: true */
  showDatePill?: boolean;
  /** Whether to show the vertical crosshair line. Default: true */
  showCrosshair?: boolean;
  /** Whether to show dots on the lines. Default: true */
  showDots?: boolean;
  /** Custom content renderer for the tooltip box */
  content?: (props: {
    point: Record<string, unknown>;
    index: number;
  }) => React.ReactNode;
  /** Custom row renderer - return array of TooltipRow */
  rows?: (point: Record<string, unknown>) => TooltipRow[];
  /** Additional content to show below rows (e.g., markers) */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function ChartTooltip({
  showDatePill = true,
  showCrosshair = true,
  showDots = true,
  content,
  rows: rowsRenderer,
  children,
  className = "",
}: ChartTooltipProps) {
  const {
    tooltipData,
    width,
    innerHeight,
    margin,
    columnWidth,
    lines,
    xAccessor,
    dateLabels,
    containerRef,
  } = useChart();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipWidth, setTooltipWidth] = useState(180);
  const [mounted, setMounted] = useState(false);

  // Only render portals on client side after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure tooltip width
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const w = tooltipRef.current.offsetWidth;
      if (w > 0 && w !== tooltipWidth) {
        setTooltipWidth(w);
      }
    }
  }, [tooltipWidth]);

  // Calculate tooltip position
  const tooltipOffset = 16;
  const visible = tooltipData !== null;
  const x = tooltipData?.x ?? 0;
  const xWithMargin = x + margin.left;

  const shouldFlip = xWithMargin + tooltipWidth + tooltipOffset > width;
  const targetX = shouldFlip
    ? xWithMargin - tooltipOffset - tooltipWidth
    : xWithMargin + tooltipOffset;

  // Track flip state for animation
  const prevFlipRef = useRef(shouldFlip);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (prevFlipRef.current !== shouldFlip) {
      setFlipKey((k) => k + 1);
      prevFlipRef.current = shouldFlip;
    }
  }, [shouldFlip]);

  // Animated positions
  const animatedLeft = useSpring(targetX, springConfig);
  const animatedX = useSpring(xWithMargin, crosshairSpringConfig);

  useEffect(() => {
    animatedLeft.set(targetX);
  }, [targetX, animatedLeft]);

  useEffect(() => {
    animatedX.set(xWithMargin);
  }, [xWithMargin, animatedX]);

  // Generate rows from lines
  const tooltipRows = useMemo(() => {
    if (!tooltipData) {
      return [];
    }

    if (rowsRenderer) {
      return rowsRenderer(tooltipData.point);
    }

    // Default: generate rows from registered lines
    return lines.map((line) => ({
      color: line.stroke,
      label: line.dataKey,
      value: (tooltipData.point[line.dataKey] as number) ?? 0,
    }));
  }, [tooltipData, lines, rowsRenderer]);

  // Title from date
  const title = tooltipData
    ? xAccessor(tooltipData.point).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : undefined;

  const transformOrigin = shouldFlip ? "right top" : "left top";

  // Use portal to render into the chart container
  // Only render after mount on client side
  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  // Dynamic import to avoid SSR issues
  const { createPortal } = require("react-dom") as typeof import("react-dom");

  const tooltipContent = (
    <>
      {/* Crosshair indicator - rendered as SVG overlay */}
      {showCrosshair && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          height="100%"
          width="100%"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            <TooltipIndicator
              colorEdge={chartCssVars.crosshair}
              colorMid={chartCssVars.crosshair}
              columnWidth={columnWidth}
              fadeEdges
              height={innerHeight}
              visible={visible}
              width="line"
              x={x}
            />

            {/* Dots on lines */}
            {showDots &&
              lines.map((line) => (
                <TooltipDot
                  color={line.stroke}
                  key={line.dataKey}
                  strokeColor={chartCssVars.background}
                  visible={visible}
                  x={x}
                  y={tooltipData?.yPositions[line.dataKey] ?? 0}
                />
              ))}
          </g>
        </svg>
      )}

      {/* Tooltip Box - HTML */}
      {visible && (
        <motion.div
          animate={{ opacity: 1 }}
          className={cn("pointer-events-none absolute top-10 z-50", className)}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          ref={tooltipRef}
          style={{ left: animatedLeft }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="min-w-[140px] overflow-hidden rounded-lg bg-zinc-900/30 text-white shadow-lg backdrop-blur-md"
            initial={{ scale: 0.85, opacity: 0, x: shouldFlip ? 20 : -20 }}
            key={flipKey}
            style={{ transformOrigin }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {content ? (
              content({
                point: tooltipData.point,
                index: tooltipData.index,
              })
            ) : (
              <TooltipContent rows={tooltipRows} title={title}>
                {children}
              </TooltipContent>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Date Ticker at bottom */}
      {showDatePill && dateLabels.length > 0 && visible && (
        <motion.div
          className="pointer-events-none absolute z-50"
          style={{
            left: animatedX,
            x: "-50%",
            bottom: 4,
          }}
        >
          <DateTicker
            currentIndex={tooltipData?.index ?? 0}
            labels={dateLabels}
            visible={visible}
          />
        </motion.div>
      )}
    </>
  );

  return createPortal(tooltipContent, container);
}

ChartTooltip.displayName = "ChartTooltip";

export default ChartTooltip;
