"use client";

import { Grid, type GridProps } from "./grid";

const DEFAULT_LOADING_GRID_STROKE =
  "color-mix(in oklch, var(--chart-grid) 50%, transparent)";
const DEFAULT_LOADING_SHIMMER_STROKE =
  "color-mix(in oklch, var(--foreground) 68%, transparent)";

export interface LoadingGridProps {
  /** Number of horizontal grid lines. Default: 5 */
  numTicksRows?: number;
  /** Grid line stroke (color and opacity via color-mix or oklch alpha). */
  stroke?: string;
  /** Grid line stroke width. Default: 1 */
  strokeWidth?: number;
  /** Grid line dash array. Default: "4,4" */
  strokeDasharray?: string;
  /** Shimmer band stroke (color and opacity via color-mix or oklch alpha). */
  shimmerStroke?: string;
  /** Animate a shimmer band across grid lines. Default: true */
  shimmer?: boolean;
  /** Shimmer band width in pixels. Default: 140 */
  shimmerLength?: number;
  /** Shimmer speed multiplier (higher = faster). Default: 1 */
  shimmerSpeed?: number;
  /** Match loop timing to `LineLoadingPulse` (cycle + inter-loop pause). */
  shimmerSync?: boolean;
}

/** @deprecated Prefer `<Grid horizontal shimmer />` on a unified `LineChart`. */
export function LoadingGrid({
  numTicksRows = 5,
  stroke = DEFAULT_LOADING_GRID_STROKE,
  strokeWidth = 1,
  strokeDasharray = "4,4",
  shimmerStroke = DEFAULT_LOADING_SHIMMER_STROKE,
  shimmer = true,
  shimmerLength,
  shimmerSpeed,
  shimmerSync = false,
}: LoadingGridProps) {
  const gridProps: GridProps = {
    horizontal: true,
    vertical: false,
    numTicksRows,
    stroke,
    strokeWidth,
    strokeDasharray,
    shimmer,
    shimmerStroke,
    shimmerSync,
    fadeHorizontal: true,
  };

  if (shimmerLength != null) {
    gridProps.shimmerLength = shimmerLength;
  }
  if (shimmerSpeed != null) {
    gridProps.shimmerSpeed = shimmerSpeed;
  }

  return <Grid {...gridProps} />;
}

LoadingGrid.displayName = "LoadingGrid";

export default LoadingGrid;
