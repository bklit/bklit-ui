"use client";

import React from "react";
import { motion, useSpring, useTransform } from "motion/react";

// Spring config for smooth tooltip movement
const springConfig = { stiffness: 400, damping: 35 };

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
  // Animated Y offset - scrolls the entire stack
  const y = useSpring(0, { stiffness: 400, damping: 35 });

  // Update scroll position when index changes
  React.useEffect(() => {
    y.set(-currentIndex * TICKER_ITEM_HEIGHT);
  }, [currentIndex, y]);

  if (!visible || labels.length === 0) return null;

  return (
    <motion.div
      className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg overflow-hidden px-4 py-1"
      // layout animates width changes smoothly
      layout
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 35 },
      }}
    >
      {/* Fixed height viewport that shows one item - h-6 = 24px */}
      <div className="relative overflow-hidden h-6">
        {/* Scrolling stack of all labels */}
        <motion.div className="flex flex-col" style={{ y }}>
          {labels.map((label, index) => (
            <div
              key={index}
              className="flex items-center justify-center shrink-0 h-6"
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
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
  // Animated X position
  const animatedX = useSpring(x, springConfig);

  // Update spring target when position changes
  React.useEffect(() => {
    animatedX.set(x);
  }, [x, animatedX]);

  // Tooltip box position - flip to left side when near right edge
  const tooltipWidth = 160;
  const tooltipLeft = useTransform(animatedX, (val) => {
    const shouldFlip = val + tooltipWidth + 20 > containerWidth;
    return shouldFlip ? val - tooltipWidth - 14 : val + 14;
  });

  if (!visible) return null;

  return (
    <>
      {/* Tooltip Box */}
      <motion.div
        className={`absolute pointer-events-none z-50 top-10 ${className}`}
        style={{ left: tooltipLeft }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="bg-zinc-900/30 backdrop-blur-md text-white rounded-lg shadow-lg px-3 py-2.5 min-w-[140px]">
          {title && (
            <div className="text-xs font-medium text-zinc-400 mb-2">
              {title}
            </div>
          )}
          <div className="space-y-1.5">
            {rows.map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-sm text-zinc-100">{row.label}</span>
                </div>
                <span className="text-sm font-medium text-white tabular-nums">
                  {typeof row.value === "number"
                    ? row.value.toLocaleString()
                    : row.value}
                </span>
              </div>
            ))}
          </div>
          {/* Marker content appended below data rows */}
          {markerContent}
        </div>
      </motion.div>

      {/* Animated Date Ticker at bottom */}
      {showDatePill && dateLabels.length > 0 && (
        <motion.div
          className="absolute pointer-events-none z-50 bottom-3"
          style={{
            left: animatedX,
            x: "-50%", // Center on the crosshair
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
  if (typeof width === "number") return width;
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

  // Animate X position (left edge of rect, centered on x)
  const animatedX = useSpring(x - pixelWidth / 2, springConfig);

  React.useEffect(() => {
    animatedX.set(x - pixelWidth / 2);
  }, [x, animatedX, pixelWidth]);

  if (!visible) return null;

  // Opacity at edges - 0 if fadeEdges, 1 otherwise
  const edgeOpacity = fadeEdges ? 0 : 1;

  return (
    <g>
      {/* Vertical gradient - fades at top/bottom. Uses style prop for CSS variable support */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
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
        x={animatedX}
        y={0}
        width={pixelWidth}
        height={height}
        fill={`url(#${gradientId})`}
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
  const animatedX = useSpring(x, springConfig);
  const animatedY = useSpring(y, springConfig);

  React.useEffect(() => {
    animatedX.set(x);
    animatedY.set(y);
  }, [x, y, animatedX, animatedY]);

  if (!visible) return null;

  return (
    <motion.circle
      cx={animatedX}
      cy={animatedY}
      r={size}
      fill={color}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

export default ChartTooltip;
