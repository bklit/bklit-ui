import { motionSliceFromState } from "@/lib/chart-animation";
import { motionSignature } from "@/lib/motion-config";
import type { StudioRenderContext } from "@/lib/render-context";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getEffectiveSeriesColor,
  getSeriesFillMode,
} from "@/lib/studio-series-design";

/** Motion enter props should not track geometry preview ticks. */
export function studioPreviewMotionState(
  display: StudioUrlState,
  ctx: Pick<StudioRenderContext, "numberScrubbing" | "committedState">
): StudioUrlState {
  return ctx.numberScrubbing ? ctx.committedState : display;
}

/** Series colors / fill modes should not recompute during geometry scrub. */
export function studioPreviewColorState(
  display: StudioUrlState,
  ctx: Pick<StudioRenderContext, "numberScrubbing" | "committedState">
): StudioUrlState {
  return ctx.numberScrubbing ? ctx.committedState : display;
}

export function studioMotionSignature(state: StudioUrlState): string {
  return motionSignature(motionSliceFromState(state));
}

export function studioSeriesColorSignature(state: StudioUrlState): string {
  const count = 5;
  const parts: string[] = [state.seriesColors, state.preset, state.chartAccent];
  for (let index = 0; index < count; index++) {
    parts.push(getEffectiveSeriesColor(state, index));
    parts.push(getSeriesFillMode(state, index));
  }
  return parts.join("\0");
}
