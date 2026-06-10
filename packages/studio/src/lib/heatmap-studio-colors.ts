import type { HeatmapLevelColors } from "@bklitui/ui/charts";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function studioHeatmapLevelColors(
  state: StudioUrlState
): HeatmapLevelColors {
  return [
    state.heatmapLevel0Color,
    state.heatmapLevel1Color,
    state.heatmapLevel2Color,
    state.heatmapLevel3Color,
    state.heatmapLevel4Color,
  ];
}
