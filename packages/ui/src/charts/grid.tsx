"use client";

import { GridColumns, GridRows } from "@visx/grid";
import { useId } from "react";
import { chartCssVars, useChart } from "./chart-context";

export interface GridProps {
  /** Show horizontal grid lines. Default: true */
  horizontal?: boolean;
  /** Show vertical grid lines. Default: false */
  vertical?: boolean;
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
  fadeHorizontal?: boolean;
}

export function Grid({
  horizontal = true,
  vertical = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  stroke = chartCssVars.grid,
  strokeOpacity = 1,
  strokeWidth = 1,
  strokeDasharray = "4,4",
  fadeHorizontal = true,
}: GridProps) {
  const { xScale, yScale, innerWidth, innerHeight } = useChart();
  const uniqueId = useId();
  const maskId = `grid-rows-fade-${uniqueId}`;
  const gradientId = `${maskId}-gradient`;

  return (
    <g className="chart-grid">
      {/* Gradient mask for horizontal grid lines - fades at both ends */}
      {horizontal && fadeHorizontal && (
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
              height={innerHeight}
              width={innerWidth}
              x="0"
              y="0"
            />
          </mask>
        </defs>
      )}

      {horizontal && (
        <g mask={fadeHorizontal ? `url(#${maskId})` : undefined}>
          <GridRows
            numTicks={numTicksRows}
            scale={yScale}
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            width={innerWidth}
          />
        </g>
      )}
      {vertical && (
        <GridColumns
          height={innerHeight}
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

Grid.displayName = "Grid";

export default Grid;
