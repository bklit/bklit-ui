"use client";

import {
  Candlestick,
  CandlestickChart,
  ChartTooltip,
  LinearGradient,
  XAxis,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioCssRevealPropsForPreview,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getCandlestickData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import {
  studioCartesianBackgroundLayer,
  studioCartesianGridLayer,
} from "@/lib/studio-cartesian-layers";
import { studioCandlestickLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getSeriesFillMode } from "@/lib/studio-series-design";

const CandlestickChartBody = memo(function CandlestickChartBody({
  state,
  ctx,
  patternUp,
  positiveFill,
  negativeFill,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
  patternUp: string | undefined;
  positiveFill: string;
  negativeFill: string;
}) {
  return (
    <StudioCartesianFill>
      <CandlestickChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        candleGap={state.candleGap}
        className="size-full"
        data={getCandlestickData(ctx.dataSeed)}
        key={studioPreviewChartKey(ctx)}
        margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
      >
        {state.candleUseGradient ? (
          <>
            <LinearGradient
              from="var(--chart-1)"
              id="studio-candle-up"
              to="var(--chart-3)"
            />
            <LinearGradient
              from="var(--chart-4)"
              id="studio-candle-down"
              to="var(--chart-5)"
            />
          </>
        ) : null}
        {ctx.patternDefs}
        {studioCartesianBackgroundLayer(
          state,
          "candlestick.background",
          "candlestick.grid"
        )}
        {studioCartesianGridLayer(state, "candlestick.grid")}
        <Candlestick
          bodyPatternNegative={patternUp}
          bodyPatternPositive={patternUp}
          fadedOpacity={state.candleFadedOpacity}
          negativeFill={negativeFill}
          positiveFill={positiveFill}
        />
        <ChartTooltip showDots={state.candleShowDots} />
        <XAxis />
      </CandlestickChart>
    </StudioCartesianFill>
  );
});

export function CandlestickStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const patternUp =
    getSeriesFillMode(state, 0) === "pattern"
      ? ctx.patternFillAt(0)
      : undefined;
  const positiveFill = state.candleUseGradient
    ? "url(#studio-candle-up)"
    : "var(--chart-1)";
  const negativeFill = state.candleUseGradient
    ? "url(#studio-candle-down)"
    : "var(--chart-3)";

  const legendItems = useMemo(
    () => studioCandlestickLegendItems(state),
    [state]
  );

  return (
    <StudioChartShell
      legendComponentId="candlestick.legend"
      legendItems={legendItems}
      state={ctx.chromeState}
    >
      <CandlestickChartBody
        ctx={ctx}
        negativeFill={negativeFill}
        patternUp={patternUp}
        positiveFill={positiveFill}
        state={state}
      />
    </StudioChartShell>
  );
}
