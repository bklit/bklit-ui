"use client";

import type { Margin } from "@bklitui/ui/charts";

/** Chart example margins — extra top room for 3D lids, tooltip dots, and markers. */
export const CHART_EXAMPLE_MARGIN_PX = {
  top: 20,
  side: 8,
  bottom: 40,
} as const;

export const chartExampleMarginSnippet =
  "margin={{ top: 20, right: 8, bottom: 40, left: 8 }}";

const chartExampleMargin: Margin = {
  top: CHART_EXAMPLE_MARGIN_PX.top,
  right: CHART_EXAMPLE_MARGIN_PX.side,
  bottom: CHART_EXAMPLE_MARGIN_PX.bottom,
  left: CHART_EXAMPLE_MARGIN_PX.side,
};

export function useChartExampleMargin(): Margin {
  return chartExampleMargin;
}
