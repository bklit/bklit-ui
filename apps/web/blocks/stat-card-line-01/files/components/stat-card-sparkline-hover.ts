"use client";

import { useSparklineHover } from "@bklitui/ui/charts";
import type { StatCardHoverState } from "./stat-card-chart";

export type { StatCardHoverState } from "./stat-card-chart";

export interface StatCardPoint {
  date: Date;
  value: number;
}

export function formatStatCardMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function formatStatCardWeekday(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

/** Percent change from the previous point, or `null` for the first point. */
function computePeriodTrend(
  data: readonly StatCardPoint[],
  index: number
): number | null {
  const current = data[index]?.value;
  const previous = data[index - 1]?.value;
  if (current === undefined || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Tracks the hovered sparkline point and derives the stat card's value,
 * label and period-over-period trend from it. Spread `sparklineProps`
 * onto the sparkline.
 */
export function useStatCardSparklineHover(
  data: readonly StatCardPoint[],
  formatLabel: (date: Date) => string
) {
  const { index, datum, sparklineProps } = useSparklineHover<StatCardPoint>();

  const hover: StatCardHoverState =
    index === null || !datum
      ? { value: null, label: null, trend: null }
      : {
          value: datum.value,
          label: formatLabel(datum.date),
          trend: computePeriodTrend(data, index),
        };

  return { hover, sparklineProps };
}
