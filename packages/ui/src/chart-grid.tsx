"use client";

import React from "react";
import { GridRows, GridColumns } from "@visx/grid";
import type { ScaleTime, ScaleLinear } from "@visx/scale";

export interface ChartGridProps {
  /** Width of the grid area */
  width: number;
  /** Height of the grid area */
  height: number;
  /** X scale (time scale) */
  xScale: ScaleTime<number, number>;
  /** Y scale (linear scale) */
  yScale: ScaleLinear<number, number>;
  /** Show horizontal grid lines. Default: true */
  showRows?: boolean;
  /** Show vertical grid lines. Default: false */
  showColumns?: boolean;
  /** Number of horizontal grid lines. Default: 5 */
  numTicksRows?: number;
  /** Number of vertical grid lines. Default: 10 */
  numTicksColumns?: number;
  /** Grid line stroke color. Default: var(--chart-grid) */
  stroke?: string;
  /** Grid line stroke opacity. Default: 1 */
  strokeOpacity?: number;
  /** Grid line stroke width. Default: 1 */
  strokeWidth?: number;
  /** Grid line dash array. Default: "4,4" for dashed lines */
  strokeDasharray?: string;
}

export function ChartGrid({
  width,
  height,
  xScale,
  yScale,
  showRows = true,
  showColumns = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  stroke = "var(--chart-grid)",
  strokeOpacity = 1,
  strokeWidth = 1,
  strokeDasharray = "4,4",
}: ChartGridProps) {
  return (
    <g className="chart-grid">
      {showRows && (
        <GridRows
          scale={yScale}
          width={width}
          numTicks={numTicksRows}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      )}
      {showColumns && (
        <GridColumns
          scale={xScale}
          height={height}
          numTicks={numTicksColumns}
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      )}
    </g>
  );
}

export default ChartGrid;

