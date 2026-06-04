"use client";

import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  ProfitLossLine,
  profitLossColor,
  resolveProfitLossTooltipLabel,
  XAxis,
} from "@bklitui/ui/charts";
import { useState } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import {
  StudioChartShell,
  StudioVisibleLayer,
} from "@/components/charts/studio-chart-shell";
import {
  StudioChartYAxisLayers,
  timeSeriesChartMargin,
} from "@/components/charts/studio-chart-y-axis";
import { fadeEdgesPropValue } from "@/components/controls/fade-edges-picker";
import { useStudioMotionRemountKey } from "@/components/use-studio-motion-remount";
import { getStudioCssRevealPropsForPreview } from "@/lib/chart-animation";
import { resolveCurve } from "@/lib/curves";
import {
  clampStudioPointCount,
  generateStudioProfitLossData,
  STUDIO_PROFIT_LOSS_DATA_KEY,
} from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { chartTooltipPropsFromState } from "@/lib/studio-chart-overlays";
import type { StudioUrlState } from "@/lib/studio-parsers";

function zeroLineDasharray(style: StudioUrlState["zeroLineStyle"]) {
  return style === "dashed" ? "4,4" : "0";
}

function profitLossTooltipRows(point: Record<string, unknown>, label: string) {
  const value = (point[STUDIO_PROFIT_LOSS_DATA_KEY] as number) ?? 0;

  return [
    {
      color: profitLossColor(value),
      label: resolveProfitLossTooltipLabel(label),
      value,
    },
  ];
}

function crosshairIndicatorColor(state: StudioUrlState) {
  if (state.crosshairFollowsValue) {
    return (point: Record<string, unknown>) =>
      profitLossColor((point[STUDIO_PROFIT_LOSS_DATA_KEY] as number) ?? 0);
  }
  return state.crosshairColor;
}

function ProfitLossLineWithLegendHover({
  hoveredIndex,
  strokeWidth,
  curve,
  fadeEdges,
}: {
  hoveredIndex: number | null;
  strokeWidth: number;
  curve: ReturnType<typeof resolveCurve>;
  fadeEdges: ReturnType<typeof fadeEdgesPropValue>;
}) {
  return (
    <ProfitLossLegendHoverProvider hoveredIndex={hoveredIndex}>
      <ProfitLossLine
        curve={curve}
        dataKey={STUDIO_PROFIT_LOSS_DATA_KEY}
        fadeEdges={fadeEdges}
        strokeWidth={strokeWidth}
      />
    </ProfitLossLegendHoverProvider>
  );
}

export function LineProfitLossStudioChart({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const [legendHoveredIndex, setLegendHoveredIndex] = useState<number | null>(
    null
  );
  const motionRemountKey = useStudioMotionRemountKey(state);
  const data = generateStudioProfitLossData(
    clampStudioPointCount(state.dataPoints),
    ctx.dataSeed
  );
  const motionProps = getStudioCssRevealPropsForPreview(state, {
    motionCurveDragging: ctx.motionCurveDragging,
    committedState: ctx.committedState,
    isRecording: ctx.isRecording,
  });
  const curve = resolveCurve(state.curve);
  const fadeEdges = fadeEdgesPropValue(state.fadeEdges);

  return (
    <StudioChartShell
      legendComponentId="line.legend"
      renderLegend={() => (
        <ProfitLossLegend
          align={state.legendAlign}
          hoveredIndex={legendHoveredIndex}
          onHoverChange={setLegendHoveredIndex}
        />
      )}
      state={state}
    >
      <StudioCartesianFill className="size-full">
        <LineChart
          {...motionProps}
          className="size-full"
          data={data}
          key={`${ctx.animationKey}-${motionRemountKey}`}
          margin={timeSeriesChartMargin(state, { right: 40 })}
        >
          <StudioVisibleLayer componentId="line.grid" state={state}>
            <Grid
              highlightRowStroke={state.zeroLineStroke}
              highlightRowStrokeDasharray={zeroLineDasharray(
                state.zeroLineStyle
              )}
              highlightRowStrokeWidth={state.zeroLineStrokeWidth}
              highlightRowValues={state.showZeroLine ? [0] : undefined}
              horizontal
            />
          </StudioVisibleLayer>
          <Line
            curve={curve}
            dataKey={STUDIO_PROFIT_LOSS_DATA_KEY}
            fadeEdges={fadeEdges}
            showHighlight={false}
            stroke="transparent"
            strokeWidth={0}
          />
          <StudioVisibleLayer componentId="line.profit-loss" state={state}>
            <ProfitLossLineWithLegendHover
              curve={curve}
              fadeEdges={fadeEdges}
              hoveredIndex={legendHoveredIndex}
              strokeWidth={state.strokeWidth}
            />
          </StudioVisibleLayer>
          <StudioChartYAxisLayers chartPrefix="line" state={state} />
          <StudioVisibleLayer componentId="line.xaxis" state={state}>
            <XAxis />
          </StudioVisibleLayer>
          <StudioVisibleLayer componentId="line.tooltip" state={state}>
            <ChartTooltip
              {...chartTooltipPropsFromState(state, {
                indicatorColor: crosshairIndicatorColor(state),
                rows: (point) =>
                  profitLossTooltipRows(point, state.tooltipLabel),
              })}
            />
          </StudioVisibleLayer>
        </LineChart>
      </StudioCartesianFill>
    </StudioChartShell>
  );
}
