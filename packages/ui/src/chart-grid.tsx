"use client";

import { GridColumns, GridRows } from "@visx/grid";
import type { scaleLinear, scaleTime } from "@visx/scale";
import { useId } from "react";

type ScaleLinear<Output, _Input = number> = ReturnType<
  typeof scaleLinear<Output>
>;
type ScaleTime<Output, _Input = Date | number> = ReturnType<
  typeof scaleTime<Output>
>;

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
  /** Enable horizontal fade effect on grid rows. Default: true */
  fadeRows?: boolean;
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
  fadeRows = true,
}: ChartGridProps) {
  const uniqueId = useId();
  const maskId = `chart-grid-rows-fade-${uniqueId}`;
  const gradientId = `${maskId}-gradient`;

  return (
    <g className="chart-grid">
      {/* Gradient mask for horizontal grid lines - fades at both ends */}
      {showRows && fadeRows && (
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0 }} />
            <stop offset="10%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop offset="90%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop
              offset="100%"
              style={{ stopColor: "white", stopOpacity: 0 }}
            />
          </linearGradient>
          <mask id={maskId}>
            <rect
              fill={`url(#${gradientId})`}
              height={height}
              width={width}
              x="0"
              y="0"
            />
          </mask>
        </defs>
      )}

      {showRows && (
        <g mask={fadeRows ? `url(#${maskId})` : undefined}>
          <GridRows
            numTicks={numTicksRows}
            scale={yScale}
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            width={width}
          />
        </g>
      )}
      {showColumns && (
        <GridColumns
          height={height}
          numTicks={numTicksColumns}
          scale={xScale}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      )}
    </g>
  );
}

export default ChartGrid;
