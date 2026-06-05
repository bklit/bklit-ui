"use client";

import { useCallback, useMemo, useState } from "react";
import type { Margin } from "./chart-context";
import { ChartLoadingLabel } from "./chart-loading-label";
import { Grid } from "./grid";
import { Line } from "./line";
import { LineChart } from "./line-chart";
import { LineLoadingPulse } from "./line-loading-pulse";

const LOADING_DATA_KEY = "value";
const LOADING_POINT_COUNT = 7;
const LOOP_PAUSE_MS = 280;
const DEFAULT_LOADING_STROKE = "var(--foreground)";
const DEFAULT_LOADING_GRID_OPACITY = 0.5;
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
  /** Horizontal grid line opacity. Default: 0.5 */
  gridStrokeOpacity?: number;
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
  gridStrokeOpacity = DEFAULT_LOADING_GRID_OPACITY,
  label = "Loading",
  aspectRatio = "2 / 1",
  className = "",
}: LineChartLoadingProps) {
  const [pulseEpoch, setPulseEpoch] = useState(0);
  const data = useMemo(() => generateLoadingLineData(LOADING_POINT_COUNT), []);

  const handleCycleComplete = useCallback(() => {
    window.setTimeout(() => {
      setPulseEpoch((epoch) => epoch + 1);
    }, LOOP_PAUSE_MS);
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
        <Grid horizontal strokeOpacity={gridStrokeOpacity} />
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
