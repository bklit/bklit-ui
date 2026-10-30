"use client";

import { useChart } from "@bklitui/ui/charts";
import { motion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Bar chart lab data and the custom hover indicators the sources define
 * inline, copied verbatim (all deterministic: no clock, no randomness).
 */

// --- chart-examples.tsx ----------------------------------------------------

export const barData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "Jun", desktop: 214 },
];

/** Also `stackedData` in docs/bar-chart-demo.tsx. */
export const barStackedData = [
  { month: "Jan", desktop: 4000, mobile: 2400 },
  { month: "Feb", desktop: 5000, mobile: 3000 },
  { month: "Mar", desktop: 3500, mobile: 2800 },
  { month: "Apr", desktop: 4200, mobile: 3200 },
  { month: "May", desktop: 3800, mobile: 2600 },
  { month: "Jun", desktop: 5500, mobile: 3800 },
];

export const barShapePatternColor = "var(--chart-5)";
export const barShapeTrackPatternColor = "var(--chart-grid)";
export const barShapeGradientStops = [
  { offset: 0, color: "var(--chart-1)" },
  { offset: 25, color: "var(--chart-2)" },
  { offset: 50, color: "var(--chart-3)" },
  { offset: 75, color: "var(--chart-4)" },
  { offset: 100, color: "var(--chart-5)" },
];

/** Also `browserData` in docs/bar-chart-demo.tsx. */
export const barHorizontalData = [
  { browser: "Chrome", users: 275 },
  { browser: "Safari", users: 200 },
  { browser: "Firefox", users: 187 },
  { browser: "Edge", users: 173 },
  { browser: "Other", users: 90 },
];

export const barValueLabelData = [
  { month: "Jan", orders: 720 },
  { month: "Feb", orders: 640 },
  { month: "Mar", orders: 810 },
  { month: "Apr", orders: 580 },
  { month: "May", orders: 930 },
  { month: "Jun", orders: 700 },
  { month: "Jul", orders: 880 },
  { month: "Aug", orders: 760 },
  { month: "Sep", orders: 1010 },
  { month: "Oct", orders: 860 },
  { month: "Nov", orders: 1120 },
  { month: "Dec", orders: 970 },
];

/** Also `profitLossData` in docs/bar-chart-profit-loss-demo.tsx. */
export const barProfitLossData = [
  { month: "Jan", profit: 4200 },
  { month: "Feb", profit: -1800 },
  { month: "Mar", profit: 2600 },
  { month: "Apr", profit: -3400 },
  { month: "May", profit: 5100 },
  { month: "Jun", profit: -900 },
  { month: "Jul", profit: 3800 },
  { month: "Aug", profit: 6200 },
];

function dailyBars(length: number) {
  return Array.from({ length }, (_, i) => {
    const date = new Date(2024, 0, 1);
    date.setDate(date.getDate() + i);
    const baseValue = 50 + Math.sin(i / 7) * 30;
    const variation = ((i * 7) % 37) - 18;
    return {
      day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.floor(baseValue + variation),
    };
  });
}

export const barDailyData = dailyBars(60);
export const barHeroData = dailyBars(90);

/** Also `barData` in docs/tooltip-demo.tsx. */
export const barRevenueData = [
  { month: "Jan", revenue: 12_000 },
  { month: "Feb", revenue: 15_500 },
  { month: "Mar", revenue: 11_000 },
  { month: "Apr", revenue: 18_500 },
  { month: "May", revenue: 16_800 },
  { month: "Jun", revenue: 21_200 },
];

/** Room for Y-axis tick labels on the left; default right margin. */
export const chartMarginLeftYAxis = {
  top: 8,
  right: 8,
  bottom: 40,
  left: 56,
} as const;

/** Biaxial charts with labels on both sides. */
export const chartMarginBiaxialYAxis = {
  top: 8,
  right: 56,
  bottom: 40,
  left: 56,
} as const;

/**
 * `useChartExampleMargin()` (desktop value) that `createChartExamplePreview`
 * merges under every gallery example's own `margin`.
 */
