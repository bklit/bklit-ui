"use client";

import { curveNatural } from "@visx/curve";
import { LinePath } from "@visx/shape";

// CurveFactory type - simplified version compatible with visx
// biome-ignore lint/suspicious/noExplicitAny: d3 curve factory type
type CurveFactory = any;

import { motion, useMotionTemplate, useSpring } from "motion/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { chartCssVars, useChart } from "./chart-context";
import { ChartRevealClip } from "./chart-reveal-clip";
import {
  resolveDashTailBounds,
  usePathStrokeMetrics,
} from "./path-stroke-utils";
import { SeriesDashTailOverlay } from "./series-dash-tail-overlay";
import { SeriesMarkers } from "./series-markers";
import type { SeriesPointMarkerStyle } from "./series-point-marker";
import { useLineSegmentHighlight } from "./use-line-segment-highlight";

export interface LineProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Stroke color. Default: var(--chart-line-primary) */
  stroke?: string;
  /** Stroke width. Default: 2.5 */
  strokeWidth?: number;
  /** Curve function. Default: curveNatural */
  curve?: CurveFactory;
  /** Whether to animate the line. Default: true */
  animate?: boolean;
  /** Whether to fade edges with gradient. Default: true */
  fadeEdges?: boolean;
  /** Whether to show highlight segment on hover. Default: true */
  showHighlight?: boolean;
  /** Render scatter-style circle markers at each data point. Default: false */
  showMarkers?: boolean;
  /** Marker styling (same options as Scatter). */
  markers?: SeriesPointMarkerStyle;
  /**
   * Data index from which the line stroke becomes dashed (inclusive).
   * Useful for projecting incomplete periods, e.g. dashed from yesterday through today.
   */
  dashFromIndex?: number;
  /** Dash pattern for the tail segment when `dashFromIndex` is set. Default: "6,4" */
  dashArray?: string;
}

export function Line({
  dataKey,
  stroke = chartCssVars.linePrimary,
  strokeWidth = 2.5,
  curve = curveNatural,
  animate = true,
  fadeEdges = true,
  showHighlight = true,
  showMarkers = false,
  markers,
  dashFromIndex,
  dashArray = "6,4",
}: LineProps) {
  const {
    data,
    xScale,
    yScale,
    innerHeight,
    innerWidth,
    tooltipData,
    selection,
    isLoaded,
    enterTransition,
    revealEpoch,
    xAccessor,
  } = useChart();

  const pathRef = useRef<SVGPathElement>(null);
  const pathMetricsKey = `${data.length}:${innerWidth}:${dashFromIndex}:${animate}`;
  const { pathLength, pathD } = usePathStrokeMetrics(pathRef, pathMetricsKey);

  const gradientId = useMemo(
    () => `line-gradient-${dataKey}-${Math.random().toString(36).slice(2, 9)}`,
    [dataKey]
  );

  const segmentBounds = useLineSegmentHighlight({
    pathRef,
    pathLength,
    data,
    tooltipData,
    selection,
    xScale,
    xAccessor,
  });

  const springConfig = { stiffness: 180, damping: 28 };
  const offsetSpring = useSpring(0, springConfig);
  const segmentLengthSpring = useSpring(0, springConfig);

  useEffect(() => {
    offsetSpring.set(-segmentBounds.startLength);
    segmentLengthSpring.set(segmentBounds.segmentLength);
  }, [
    segmentBounds.startLength,
    segmentBounds.segmentLength,
    offsetSpring,
    segmentLengthSpring,
  ]);

  const animatedDasharray = useMotionTemplate`${segmentLengthSpring} ${pathLength}`;

  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : 0;
    },
    [dataKey, yScale]
  );

  const isHovering = tooltipData !== null || selection?.active === true;
  const hasDashTail = resolveDashTailBounds(dashFromIndex, data.length);
  const lineStroke = fadeEdges ? `url(#${gradientId})` : stroke;

  return (
    <>
      {fadeEdges ? (
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0 }} />
            <stop offset="15%" style={{ stopColor: stroke, stopOpacity: 1 }} />
            <stop offset="85%" style={{ stopColor: stroke, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      ) : null}

      {animate && data.length > 1 ? (
        <defs>
          <ChartRevealClip
            clipPathId={`grow-clip-${dataKey}`}
            enterTransition={enterTransition}
            height={innerHeight + 20}
            revealEpoch={revealEpoch ?? 0}
            targetWidth={innerWidth}
          />
        </defs>
      ) : null}

      <g
        clipPath={
          animate && data.length > 1 ? `url(#grow-clip-${dataKey})` : undefined
        }
      >
        <motion.g
          animate={{ opacity: isHovering && showHighlight ? 0.3 : 1 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <LinePath
            curve={curve}
            data={data}
            innerRef={pathRef}
            stroke={hasDashTail ? "transparent" : lineStroke}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x={(d) => xScale(xAccessor(d)) ?? 0}
            y={getY}
          />

          <SeriesDashTailOverlay
            dashArray={dashArray}
            dashFromIndex={dashFromIndex}
            data={data}
            innerHeight={innerHeight}
            innerWidth={innerWidth}
            pathD={pathD}
            pathLength={pathLength}
            pathRef={pathRef}
            stroke={lineStroke}
            strokeWidth={strokeWidth}
            xAccessor={xAccessor}
            xScale={xScale}
          />
        </motion.g>
      </g>

      {showMarkers ? (
        <SeriesMarkers
          animate={animate}
          dataKey={dataKey}
          {...markers}
          fill={markers?.fill ?? stroke}
          stroke={markers?.stroke ?? markers?.fill ?? stroke}
        />
      ) : null}

      {showHighlight && isHovering && isLoaded && pathRef.current ? (
        <motion.path
          animate={{ opacity: 1 }}
          d={pathRef.current.getAttribute("d") || ""}
          exit={{ opacity: 0 }}
          fill="none"
          initial={{ opacity: 0 }}
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{
            strokeDasharray: animatedDasharray,
            strokeDashoffset: offsetSpring,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      ) : null}
    </>
  );
}

Line.displayName = "Line";

export default Line;
