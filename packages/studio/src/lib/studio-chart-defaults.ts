import { heatmapChartDefaults } from "./heatmap-chart-defaults";
import {
  candlestickChartDefaults,
  lineChartProfitLossDefaults,
  lineChartStandardDefaults,
} from "./line-chart-mode";
import { radialChartDefaults } from "./radial-chart-defaults";
import { chartDefaultHiddenComponents } from "./studio-component-visibility";
import { defaultsForChart, type StudioUrlState } from "./studio-parsers";
import { sunburstChartDefaults } from "./sunburst-chart-defaults";
import type { ChartSlug } from "./types";

/** Charts whose layer tree has toggleable Y axes / reference area. */
export const STUDIO_Y_AXIS_CHART_PREFIX: Partial<Record<ChartSlug, string>> = {
  "line-chart": "line",
  "area-chart": "area",
  "scatter-chart": "scatter",
  "composed-chart": "composed",
  "bar-chart": "bar",
  "candlestick-chart": "candlestick",
  "live-line-chart": "live-line",
};

/** Full studio state applied when switching to `slug` in the chart picker. */
export function studioChartDefaultState(slug: ChartSlug): StudioUrlState {
  const prefix = STUDIO_Y_AXIS_CHART_PREFIX[slug];
  return {
    ...defaultsForChart(),
    chart: slug === "profit-loss-line" ? "line-chart" : slug,
    ...(slug === "live-line-chart" ? { curve: "monotoneX" } : {}),
    ...(slug === "profit-loss-line" ? lineChartProfitLossDefaults : {}),
    ...(slug === "line-chart" ? lineChartStandardDefaults : {}),
    ...(slug === "candlestick-chart" ? candlestickChartDefaults : {}),
    ...(slug === "heatmap-chart" ? heatmapChartDefaults : {}),
    ...(slug === "sunburst-chart" ? sunburstChartDefaults : {}),
    ...(slug === "radial-chart" ? radialChartDefaults : {}),
    ...(slug === "area-chart" || slug === "composed-chart"
      ? { dataSeries: 2 }
      : {}),
    ...(prefix && slug !== "line-chart"
      ? {
          hiddenComponents: chartDefaultHiddenComponents(prefix, {
            showLegend: false,
            showBrush: false,
          }),
        }
      : {}),
  };
}
