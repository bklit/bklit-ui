import type { StudioUrlState } from "./studio-parsers";

/** Force ready, static rendering for OG screenshots while preserving visual customization. */
export function normalizeStudioStateForOg(
  state: StudioUrlState
): StudioUrlState {
  return {
    ...state,
    lineChartState: "ready",
    areaChartState: "ready",
    barChartState: "ready",
    animationDuration: 0,
    motionDuration: 0,
    livePaused: true,
  };
}
