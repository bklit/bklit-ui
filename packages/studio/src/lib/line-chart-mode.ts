import type { StudioUrlState } from "./studio-parsers";

export function isProfitLossLineMode(state: StudioUrlState) {
  return (
    state.lineChartMode === "profitLoss" || state.chart === "profit-loss-line"
  );
}

export const lineChartProfitLossDefaults: Partial<StudioUrlState> = {
  lineChartMode: "profitLoss",
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
};

export const lineChartStandardDefaults: Partial<StudioUrlState> = {
  lineChartMode: "standard",
  dataSeries: 2,
  curve: "natural",
  fadeEdges: "both",
  showHighlight: true,
};