export const GALLERY_MARGIN = { top: 20, right: 8, bottom: 40, left: 8 };

export function galleryMargin(margin?: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}) {
  return { ...GALLERY_MARGIN, ...margin };
}

// --- docs/bar-chart-demo.tsx, content/docs/components/bar-chart.mdx -------

/** `chartData` in docs/bar-chart-demo.tsx and bar-chart.mdx. */
export const docsRevenueProfitData = [
  { month: "Jan", revenue: 12_000, profit: 4500 },
  { month: "Feb", revenue: 15_500, profit: 5200 },
  { month: "Mar", revenue: 11_000, profit: 3800 },
  { month: "Apr", revenue: 18_500, profit: 7100 },
  { month: "May", revenue: 16_800, profit: 5400 },
  { month: "Jun", revenue: 21_200, profit: 8800 },
];

export const stackedLegendItems = [
  { label: "Desktop", value: 0, color: "hsl(217, 91%, 60%)" },
  { label: "Mobile", value: 0, color: "hsl(217, 91%, 75%)" },
];

// --- docs/custom-indicator-demo.tsx ----------------------------------------

export const customIndicatorData = [
  { month: "Jan", revenue: 12_000, cost: 8000 },
  { month: "Feb", revenue: 15_500, cost: 10_200 },
  { month: "Mar", revenue: 11_000, cost: 7500 },
  { month: "Apr", revenue: 18_500, cost: 12_000 },
  { month: "May", revenue: 16_800, cost: 11_500 },
  { month: "Jun", revenue: 21_200, cost: 14_000 },
];

// --- docs/date-highlights-demo.tsx -----------------------------------------

function dayDate(index: number): Date {
  return new Date(2026, 9, 1 + index);
}

export const PROJECT_DUE_DATE = dayDate(14);

export const dateHighlightsBarData = Array.from({ length: 21 }, (_, index) => ({
  date: dayDate(index),
  issues: Math.round(
    (index % 7 === 3 || index % 7 === 4 ? 2 : 8) +
      Math.abs(Math.sin(index * 1.3)) * 6
  ),
}));

// --- components/recipes/recipe-data.ts -------------------------------------

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const recipeMonthlyData = MONTHS.map((month, index) => {
  const revenue = Math.round(
    4200 + index * 260 + Math.sin(index * 1.3) * 900 + Math.cos(index) * 300
  );
  return {
    month,
    revenue,
    previous: Math.round(revenue * 0.74 + Math.sin(index * 0.8) * 350),
  };
});

export const recipeHalfYearData = recipeMonthlyData.slice(0, 6);

/** `BAR_MARGIN` in components/recipes/definitions/shared.ts. */
export const BAR_MARGIN = { top: 8, right: 8, bottom: 40, left: 8 };

// --- lab-only (props tables with no ported example) ------------------------

/** Includes a zero and a tiny value for `minBarHeight`. */
export const barMinHeightData = [
  { month: "Jan", value: 12_000 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 300 },
  { month: "Apr", value: 18_500 },
  { month: "May", value: 16_800 },
  { month: "Jun", value: 21_200 },
];

// --- custom indicators -----------------------------------------------------

/** `AnimatedBarLine` (chart-examples.tsx, docs/bar-chart-demo.tsx, docs/custom-indicator-demo.tsx). */
function AnimatedBarLine({
  barX,
  barTopY,
  barBottomY,
  width,
  isHovered,
}: {
  barX: number;
  barTopY: number;
  barBottomY: number;
  width: number;
  isHovered: boolean;
}) {
  const animatedY = useSpring(barBottomY, { stiffness: 300, damping: 30 });
  const animatedOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedY.set(isHovered ? barTopY : barBottomY);
    animatedOpacity.set(isHovered ? 1 : 0);
  }, [isHovered, barTopY, barBottomY, animatedY, animatedOpacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{ opacity: animatedOpacity, y: animatedY }}
      width={width}
      x={barX}
    />
  );
}

