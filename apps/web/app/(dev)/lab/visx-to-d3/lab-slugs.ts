/**
 * Chart slugs of the lab, in display order. Plain module (no React) so the
 * baselines route handler can validate paths against it.
 */
export const LAB_CHART_SLUGS = [
  "pie",
  "ring",
  "radar",
  "sankey",
  "line",
  "area",
  "bar",
  "composed",
  "scatter",
  "sparkline",
  "candlestick",
  "profit-loss",
  "live-line",
  "heatmap",
  "choropleth",
] as const;

export type LabChartSlug = (typeof LAB_CHART_SLUGS)[number];

export function isLabChartSlug(value: unknown): value is LabChartSlug {
  return (
    typeof value === "string" &&
    (LAB_CHART_SLUGS as readonly string[]).includes(value)
  );
}

/** Variant ids double as file names: lowercase slug, nothing else. */
export const VARIANT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
