export const validChartSlugs = [
  "area-chart",
  "bar-chart",
  "candlestick-chart",
  "choropleth-chart",
  "composed-chart",
  "funnel-chart",
  "gauge-chart",
  "line-chart",
  "live-line-chart",
  "pie-chart",
  "radar-chart",
  "ring-chart",
  "sankey-chart",
] as const;

export type ChartSlug = (typeof validChartSlugs)[number];
