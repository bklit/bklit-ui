"use client";

import { Background, Grid } from "@bklitui/ui/charts";
import {
  BACKGROUND_PATTERN_KEYS,
  patternOptionsFromState,
} from "./pattern-control-groups";
import { isStudioComponentVisible } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";

export function backgroundPropsFromState(state: StudioUrlState) {
  const options = patternOptionsFromState(state, BACKGROUND_PATTERN_KEYS);
  return {
    pattern: options.preset,
    color: options.color,
    scale: options.scale,
    strokeWidth: options.strokeWidth,
    radius: options.radius,
    complement: options.complement,
    fill: options.fill || undefined,
    dotFill: state.backgroundPatternDotsFill,
    tileBackground: options.tileBackground,
    opacity: options.opacity,
    showFill: state.backgroundPatternShowFill,
    fadeHorizontal: state.backgroundFadeHorizontal,
    fadeVertical: state.backgroundFadeVertical,
    fadeHorizontalLength: state.backgroundFadeHorizontalLength,
    fadeVerticalLength: state.backgroundFadeVerticalLength,
  };
}

/** Pattern fill behind series — only when grid is hidden. */
export function studioCartesianBackgroundLayer(
  state: StudioUrlState,
  backgroundComponentId: string,
  gridComponentId: string
) {
  const backgroundVisible = isStudioComponentVisible(
    state,
    backgroundComponentId
  );
  const gridVisible = isStudioComponentVisible(state, gridComponentId);

  if (!(backgroundVisible && !gridVisible)) {
    return null;
  }

  if (state.backgroundPattern === "none") {
    return null;
  }

  return <Background {...backgroundPropsFromState(state)} />;
}

export function gridPropsFromState(state: StudioUrlState) {
  return {
    horizontal: state.gridHorizontal,
    vertical: state.gridVertical,
    numTicksRows: state.gridNumTicksRows,
    numTicksColumns: state.gridNumTicksColumns,
    stroke: state.gridStroke,
    strokeOpacity: state.gridStrokeOpacity,
    strokeWidth: state.gridStrokeWidth,
    strokeDasharray: state.gridStrokeDasharray,
    fadeHorizontal: state.gridFadeHorizontal,
    fadeVertical: state.gridFadeVertical,
    hideHorizontalEdgeLines: state.gridHideHorizontalEdgeLines,
    hideVerticalEdgeLines: state.gridHideVerticalEdgeLines,
  };
}

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
      {...gridPropsFromState(state)}
      loadingStroke={state.lineLoadingGridStroke}
      shimmer={
        state.loadingStyle === "sweep" ? false : state.lineLoadingGridShimmer
      }
      shimmerLength={state.lineLoadingGridShimmerLength}
      shimmerSpeed={
        state.lineLoadingGridShimmerSync ? 1 : state.lineLoadingGridShimmerSpeed
      }
      shimmerStroke={state.lineLoadingGridShimmerStroke}
      shimmerSync={state.lineLoadingGridShimmerSync}
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
