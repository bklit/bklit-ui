"use client";

import { usePlaygroundState } from "@/components/playground/use-playground-state";

export function usePlaygroundProfitLossState() {
  return usePlaygroundState({
    chart: "line-chart",
    dataSeries: 1,
    dataPoints: 24,
    curve: "linear",
    fadeEdges: "none",
    showHighlight: false,
    showZeroLine: true,
    zeroLineStroke: "var(--color-muted-foreground)",
    zeroLineStrokeWidth: 1.5,
    zeroLineStyle: "solid",
    tooltipLabel: "Profit/Loss",
    showTooltipDots: true,
    showTooltipDatePill: true,
    showCrosshair: true,
    crosshairFollowsValue: true,
    crosshairColor: "var(--chart-crosshair)",
    showLegend: true,
    legendPlacement: "bottom",
    legendAlign: "center",
  });
}

export type PlaygroundProfitLossState = ReturnType<
  typeof usePlaygroundProfitLossState
>;
