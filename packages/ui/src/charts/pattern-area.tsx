"use client";

import { type CurveFactory, curveMonotoneX } from "d3-shape";
import { useId, useMemo } from "react";
import { useChartStable } from "./chart-context";
import {
  areaVerticalFadeStops,
  type FadeEdges,
  fadeGradientStops,
  resolveFadeSides,
  viewportFadeGradientAttrs,
} from "./fade-edges";
import { areaClosedD } from "./line-path";

export interface PatternAreaProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Fill color or pattern URL (e.g. `url(#pattern-id)`) */
  fill: string;
  /** Curve function. Default: curveMonotoneX */
  curve?: CurveFactory;
  /** Pattern opacity. Default: 1 */
  fillOpacity?: number;
  /**
   * Fade the pattern out over the bottom N% of the area height (0–100), same
   * as `Area`'s `fadeBottom`. Default: 0 (no fade)
   */
  fadeBottom?: number;
  /**
   * Fade the pattern toward transparent at the chart edges — same values as
   * `Area`: `true`, `"left"`, `"right"` or `{ left, right }` in % of the plot
   * width. Default: false
   */
  fadeEdges?: FadeEdges;
  /** @deprecated Pattern fill is not clip-revealed; only the stroke `Area` animates. */
  animate?: boolean;
}

/**
 * Filled area using an SVG pattern (`url(#id)`).
 * Pair with `PatternPreset` in `AreaChart` children and an `Area` with `fillOpacity={0}` for the stroke line.
 */
export function PatternArea({
  dataKey,
  fill,
  curve = curveMonotoneX,
  fillOpacity = 1,
  fadeBottom = 0,
  fadeEdges = false,
}: PatternAreaProps) {
  const { renderData, xScale, yScale, xAccessor, innerWidth, innerHeight } =
    useChartStable();
  const uid = useId();

  const d = useMemo(
    () =>
      areaClosedD(renderData, {
        curve,
        x: (datum) => xScale(xAccessor(datum)) ?? 0,
        y: (datum) => {
          const v = datum[dataKey];
          return typeof v === "number" ? (yScale(v) ?? 0) : 0;
        },
        yScale,
      }),
    [curve, dataKey, renderData, xAccessor, xScale, yScale]
  );

  const hasVerticalFade = fillOpacity !== 1 || fadeBottom > 0;
  const sides = resolveFadeSides(fadeEdges);
  const hasEdgeFade = sides.any && innerWidth > 0;

  if (!(hasVerticalFade || hasEdgeFade)) {
    return <path d={d} fill={fill} />;
  }

  const baseId = `pattern-area-${dataKey}-${uid}`;
  const verticalMaskId = `${baseId}-v`;
  const edgeMaskId = `${baseId}-e`;
  const verticalStops = areaVerticalFadeStops({
    topOpacity: fillOpacity,
    fadeBottom,
    gradientToOpacity: fillOpacity,
  });

  const path = (
    <path
      d={d}
      fill={fill}
      mask={hasVerticalFade ? `url(#${verticalMaskId})` : undefined}
    />
  );

  return (
    <>
      <defs>
        {hasVerticalFade ? (
          <>
            {/* Bounding-box units: the fade runs from the area's peak to its
                baseline, matching `Area`'s gradient fill. */}
            <linearGradient
              id={`${verticalMaskId}-g`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              {verticalStops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor="white"
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
            <mask id={verticalMaskId} maskContentUnits="objectBoundingBox">
              <rect fill={`url(#${verticalMaskId}-g)`} height="1" width="1" />
            </mask>
          </>
        ) : null}
        {hasEdgeFade ? (
          <>
            <linearGradient
              id={`${edgeMaskId}-g`}
              {...viewportFadeGradientAttrs(innerWidth)}
            >
              {fadeGradientStops(sides).map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor="white"
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
            <mask
              height={innerHeight}
              id={edgeMaskId}
              maskUnits="userSpaceOnUse"
              width={innerWidth}
              x="0"
              y="0"
            >
              <rect
                fill={`url(#${edgeMaskId}-g)`}
                height={innerHeight}
                width={innerWidth}
              />
            </mask>
          </>
        ) : null}
      </defs>
      {hasEdgeFade ? <g mask={`url(#${edgeMaskId})`}>{path}</g> : path}
    </>
  );
}

PatternArea.displayName = "PatternArea";

export default PatternArea;
