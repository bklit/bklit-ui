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
import { curveLinear } from "@visx/curve";
import { useState } from "react";
import { StudioCartesianFill } from "@/components/studio/charts/studio-chart-layout";
import { useStudioMotionRemountKey } from "@/components/studio/use-studio-motion-remount";
import { getStudioCssRevealPropsForPreview } from "@/lib/studio/chart-animation";
import { clampStudioPointCount } from "@/lib/studio/demo-data";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";
import {
  generateProfitLossData,
  PROFIT_LOSS_DATA_KEY,
} from "./profit-loss-demo-data";

function zeroLineDasharray(style: StudioUrlState["zeroLineStyle"]) {
  return style === "dashed" ? "4,4" : "0";
}

function profitLossTooltipRows(point: Record<string, unknown>, label: string) {
  const value = (point[PROFIT_LOSS_DATA_KEY] as number) ?? 0;

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
      profitLossColor((point[PROFIT_LOSS_DATA_KEY] as number) ?? 0);
  }
  return state.crosshairColor;
}

function ProfitLossLineWithLegendHover({
  hoveredIndex,
  strokeWidth,
}: {
  hoveredIndex: number | null;
  strokeWidth: number;
}) {
  return (
    <ProfitLossLegendHoverProvider hoveredIndex={hoveredIndex}>
      <ProfitLossLine
        dataKey={PROFIT_LOSS_DATA_KEY}
        strokeWidth={strokeWidth}
      />
    </ProfitLossLegendHoverProvider>
  );
}

export function PlaygroundProfitLossLineChart({
  state,
  committedState,
  motionCurveDragging,
  replayKey,
}: {
  state: StudioUrlState;
  committedState: StudioUrlState;
  motionCurveDragging: boolean;
  replayKey: number;
}) {
  const [legendHoveredIndex, setLegendHoveredIndex] = useState<number | null>(
    null
  );
  const motionRemountKey = useStudioMotionRemountKey(state);
  const data = generateProfitLossData(clampStudioPointCount(state.dataPoints));
  const motionProps = getStudioCssRevealPropsForPreview(state, {
    motionCurveDragging,
    committedState,
    isRecording: false,
  });

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
            key={`${replayKey}-${motionRemountKey}`}
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
              curve={curveLinear}
              dataKey={PROFIT_LOSS_DATA_KEY}
              fadeEdges={false}
              showHighlight={false}
              stroke="transparent"
              strokeWidth={0}
            />
            <ProfitLossLineWithLegendHover
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
