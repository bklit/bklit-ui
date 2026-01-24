"use client";

import { AnimatePresence, motion, useSpring } from "motion/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

// Spring config for smooth tooltip movement - matches dash array for consistency
const springConfig = { stiffness: 100, damping: 20 };

// Faster spring for crosshair/indicator - more responsive to mouse movement
const crosshairSpringConfig = { stiffness: 300, damping: 30 };

export interface TooltipRow {
  color: string;
  label: string;
  value: string | number;
}

export interface TooltipProps {
  /** X position in pixels relative to container */
  x: number;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Title/date shown in the tooltip header */
  title?: string;
  /** Data rows to display */
  rows: TooltipRow[];
  /** Container width for collision detection */
  containerWidth: number;
  /** Whether to show the date pill at bottom */
  showDatePill?: boolean;
  /** Current data index for the date ticker */
  currentIndex?: number;
  /** Array of formatted date labels for the ticker */
  dateLabels?: string[];
  /** Custom class name */
  className?: string;
  /** Optional marker content to append below rows */
  markerContent?: React.ReactNode;
}

// Tailwind h-6 = 24px - height of each item in the carousel
const TICKER_ITEM_HEIGHT = 24;

// Animated date ticker component - true carousel with all labels stacked
function DateTicker({
  currentIndex,
  labels,
  visible,
}: {
  currentIndex: number;
  labels: string[];
  visible: boolean;
}) {
  // Parse labels into month and day parts
  const parsedLabels = React.useMemo(() => {
    return labels.map((label) => {
      // Labels are formatted like "Jan 22" or "Dec 1"
      const parts = label.split(" ");
      const month = parts[0] || "";
      const day = parts[1] || "";
      return { month, day, full: label };
    });
  }, [labels]);

  // Get unique months and their indices
  const monthIndices = React.useMemo(() => {
    const uniqueMonths: string[] = [];
    const indices: number[] = [];

    parsedLabels.forEach((label, index) => {
      if (uniqueMonths.length === 0 || uniqueMonths.at(-1) !== label.month) {
        uniqueMonths.push(label.month);
        indices.push(index);
      }
    });

    return { uniqueMonths, indices };
  }, [parsedLabels]);

  // Find current month index (which unique month we're in)
  const currentMonthIndex = React.useMemo(() => {
    if (currentIndex < 0 || currentIndex >= parsedLabels.length) {
      return 0;
    }
    const currentLabel = parsedLabels[currentIndex];
    if (!currentLabel) {
      return 0;
    }
    const currentMonth = currentLabel.month;
    return monthIndices.uniqueMonths.indexOf(currentMonth);
  }, [currentIndex, parsedLabels, monthIndices]);

  // Track previous month index to detect changes (initialize with -1 to detect first render)
  const prevMonthIndexRef = React.useRef(-1);

  // Animated Y offset for day - always animates
  const dayY = useSpring(0, { stiffness: 400, damping: 35 });

  // Animated Y offset for month - only animates when month changes
  const monthY = useSpring(0, { stiffness: 400, damping: 35 });

  // Update day scroll position when index changes (always)
  React.useEffect(() => {
    dayY.set(-currentIndex * TICKER_ITEM_HEIGHT);
  }, [currentIndex, dayY]);

  // Update month scroll position only when month changes
  React.useEffect(() => {
    if (currentMonthIndex >= 0) {
      const isFirstRender = prevMonthIndexRef.current === -1;
      const monthChanged = prevMonthIndexRef.current !== currentMonthIndex;

      if (isFirstRender || monthChanged) {
        monthY.set(-currentMonthIndex * TICKER_ITEM_HEIGHT);
        prevMonthIndexRef.current = currentMonthIndex;
      }
    }
  }, [currentMonthIndex, monthY]);

  if (!visible || labels.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      // layout animates width changes smoothly
      layout
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 35 },
      }}
    >
      {/* Fixed height viewport that shows one item - h-6 = 24px */}
      <div className="relative h-6 overflow-hidden">
        {/* Container for month and day side by side */}
        <div className="flex items-center justify-center gap-1">
          {/* Month stack - only animates when month changes */}
          <div className="relative h-6 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: monthY }}>
              {monthIndices.uniqueMonths.map((month) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={month}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {month}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Day stack - always animates */}
          <div className="relative h-6 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: dayY }}>
              {parsedLabels.map((label, index) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={`${label.day}-${index}`}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {label.day}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Inner content component with height animation for dynamic marker content
function TooltipContent({
  title,
  rows,
  markerContent,
}: {
  title?: string;
  rows: TooltipRow[];
  markerContent?: React.ReactNode;
}) {
  const [measureRef, bounds] = useMeasure();

  // Generate a key based on whether marker content exists
  // This ensures AnimatePresence triggers when content changes
  const markerKey = markerContent ? "has-marker" : "no-marker";

  return (
    <motion.div
      animate={{ height: bounds.height || "auto" }}
      className="overflow-hidden"
              style={{ boxSizing: 'border-box' }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.8,
      }}
    >
      <div className="176
        " ref={measureRef}>
        {title && (
          <div className="mb-2 font-medium text-xs text-zinc-400">{title}</div>
        )}
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-4"
              key={`${row.label}-${row.color}`}
            >
        202
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-sm text-zinc-100">{row.label}</span>
              </div>
              <span className="font-medium text-sm text-white tabular-nums">
                {typeof row.value === "number"
                  ? row.value.toLocaleString()
                  : row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Animated marker content - fades in with blur */}
        <AnimatePresence mode="wait">
          {markerContent && (
            <motion.div
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="mt-2"
              exit={{ opacity: 0, filter: "blur(4px)" }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              key={markerKey}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              {markerContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ChartTooltip({
  x,
  visible,
  title,
  rows,
  containerWidth,
  showDatePill = true,
  currentIndex = 0,
  dateLabels = [],
  className = "",
  markerContent,
}: TooltipProps) {
  // Ref to measure actual tooltip width
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipWidth, setTooltipWidth] = useState(180); // Default estimate

  // Measure tooltip width after render - runs on every render to catch content changes
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const width = tooltipRef.current.offsetWidth;
      if (width > 0 && width !== tooltipWidth) {
        setTooltipWidth(width);
      }
    }
  }, [tooltipWidth]);

  // Tooltip positioning constants
  const tooltipOffset = 16;

  // Calculate target position - this is the actual left position in pixels
  // When flipped, we need to position the tooltip so its RIGHT edge is offset from crosshair
  const shouldFlip = x + tooltipWidth + tooltipOffset > containerWidth;
  const targetX = shouldFlip
    ? x - tooltipOffset - tooltipWidth // Position left of crosshair
    : x + tooltipOffset; // Position right of crosshair

  // Track flip state changes for animation
  const prevFlipRef = useRef(shouldFlip);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (prevFlipRef.current !== shouldFlip) {
      setFlipKey((k) => k + 1); // Trigger re-animation on flip
      prevFlipRef.current = shouldFlip;
    }
  }, [shouldFlip]);

  // Animated position - smoothly moves when flip happens
  const animatedLeft = useSpring(targetX, springConfig);

  // Update spring target when position changes
  React.useEffect(() => {
    animatedLeft.set(targetX);
  }, [targetX, animatedLeft]);

  // Also animate the crosshair position for the date ticker - uses faster spring to stay in sync
  const animatedX = useSpring(x, crosshairSpringConfig);
  React.useEffect(() => {
    animatedX.set(x);
  }, [x, animatedX]);

  if (!visible) {
    return null;
  }

  // Transform origin based on flip - animate from the edge closest to crosshair
  const transformOrigin = shouldFlip ? "right top" : "left top";

  return (
    <>
      {/* Tooltip Box */}
      <motion.div
        animate={{ opacity: 1 }}
        className={`pointer-events-none absolute top-10 z-50 ${className}`}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        ref={tooltipRef}
        style={{
          left: animatedLeft,
        }}
        transition={{ duration: 0.1 }}
      >
        {/* Inner content with flip animation and height animation */}
        <motion.div
          animate={{ scale: 1, opacity: 1, x: 0 }}
          className="min-w-[140px] overflow-hidden rounded-lg bg-zinc-900/30 text-white shadow-lg backdrop-blur-md"
          initial={{ scale: 0.85, opacity: 0, x: shouldFlip ? 20 : -20 }}
          key={flipKey}
          style={{ transformOrigin }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          <TooltipContent
            markerContent={markerContent}
            rows={rows}
            title={title}
          />
        </motion.div>
      </motion.div>

      {/* Animated Date Ticker at bottom - aligned with X-axis labels */}
      {showDatePill && dateLabels.length > 0 && (
        <motion.div
          className="pointer-events-none absolute z-50"
          style={{
            left: animatedX,
            x: "-50%", // Center on the crosshair
            bottom: 4, // Align with X-axis tick labels
          }}
        >
          <DateTicker
            currentIndex={currentIndex}
            labels={dateLabels}
            visible={visible}
          />
        </motion.div>
      )}
    </>
  );
}

// SVG Vertical indicator with gradient - supports variable width
export type IndicatorWidth =
  | number // Pixel width
  | "line" // 1px line (default)
  | "thin" // 2px
  | "medium" // 4px
  | "thick"; // 8px

export interface TooltipIndicatorProps {
  /** X position in pixels (center of the indicator) */
  x: number;
  /** Height of the indicator */
  height: number;
  /** Whether the indicator is visible */
  visible: boolean;
  /**
   * Width of the indicator - number (pixels) or preset.
   * Ignored if `span` is provided.
   */
  width?: IndicatorWidth;
  /**
   * Number of columns/days to span, with current point centered.
   * e.g., span={2} spans 2 full day widths centered on x.
   * Requires `columnWidth` to be set.
   *
   * Visual: span={2}
   *       |     +     |
   * ---X-----Y-----Z---
   *     [==========]  <- spans from halfway to X to halfway to Z
   */
  span?: number;
  /**
   * Width of a single column/day in pixels.
   * Required when using `span`. Calculate from xScale.
   */
  columnWidth?: number;
  /** Primary color at edges (10% and 90%) */
  colorEdge?: string;
  /** Secondary color at center (50%) */
  colorMid?: string;
  /** Whether to fade to transparent at 0% and 100%, otherwise uses colorEdge */
  fadeEdges?: boolean;
  /** Unique ID for the gradient (needed if multiple indicators on same SVG) */
  gradientId?: string;
}

// Convert width prop to pixel value
function resolveWidth(width: IndicatorWidth): number {
  if (typeof width === "number") {
    return width;
  }
  switch (width) {
    case "line":
      return 1;
    case "thin":
      return 2;
    case "medium":
      return 4;
    case "thick":
      return 8;
    default:
      return 1;
  }
}

export function TooltipIndicator({
  x,
  height,
  visible,
  width = "line",
  span,
  columnWidth,
  colorEdge = "var(--chart-crosshair)",
  colorMid = "var(--chart-crosshair)",
  fadeEdges = true,
  gradientId = "tooltip-indicator-gradient",
}: TooltipIndicatorProps) {
  // Calculate pixel width - span takes precedence over width
  const pixelWidth =
    span !== undefined && columnWidth !== undefined
      ? span * columnWidth
      : resolveWidth(width);

  // Animate X position (left edge of rect, centered on x) - uses faster spring
  const animatedX = useSpring(x - pixelWidth / 2, crosshairSpringConfig);

  React.useEffect(() => {
    animatedX.set(x - pixelWidth / 2);
  }, [x, animatedX, pixelWidth]);

  if (!visible) {
    return null;
  }

  // Opacity at edges - 0 if fadeEdges, 1 otherwise
  const edgeOpacity = fadeEdges ? 0 : 1;

  return (
    <g>
      {/* Vertical gradient - fades at top/bottom. Uses style prop for CSS variable support */}
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: colorEdge, stopOpacity: edgeOpacity }}
          />
          <stop offset="10%" style={{ stopColor: colorEdge, stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: colorMid, stopOpacity: 1 }} />
          <stop offset="90%" style={{ stopColor: colorEdge, stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: colorEdge, stopOpacity: edgeOpacity }}
          />
        </linearGradient>
      </defs>
      <motion.rect
        fill={`url(#${gradientId})`}
        height={height}
        width={pixelWidth}
        x={animatedX}
        y={0}
      />
    </g>
  );
}

// SVG Animated dot
export interface TooltipDotProps {
  x: number;
  y: number;
  visible: boolean;
  color: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export function TooltipDot({
  x,
  y,
  visible,
  color,
  size = 5,
  strokeColor = "white",
  strokeWidth = 2,
}: TooltipDotProps) {
  // Use faster crosshair spring to stay in sync with indicator
  const animatedX = useSpring(x, crosshairSpringConfig);
  const animatedY = useSpring(y, crosshairSpringConfig);

  React.useEffect(() => {
    animatedX.set(x);
    animatedY.set(y);
  }, [x, y, animatedX, animatedY]);

  if (!visible) {
    return null;
  }

  return (
    <motion.circle
      cx={animatedX}
      cy={animatedY}
      fill={color}
      r={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

export default ChartTooltip;
