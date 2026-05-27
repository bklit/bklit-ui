export const validChartSlugs = [
  "area-chart",
  "bar-chart",
  "candlestick-chart",
  "choropleth-chart",
  "composed-chart",
  "funnel-chart",
  "gauge-chart",
  "line-chart",
  "profit-loss-line",
  "live-line-chart",
  "pie-chart",
  "radar-chart",
  "ring-chart",
  "scatter-chart",
  "sankey-chart",
] as const;

export type ChartSlug = (typeof validChartSlugs)[number];

export function isChartSlug(name: string): name is ChartSlug {
  return (validChartSlugs as readonly string[]).includes(name);
}
