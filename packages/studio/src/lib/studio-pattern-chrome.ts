import type { StudioUrlState } from "@/lib/studio-parsers";

/** Committed state for patterns/theme/legend chrome while scrubbing geometry numbers. */
export function studioPatternChromeState(
  committed: StudioUrlState,
  display: StudioUrlState,
  numberScrubbing: boolean
): StudioUrlState {
  return numberScrubbing ? committed : display;
}

/** Fields that affect pattern defs / theme chrome — not geometry scrub params. */
export function studioDesignChromeSignature(state: StudioUrlState): string {
  return [
    state.chart,
    state.preset,
    state.pattern,
    state.chartAccent,
    state.seriesColors,
    state.seriesPatterns,
    state.dataSeries,
  ].join("\0");
}
