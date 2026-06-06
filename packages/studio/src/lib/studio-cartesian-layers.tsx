"use client";

import { chartCssVars, Grid } from "@bklitui/ui/charts";
import { isStudioComponentVisible } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";

/** One grid instance — stroke and shimmer follow chart phase inside `<Grid>`. */
export function studioCartesianGridLayer(
  state: StudioUrlState,
  gridComponentId: string
) {
  const gridVisible = isStudioComponentVisible(state, gridComponentId);
  if (!gridVisible) {
    return null;
  }

  return (
    <Grid
      horizontal
      loadingStroke={state.lineLoadingGridStroke}
      shimmer={state.lineLoadingGridShimmer}
      shimmerLength={state.lineLoadingGridShimmerLength}
      shimmerSpeed={
        state.lineLoadingGridShimmerSync ? 1 : state.lineLoadingGridShimmerSpeed
      }
      shimmerStroke={state.lineLoadingGridShimmerStroke}
      shimmerSync={state.lineLoadingGridShimmerSync}
      stroke={chartCssVars.grid}
    />
  );
}

export function studioLoadingLabel(
  state: StudioUrlState,
  labelComponentId: string
): string | undefined {
  return isStudioComponentVisible(state, labelComponentId)
    ? state.lineLoadingLabel
    : undefined;
}

export function studioLoadingStrokeProps(
  state: StudioUrlState,
  lineComponentId: string
) {
  const visible = isStudioComponentVisible(state, lineComponentId);
  return {
    loadingStroke: visible ? state.lineLoadingStroke : "transparent",
    loadingStrokeOpacity: visible ? state.lineLoadingStrokeOpacity : 0,
  };
}

/** Primary follows chart phase; secondary never shows loading pulse. */
export function studioCartesianSeriesLoadingProp(isPrimary: boolean) {
  return isPrimary ? undefined : false;
}
