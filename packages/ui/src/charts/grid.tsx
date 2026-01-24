"use client";

import { GridColumns, GridRows } from "@visx/grid";
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
}: GridProps) {
  const { xScale, yScale, innerWidth, innerHeight } = useChart();

  return (
    <g className="chart-grid">
      {horizontal && (
        <GridRows
          numTicks={numTicksRows}
          scale={yScale}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          width={innerWidth}
        />
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
