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
  StudioChartYAxisLayers,
  timeSeriesChartMargin,
} from "@/components/charts/studio-chart-y-axis";
import { StudioReferenceAreaLayer } from "@/components/charts/studio-reference-area-layer";
import {
  getStudioCssRevealPropsForPreview,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import {
  getCandlestickData,
  resolveCandlestickReferenceAreaBounds,
} from "@/lib/demo-data";
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
  const data = useMemo(() => getCandlestickData(ctx.dataSeed), [ctx.dataSeed]);
  const referenceAreaState = useMemo(() => {
    const bounds = resolveCandlestickReferenceAreaBounds(state, data);
    if (
      bounds.referenceAreaY1 === state.referenceAreaY1 &&
      bounds.referenceAreaY2 === state.referenceAreaY2
    ) {
      return state;
    }
    return { ...state, ...bounds };
  }, [state, data, state.referenceAreaY1, state.referenceAreaY2]);

  return (
    <StudioCartesianFill>
      <CandlestickChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        candleGap={state.candleGap}
        className="size-full"
        data={data}
        key={studioPreviewChartKey(ctx)}
        margin={timeSeriesChartMargin(state, {
          top: 16,
          bottom: 40,
        })}
      >
        {state.candleUseGradient ? (
          <>
            <LinearGradient
              from="var(--chart-1)"
              id="studio-candle-up"
              key="studio-candle-up"
              to="var(--chart-3)"
            />
            <LinearGradient
              from="var(--chart-4)"
              id="studio-candle-down"
              key="studio-candle-down"
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
        <StudioReferenceAreaLayer
          componentId="candlestick.reference-area"
          state={referenceAreaState}
        />
        <Candlestick
          bodyPatternNegative={patternUp}
          bodyPatternPositive={patternUp}
          fadedOpacity={state.candleFadedOpacity}
          negativeFill={negativeFill}
          positiveFill={positiveFill}
        />
        <ChartTooltip showDots={state.candleShowDots} />
        <StudioChartYAxisLayers chartPrefix="candlestick" state={state} />
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