/**
 * `BarLineIndicator` from chart-examples.tsx (portal into the chart
 * container). Covers the docs' `BarHorizontalLineIndicator` variants too:
 * single key (bar-chart-demo) and multi key (custom-indicator-demo).
 */
export function BarLineIndicator({
  data,
  valueKey,
  valueKeys,
  xKey,
  stacked = false,
  overflowVisible = true,
}: {
  data: Record<string, unknown>[];
  valueKey?: string;
  valueKeys?: string[];
  xKey: string;
  stacked?: boolean;
  /** chart-examples.tsx adds `overflow-visible`; the docs demos do not. */
  overflowVisible?: boolean;
}) {
  const {
    barScale,
    bandWidth,
    innerHeight,
    margin,
    containerRef,
    hoveredBarIndex,
    yScale,
  } = useChart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container && bandWidth && barScale)) {
    return null;
  }

  const keys = valueKeys ?? (valueKey ? [valueKey] : []);
  if (keys.length === 0) {
    return null;
  }

  return createPortal(
    <svg
      aria-hidden="true"
      className={
        overflowVisible
          ? "pointer-events-none absolute inset-0 z-50 overflow-visible"
          : "pointer-events-none absolute inset-0 z-50"
      }
      height="100%"
      width="100%"
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.flatMap((d, i) => {
          const xVal = d[xKey];
          const groupX = barScale(String(xVal)) ?? 0;
          const isHovered = hoveredBarIndex === i;

          if (stacked) {
            const total = keys.reduce(
              (sum, key) => sum + (Number(d[key]) || 0),
              0
            );
            return [
              <AnimatedBarLine
                barBottomY={innerHeight}
                barTopY={yScale(total) ?? innerHeight}
                barX={groupX}
                isHovered={isHovered}
                key={String(xVal)}
                width={bandWidth}
              />,
            ];
          }

          const individualBarWidth = bandWidth / keys.length;
          return keys.map((key, barIndex) => {
            const yVal = d[key];
            const barTopY =
              typeof yVal === "number"
                ? (yScale(yVal) ?? innerHeight)
                : innerHeight;
            return (
              <AnimatedBarLine
                barBottomY={innerHeight}
                barTopY={barTopY}
                barX={groupX + barIndex * individualBarWidth}
                isHovered={isHovered}
                key={`${String(xVal)}-${key}`}
                width={individualBarWidth}
              />
            );
          });
        })}
      </g>
    </svg>,
    container
  );
}

/** `RisingLine` from recipes/definitions/custom-indicators.tsx. */
function RisingLine({
  x,
  width,
  top,
  bottom,
  active,
}: {
  x: number;
  width: number;
  top: number;
  bottom: number;
  active: boolean;
}) {
  const y = useSpring(bottom, { stiffness: 300, damping: 30 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    y.set(active ? top : bottom);
    opacity.set(active ? 1 : 0);
  }, [active, top, bottom, y, opacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{ y, opacity }}
      width={width}
      x={x}
    />
  );
}

/** `RisingBarIndicator` from recipes/definitions/custom-indicators.tsx (in-SVG post overlay). */
export function RisingBarIndicator({ dataKeys }: { dataKeys: string[] }) {
  const {
    data,
    barScale,
    bandWidth,
    barXAccessor,
    yScale,
    innerHeight,
    hoveredBarIndex,
  } = useChart();

  if (!(barScale && bandWidth && barXAccessor)) {
    return null;
  }

  const width = bandWidth / dataKeys.length;

  return (
    <g pointerEvents="none">
      {data.flatMap((row, index) =>
        dataKeys.map((key, keyIndex) => (
          <RisingLine
            active={hoveredBarIndex === index}
            bottom={innerHeight}
            key={`${barXAccessor(row)}-${key}`}
            top={yScale(Number(row[key]) || 0) ?? innerHeight}
            width={width}
            x={(barScale(barXAccessor(row)) ?? 0) + keyIndex * width}
          />
        ))
      )}
    </g>
  );
}

// Render above the bars and outside the reveal clip.
RisingBarIndicator.__isPostOverlay = true;
