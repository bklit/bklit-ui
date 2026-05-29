"use client";

import type { Margin } from "@bklitui/ui/charts";

/** Half of chart example card padding (`px-4` → 8px). */
export const CHART_EXAMPLE_MARGIN_PX = {
  inset: 8,
  bottom: 40,
} as const;

export const chartExampleMarginSnippet =
  "margin={{ top: 8, right: 8, bottom: 40, left: 8 }}";

const chartExampleMargin: Margin = {
  top: CHART_EXAMPLE_MARGIN_PX.inset,
  right: CHART_EXAMPLE_MARGIN_PX.inset,
  bottom: CHART_EXAMPLE_MARGIN_PX.bottom,
  left: CHART_EXAMPLE_MARGIN_PX.inset,
};

export function useChartExampleMargin(): Margin {
  return chartExampleMargin;
}
