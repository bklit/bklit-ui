"use client";

import { TrendLine } from "@bklitui/ui/charts";
import { StudioVisibleLayer } from "@/components/charts/studio-chart-shell";
import { fadeEdgesPropValue } from "@/components/controls/fade-edges-picker";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getTrendLineDataKey,
  getTrendLineStroke,
  getTrendLineYAxisId,
} from "@/lib/studio-trend-line-props";

export function StudioTrendLineLayer({
  state,
  componentId,
  dataKey,
  ignoreYAxis = false,
}: {
  state: StudioUrlState;
  componentId: string;
  /** Overrides the series-index key (horizontal bar dataset). */
  dataKey?: string;
  /** Horizontal bars have a single value axis. */
  ignoreYAxis?: boolean;
}) {
  return (
    <StudioVisibleLayer componentId={componentId} state={state}>
      <TrendLine
        dataKey={dataKey ?? getTrendLineDataKey(state)}
        fadeEdges={fadeEdgesPropValue(state.trendLineFadeEdges)}
        fadeEdgesLength={state.trendLineFadeEdgesLength}
        gradientEnd={state.trendLineGradientEnd}
        gradientStart={state.trendLineGradientStart || undefined}
        opacity={state.trendLineOpacity}
        stroke={getTrendLineStroke(state)}
        strokeDasharray={state.trendLineDashArray}
        strokeStyle={state.trendLineStrokeStyle}
        strokeWidth={state.trendLineStrokeWidth}
        yAxisId={ignoreYAxis ? undefined : getTrendLineYAxisId(state)}
      />
    </StudioVisibleLayer>
  );
}
