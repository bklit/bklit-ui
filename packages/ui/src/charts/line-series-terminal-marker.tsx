"use client";

import { useMemo } from "react";
import { useChartStable, useYScale } from "./chart-context";
import { StaticSeriesPointMarker } from "./series-point-marker";

export interface LineSeriesTerminalMarkerProps {
  dataKey: string;
  yAxisId?: string | number;
  fill?: string;
  stroke?: string;
  radius?: number;
  ringGap?: number;
  strokeWidth?: number;
}

/** Hollow ring at the last data point — shared anchor for projection lines. */
export function LineSeriesTerminalMarker({
  dataKey,
  yAxisId,
  fill = "transparent",
  stroke = "var(--chart-1)",
  radius = 5,
  ringGap = 0,
  strokeWidth = 1.5,
}: LineSeriesTerminalMarkerProps) {
  const { data, xScale, xAccessor, chartPhase } = useChartStable();
  const yScale = useYScale(yAxisId);

  const point = useMemo(() => {
    const lastRow = data.at(-1);
    if (!lastRow) {
      return null;
    }
    const value = lastRow[dataKey];
    if (typeof value !== "number") {
      return null;
    }
    return {
      cx: xScale(xAccessor(lastRow)) ?? 0,
      cy: yScale(value) ?? 0,
    };
  }, [data, dataKey, xAccessor, xScale, yScale]);

  const showStroke =
    chartPhase === "revealing" ||
    chartPhase === "ready" ||
    chartPhase === "exitingReady";

  if (!(showStroke && point)) {
    return null;
  }

  return (
    <StaticSeriesPointMarker
      cx={point.cx}
      cy={point.cy}
      fill={fill}
      radius={radius}
      ringGap={ringGap}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

LineSeriesTerminalMarker.displayName = "LineSeriesTerminalMarker";

(
  LineSeriesTerminalMarker as unknown as Record<string, boolean>
).__isPostOverlay = true;

export default LineSeriesTerminalMarker;
