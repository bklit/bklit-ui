import type { HoverTargets } from "../bench/parity";

/**
 * Data copied verbatim from the sparkline sources (all already
 * deterministic), so a later edit to a demo cannot move the baselines.
 */

export interface SparkPoint {
  day: string;
  value: number;
}

/** `sparklineGalleryData` / `makeSparkData` (gallery + docs demo). */
export function sparkData(
  seed: number,
  length = 24,
  base = 100,
  trend = 1.5
): SparkPoint[] {
  return Array.from({ length }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.round(
      base +
        trend * i +
        Math.sin(i * 0.7 + seed) * base * 0.12 +
        Math.cos(i * 1.9 + seed * 2) * base * 0.06
    ),
  }));
}

export const revenue = sparkData(1, 24, 4200, 40);
export const visitors = sparkData(2, 24, 1800, -12);
export const orders = sparkData(3, 18, 120, 2);
export const latency = sparkData(5, 32, 240, 0);

/** Daily profit / loss — swings across zero. */
export const profitLoss: SparkPoint[] = Array.from({ length: 20 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: Math.round(Math.sin(i * 0.9) * 420 + Math.cos(i * 2.3) * 180 + 40),
}));

/** Plan tier changes — step curve reads as discrete levels. */
export const seats: SparkPoint[] = [
  5, 5, 5, 8, 8, 8, 8, 12, 12, 10, 10, 15, 15, 15, 20, 20, 18, 25,
].map((value, i) => ({ day: `Week ${i + 1}`, value }));

export const tableRows = [
  { name: "Starter", data: sparkData(11, 16, 320, 6) },
  { name: "Pro", data: sparkData(12, 16, 880, 18) },
  { name: "Team", data: sparkData(13, 16, 540, -9) },
  { name: "Enterprise", data: sparkData(14, 16, 1260, 4) },
];

// components/recipes/recipe-data.ts

function recipeDay(offset: number): Date {
  return new Date(2026, 0, 5 + offset);
}

export const recipeDailyData = Array.from({ length: 28 }, (_, index) => {
  const trend = 1400 + index * 38;
  const weekly = Math.sin((index / 7) * Math.PI * 2) * 180;
  const noise = Math.sin(index * 2.3) * 90 + Math.cos(index * 1.1) * 60;
  const visitorCount = Math.round(trend + weekly + noise);
  return {
    date: recipeDay(index),
    visitors: visitorCount,
    previous: Math.round(visitorCount * 0.78 + Math.cos(index * 0.9) * 110),
  };
});

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
  const value = Math.round(
    4200 + index * 260 + Math.sin(index * 1.3) * 900 + Math.cos(index) * 300
  );
  return {
    month,
    revenue: value,
    previous: Math.round(value * 0.74 + Math.sin(index * 0.8) * 350),
  };
});

export interface KpiPoint {
  date: Date;
  value: number;
}

export const recipeKpiData: Record<
  "visitors" | "signups" | "revenue",
  KpiPoint[]
> = {
  visitors: recipeDailyData.map(({ date, visitors: value }) => ({
    date,
    value,
  })),
  signups: recipeDailyData.map(({ date, visitors: value }, index) => ({
    date,
    value: Math.round(value * 0.045 + Math.sin(index * 1.7) * 9),
  })),
  revenue: recipeDailyData.map(({ date, visitors: value }, index) => ({
    date,
    value: Math.round(value * 2.6 + Math.cos(index * 0.8) * 420 - index * 18),
  })),
};

/**
 * One hover step per sparkline (instead of the fixture's three x positions on
 * the first one), at staggered x fractions so each lands on a different point.
 */
export function eachSparklineSvg(fractions: readonly number[]): HoverTargets {
  return (root) => {
    const svgs = [...root.querySelectorAll('svg[role="img"]')];
    return svgs.slice(0, fractions.length).map((element, i) => ({
      element,
      at: { fx: fractions[i] ?? 0.5, fy: 0.5 },
    }));
  };
}
