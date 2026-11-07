"use client";

import { type CurveFactory, curveLinear } from "d3-shape";
import { useCallback, useId, useMemo } from "react";
import { useChart, useChartStable } from "./chart-context";
import {
  type FadeEdges,
  fadeGradientStops,
  resolveFadeSides,
} from "./fade-edges";
import { LinePath, linePathD } from "./line-path";
import { useProfitLossLegendHover } from "./profit-loss-legend-hover";

/** Semantic trend tokens with Tailwind fallbacks for apps without `--chart-positive` / `--chart-negative`. */
export const PROFIT_LOSS_POSITIVE_COLOR =
  "var(--chart-positive, var(--color-emerald-500))";
export const PROFIT_LOSS_NEGATIVE_COLOR =
  "var(--chart-negative, var(--color-red-500))";

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
  /** @deprecated No effect; x comes from the chart's `xDataKey`. */
  xDataKey?: string;
  strokeWidth?: number;
  positiveColor?: string;
  negativeColor?: string;
  /** Curve function. Default: curveLinear */
  curve?: CurveFactory;
  /**
   * Fade the line stroke toward transparent at the chart edges.
   * Default: false
   */
  fadeEdges?: FadeEdges;
}

function segmentLegendIndex(isPositive: boolean) {
  return isPositive ? 0 : 1;
}

export function ProfitLossLine({
  dataKey,
  strokeWidth = 2.5,
  positiveColor = PROFIT_LOSS_POSITIVE_COLOR,
  negativeColor = PROFIT_LOSS_NEGATIVE_COLOR,
  curve = curveLinear,
  fadeEdges = false,
}: ProfitLossLineProps) {
  const { tooltipData } = useChart();
  const { hoveredIndex } = useProfitLossLegendHover();
  const { renderData, xScale, yScale, xAccessor, innerWidth } =
    useChartStable();
  const reactId = useId();
  const fadeSides = resolveFadeSides(fadeEdges);
  const fadeStops = fadeSides.any ? fadeGradientStops(fadeSides) : null;
  const positiveGradientId = `profit-loss-gradient-pos-${dataKey}-${reactId}`;
  const negativeGradientId = `profit-loss-gradient-neg-${dataKey}-${reactId}`;

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

  // One continuous path, drawn twice and clipped above / below zero, so a
  // smooth curve stays smooth through each crossing (per-segment paths kink
  // there) and the colour switches exactly at the zero line.
  // Hover (tooltip / legend) re-renders only change opacity; reuse the path.
  const pathD = useMemo(
    () => linePathD(renderData, { curve, x: getX, y: getY }),
    [curve, getX, getY, renderData]
  );
  const [rangeBottom = 0, rangeTop = 0] = yScale.range();
  const plotTop = Math.min(rangeBottom, rangeTop);
  const plotBottom = Math.max(rangeBottom, rangeTop);
  const zeroY = Math.min(
    plotBottom,
    Math.max(plotTop, yScale(0) ?? plotBottom)
  );
  // Bleed so round caps and curve overshoot at the plot edges aren't clipped.
  const bleed = strokeWidth * 4;
  const clipX = -bleed;
  const clipWidth = innerWidth + bleed * 2;

  const sides = [
    {
      isPositive: true,
      clipId: `profit-loss-clip-pos-${dataKey}-${reactId}`,
      gradientId: positiveGradientId,
      color: positiveColor,
      y: plotTop - bleed,
      height: zeroY - (plotTop - bleed),
    },
    {
      isPositive: false,
      clipId: `profit-loss-clip-neg-${dataKey}-${reactId}`,
      gradientId: negativeGradientId,
      color: negativeColor,
      y: zeroY,
      height: plotBottom + bleed - zeroY,
    },
  ];

  return (
    <>
      <defs>
        {sides.map((side) => (
          <clipPath id={side.clipId} key={side.clipId}>
            <rect
              height={Math.max(0, side.height)}
              width={clipWidth}
              x={clipX}
              y={side.y}
            />
          </clipPath>
        ))}
        {fadeStops
          ? sides.map((side) => (
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id={side.gradientId}
                key={side.gradientId}
                x1={0}
                x2={innerWidth}
                y1={0}
                y2={0}
              >
                {fadeStops.map((stop) => (
                  <stop
                    key={stop.offset}
                    offset={stop.offset}
                    style={{ stopColor: side.color, stopOpacity: stop.opacity }}
                  />
                ))}
              </linearGradient>
            ))
          : null}
      </defs>
      {sides.map((side) => {
        const isDimmed =
          focusedLegendIndex !== null &&
          focusedLegendIndex !== segmentLegendIndex(side.isPositive);
        return (
          <g
            clipPath={`url(#${side.clipId})`}
            key={side.clipId}
            opacity={isDimmed ? LEGEND_DIM_OPACITY : 1}
            style={{ transition: "opacity 0.2s ease-in-out" }}
          >
            <LinePath
              d={pathD}
              stroke={fadeStops ? `url(#${side.gradientId})` : side.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
          </g>
        );
      })}
    </>
  );
}

ProfitLossLine.displayName = "ProfitLossLine";
