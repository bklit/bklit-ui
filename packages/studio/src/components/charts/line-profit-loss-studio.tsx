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
    clampStudioPointCount(state.dataPoints)
  );
  const motionProps = getStudioCssRevealPropsForPreview(state, {
    motionCurveDragging: ctx.motionCurveDragging,
    committedState: ctx.committedState,
    isRecording: ctx.isRecording,
  });
  const curve = resolveCurve(state.curve);
  const fadeEdges = fadeEdgesPropValue(state.fadeEdges);

  const legend = state.showLegend ? (
    <ProfitLossLegend
      align={state.legendAlign}
      hoveredIndex={legendHoveredIndex}
      onHoverChange={setLegendHoveredIndex}
    />
  ) : null;

  return (
    <div className="flex size-full min-h-0 min-w-0 flex-col">
      {state.showLegend && state.legendPlacement === "top" ? legend : null}
      <div className="relative min-h-0 flex-1">
        <StudioCartesianFill className="absolute inset-0">
          <LineChart
            {...motionProps}
            className="size-full"
            data={data}
            key={`${ctx.animationKey}-${motionRemountKey}`}
          >
            <Grid
              highlightRowStroke={state.zeroLineStroke}
              highlightRowStrokeDasharray={zeroLineDasharray(
                state.zeroLineStyle
              )}
              highlightRowStrokeWidth={state.zeroLineStrokeWidth}
              highlightRowValues={state.showZeroLine ? [0] : undefined}
              horizontal
            />
            <Line
              curve={curve}
              dataKey={STUDIO_PROFIT_LOSS_DATA_KEY}
              fadeEdges={fadeEdges}
              showHighlight={false}
              stroke="transparent"
              strokeWidth={0}
            />
            <ProfitLossLineWithLegendHover
              curve={curve}
              fadeEdges={fadeEdges}
              hoveredIndex={legendHoveredIndex}
              strokeWidth={state.strokeWidth}
            />
            <XAxis />
            <ChartTooltip
              indicatorColor={crosshairIndicatorColor(state)}
              rows={(point) => profitLossTooltipRows(point, state.tooltipLabel)}
              showCrosshair={state.showCrosshair}
              showDatePill={state.showTooltipDatePill}
              showDots={state.showTooltipDots}
            />
          </LineChart>
        </StudioCartesianFill>
      </div>
      {state.showLegend && state.legendPlacement === "bottom" ? legend : null}
    </div>
  );
}
