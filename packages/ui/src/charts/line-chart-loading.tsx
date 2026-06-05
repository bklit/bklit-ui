"use client";

import { useCallback, useMemo, useState } from "react";
import type { Margin } from "./chart-context";
import { ChartLoadingLabel } from "./chart-loading-label";
import { Line } from "./line";
import { LineChart } from "./line-chart";
import { LineLoadingPulse } from "./line-loading-pulse";
import { LINE_LOADING_LOOP_PAUSE_MS } from "./line-loading-timing";
import { LoadingGrid } from "./loading-grid";

const LOADING_DATA_KEY = "value";
const LOADING_POINT_COUNT = 7;
const DEFAULT_LOADING_STROKE = "var(--foreground)";
const DEFAULT_LOADING_GRID_STROKE =
  "color-mix(in oklch, var(--chart-grid) 50%, transparent)";
const DEFAULT_LOADING_GRID_SHIMMER_STROKE =
  "color-mix(in oklch, var(--foreground) 68%, transparent)";
const DEFAULT_LOADING_STROKE_OPACITY = 0.5;

function generateLoadingLineData(
  pointCount: number
): Record<string, unknown>[] {
  const baseDate = new Date("2025-01-01");
  return Array.from({ length: pointCount }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return {
      date,
      [LOADING_DATA_KEY]: Math.round(
        110 + Math.sin(index * 1.15) * 36 + index * 9
      ),
    };
  });
}

export interface LineChartLoadingProps {
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Stroke color for the animated loading segment. */
  stroke?: string;
  /** Stroke opacity for the animated loading segment. Default: 0.5 */
  strokeOpacity?: number;
  /** Grid line stroke (color and opacity via color-mix or oklch alpha). */
  gridStroke?: string;
  /** Shimmer band stroke (color and opacity via color-mix or oklch alpha). */
  gridShimmerStroke?: string;
  /** Animate a shimmer band across grid lines. Default: true */
  gridShimmer?: boolean;
  /** Shimmer band width in pixels. Default: 140 */
  gridShimmerLength?: number;
  /** Shimmer speed multiplier (higher = faster). Default: 1 */
  gridShimmerSpeed?: number;
  /** Match shimmer loop to the loading line pulse (cycle + inter-loop pause). */
  gridShimmerSync?: boolean;
  /** Centered shimmer label text. Default: "Loading" */
  label?: string;
  /** Aspect ratio as "width / height". Default: "2 / 1" */
  aspectRatio?: string;
  /** Additional class name for the container */
  className?: string;
}

export function LineChartLoading({
  margin,
  stroke = DEFAULT_LOADING_STROKE,
  strokeOpacity = DEFAULT_LOADING_STROKE_OPACITY,
  gridStroke = DEFAULT_LOADING_GRID_STROKE,
  gridShimmerStroke = DEFAULT_LOADING_GRID_SHIMMER_STROKE,
  gridShimmer = true,
  gridShimmerLength,
  gridShimmerSpeed,
  gridShimmerSync = false,
  label = "Loading",
  aspectRatio = "2 / 1",
  className = "",
}: LineChartLoadingProps) {
  const [pulseEpoch, setPulseEpoch] = useState(0);
  const data = useMemo(() => generateLoadingLineData(LOADING_POINT_COUNT), []);

  const handleCycleComplete = useCallback(() => {
    window.setTimeout(() => {
      setPulseEpoch((epoch) => epoch + 1);
    }, LINE_LOADING_LOOP_PAUSE_MS);
  }, []);

  return (
    <div className="relative size-full">
      <LineChart
        animationDuration={0}
        aspectRatio={aspectRatio}
        className={className}
        data={data}
        margin={margin}
      >
        <LoadingGrid
          key={gridShimmerSync ? `loading-grid-${pulseEpoch}` : "loading-grid"}
          shimmer={gridShimmer}
          shimmerLength={gridShimmerLength}
          shimmerSpeed={gridShimmerSpeed}
          shimmerStroke={gridShimmerStroke}
          shimmerSync={gridShimmerSync}
          stroke={gridStroke}
        />
        <Line
          dataKey={LOADING_DATA_KEY}
          fadeEdges={false}
          showHighlight={false}
          stroke="transparent"
          strokeWidth={2.5}
        />
        <LineLoadingPulse
          dataKey={LOADING_DATA_KEY}
          key={pulseEpoch}
          onCycleComplete={handleCycleComplete}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
        />
      </LineChart>
      <ChartLoadingLabel text={label} />
    </div>
  );
}

export default LineChartLoading;
