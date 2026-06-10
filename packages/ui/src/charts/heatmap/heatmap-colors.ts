import { getHeatmapContributionLevel } from "./heatmap-utils";

/** Default Less → More scale (GitHub-style greens). */
export const HEATMAP_DEFAULT_LEVEL_COLORS = [
  "var(--color-muted)",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
] as const;

export type HeatmapLevelColors = readonly [
  string,
  string,
  string,
  string,
  string,
];

export function buildHeatmapColorScale(
  levelColors: HeatmapLevelColors
): (count: number | null | undefined) => string {
  return (count: number | null | undefined) => {
    const level = getHeatmapContributionLevel(count ?? 0);
    return levelColors[level] ?? levelColors[0];
  };
}

export const defaultHeatmapColorScale = buildHeatmapColorScale(
  HEATMAP_DEFAULT_LEVEL_COLORS
);
