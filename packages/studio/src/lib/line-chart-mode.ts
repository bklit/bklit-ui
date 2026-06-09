import { chartDefaultHiddenYAxes } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";

export function isProfitLossLineMode(state: StudioUrlState) {
  return (
    state.lineChartMode === "profitLoss" || state.chart === "profit-loss-line"
  );
}

export function isLineChartLoadingMode(state: StudioUrlState) {
  return state.chart === "line-chart" && state.lineChartState === "loading";
}

export function isAreaChartLoadingMode(state: StudioUrlState) {
  return state.chart === "area-chart" && state.areaChartState === "loading";
}

export function isCartesianLoadingMode(state: StudioUrlState) {
  return isLineChartLoadingMode(state) || isAreaChartLoadingMode(state);
}

export const lineChartProfitLossDefaults: Partial<StudioUrlState> = {
  lineChartMode: "profitLoss",
  hiddenComponents: chartDefaultHiddenYAxes("line"),
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
  crosshairStyle: "solid",
  crosshairDashArray: "4,4",
  crosshairFadeEdges: "both",
  crosshairFadeLength: 10,
  tooltipMatchCrosshair: true,
  tooltipDamping: 20,
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
  hiddenComponents: chartDefaultHiddenYAxes("line"),
};
