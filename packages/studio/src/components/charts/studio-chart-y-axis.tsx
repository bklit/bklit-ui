"use client";

import { YAxis } from "@bklitui/ui/charts";
import { lineChartUsesRightYAxis } from "@/lib/line-series-y-axis";
import {
  getLineYAxisFormatLargeNumbers,
  getLineYAxisNumTicks,
} from "@/lib/line-y-axis-settings";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { StudioVisibleLayer } from "./studio-chart-shell";

export function timeSeriesChartMargin(
  state: StudioUrlState,
  overrides?: { top?: number; right?: number; bottom?: number; left?: number }
) {
  const usesRightAxis = lineChartUsesRightYAxis(state);
  return {
    top: 40,
    right: usesRightAxis ? 56 : 40,
    bottom: 40,
    left: 56,
    ...overrides,
  };
}

export function StudioChartYAxisLayers({
  chartPrefix,
  state,
  formatValue,
}: {
  chartPrefix: string;
  state: StudioUrlState;
  /** Optional tick formatter for both axes (overrides large-number formatting). */
  formatValue?: (value: number) => string;
}) {
  return (
    <>
      <StudioVisibleLayer
        componentId={`${chartPrefix}.yaxis.left`}
        state={state}
      >
        <YAxis
          formatLargeNumbers={getLineYAxisFormatLargeNumbers(state, "left")}
          formatValue={formatValue}
          numTicks={getLineYAxisNumTicks(state, "left")}
          yAxisId="left"
        />
      </StudioVisibleLayer>
      <StudioVisibleLayer
        componentId={`${chartPrefix}.yaxis.right`}
        state={state}
      >
        <YAxis
          formatLargeNumbers={getLineYAxisFormatLargeNumbers(state, "right")}
          formatValue={formatValue}
          numTicks={getLineYAxisNumTicks(state, "right")}
          orientation="right"
          yAxisId="right"
        />
      </StudioVisibleLayer>
    </>
  );
}
