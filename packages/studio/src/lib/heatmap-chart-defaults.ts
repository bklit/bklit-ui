import { HEATMAP_DEFAULT_LEVEL_COLORS } from "@bklitui/ui/charts";
import type { StudioUrlState } from "@/lib/studio-parsers";

/** Applied when switching to the heatmap chart in Studio. */
export const heatmapChartDefaults: Partial<StudioUrlState> = {
  motionEase: "custom",
  motionBezier: "0.85, 0, 0.916, 0.282",
  legendAlign: "center",
  heatmapLoadingOpacity: 1,
  heatmapLoadingCellMaxOpacity: 0.85,
  heatmapLoadingCellRandomness: 1,
  heatmapLevel0Color: HEATMAP_DEFAULT_LEVEL_COLORS[0],
  heatmapLevel1Color: HEATMAP_DEFAULT_LEVEL_COLORS[1],
  heatmapLevel2Color: HEATMAP_DEFAULT_LEVEL_COLORS[2],
  heatmapLevel3Color: HEATMAP_DEFAULT_LEVEL_COLORS[3],
  heatmapLevel4Color: HEATMAP_DEFAULT_LEVEL_COLORS[4],
};
