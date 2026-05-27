"use client";

import { curveLinear } from "@visx/curve";
import { LinePath } from "@visx/shape";
import { useCallback, useMemo } from "react";
import { useChart, useChartStable } from "./chart-context";
import { useProfitLossLegendHover } from "./profit-loss-legend-hover";
import { splitProfitLossSegments } from "./profit-loss-segments";

export const PROFIT_LOSS_POSITIVE_COLOR = "var(--color-emerald-500)";
export const PROFIT_LOSS_NEGATIVE_COLOR = "var(--color-red-500)";

const LEGEND_DIM_OPACITY = 0.25;

export function profitLossColor(value: number) {
  return value >= 0 ? PROFIT_LOSS_POSITIVE_COLOR : PROFIT_LOSS_NEGATIVE_COLOR;
}

export const PROFIT_LOSS_TOOLTIP_LABEL_FALLBACK = "Profit/Loss";

export function resolveProfitLossTooltipLabel(label: string) {
  const trimmed = label.trim();
  return trimmed || PROFIT_LOSS_TOOLTIP_LABEL_FALLBACK;
}

export interface ProfitLossLineProps {
  dataKey: string;
  xDataKey?: string;
  strokeWidth?: number;
  positiveColor?: string;
  negativeColor?: string;
}

function segmentLegendIndex(isPositive: boolean) {
  return isPositive ? 0 : 1;
}

export function ProfitLossLine({
  dataKey,
  xDataKey = "date",
  strokeWidth = 2.5,
  positiveColor = PROFIT_LOSS_POSITIVE_COLOR,
  negativeColor = PROFIT_LOSS_NEGATIVE_COLOR,
}: ProfitLossLineProps) {
  const { tooltipData } = useChart();
  const { hoveredIndex } = useProfitLossLegendHover();
  const { renderData, xScale, yScale, xAccessor } = useChartStable();

  const focusedLegendIndex = useMemo(() => {
    if (hoveredIndex !== null) {
      return hoveredIndex;
    }
    if (!tooltipData) {
      return null;
    }
    const value = tooltipData.point[dataKey];
    if (typeof value !== "number") {
      return null;
    }
    return segmentLegendIndex(value >= 0);
  }, [dataKey, hoveredIndex, tooltipData]);

  const segments = useMemo(
    () =>
      splitProfitLossSegments({
        data: renderData,
        dataKey,
        xDataKey,
        xAccessor,
      }),
    [dataKey, renderData, xAccessor, xDataKey]
  );

  const getX = useCallback(
    (d: Record<string, unknown>) => xScale(xAccessor(d)) ?? 0,
    [xAccessor, xScale]
  );

  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : 0;
    },
    [dataKey, yScale]
  );

  return (
    <>
      {segments.map((segment) => {
        const isDimmed =
          focusedLegendIndex !== null &&
          focusedLegendIndex !== segmentLegendIndex(segment.isPositive);
        const firstPoint = segment.data[0];
        const lastPoint = segment.data.at(-1);
        const segmentKey = `${dataKey}-${segment.isPositive ? "pos" : "neg"}-${String(firstPoint?.[xDataKey])}-${String(lastPoint?.[xDataKey])}`;

        return (
          <g
            key={segmentKey}
            opacity={isDimmed ? LEGEND_DIM_OPACITY : 1}
            style={{ transition: "opacity 0.2s ease-in-out" }}
          >
            <LinePath
              curve={curveLinear}
              data={segment.data}
              stroke={segment.isPositive ? positiveColor : negativeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              x={getX}
              y={getY}
            />
          </g>
        );
      })}
    </>
  );
}
