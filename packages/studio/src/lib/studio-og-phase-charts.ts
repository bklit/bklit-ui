import type { ChartSlug } from "@/chart-slugs";

/** Cartesian charts that wait for `onPhaseChange("ready")` before OG capture. */
export const STUDIO_OG_PHASE_CHARTS = new Set<ChartSlug>([
  "line-chart",
  "area-chart",
  "scatter-chart",
  "composed-chart",
  "bar-chart",
]);

export function chartNeedsOgPhaseSignal(chart: ChartSlug): boolean {
  return STUDIO_OG_PHASE_CHARTS.has(chart);
}
