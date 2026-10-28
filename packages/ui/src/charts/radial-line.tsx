"use client";

import {
  type CurveFactory,
  curveCatmullRom,
  curveCatmullRomClosed,
  lineRadial,
} from "d3-shape";
import { motion, type SpringOptions } from "motion/react";
import { memo, useId, useMemo } from "react";
import {
  createRadialEdgeLookup,
  type RadialDotMotion,
  RadialHoverDot,
  radialNumberAt,
  useRadialChart,
  useRadialDotAngle,
} from "./radial-chart";
import { createRadialScale, polarToCartesian } from "./radial-geometry";
import { radialSeriesColor } from "./radial-series-color";

export interface RadialLineProps {
  /**
   * Datum key plotted by this line. When it matches a `RadialChart` series the
   * line inherits its color / opacity and dims with the legend; any other key
   * (e.g. `"yesterday"`) is drawn as a comparison line.
   */
  dataKey: string;
  /** Stroke color. Default: the series color (else its palette slot), else var(--foreground) */
  stroke?: string;
  /** Stroke width in px. Default: 2 */
  strokeWidth?: number;
  /** Stroke opacity. Default: the series opacity, else 1 */
  strokeOpacity?: number;
  /**
   * Dash pattern — `true` for `strokeWidth` dashes with 3× gaps,
   * or any SVG `stroke-dasharray`. Default: solid
   */
  dash?: boolean | string;
  /**
   * d3 curve. Default: `curveCatmullRomClosed` for a closed loop, else
   * `curveCatmullRom` (smooth without overshooting the data)
   */
  curve?: CurveFactory;
  /** Join the last bin back to the first. Default: true when every bin has a value on a full circle */
  closed?: boolean;
  /**
   * Value mapped to the band top. Default: the chart's shared scale when
   * `RadialChart` has `maxValue`, else the largest value across every series
   * and this line
   */
  maxValue?: number;
  /** Point marker on the hovered bin, riding the line. Default: true */
  showMarkers?: boolean;
  /**
   * How the hover marker follows the pointer: locked to the crosshair (the
   * `RadialScrubber` spring), its own spring (`markerSpring`) or snapping to
   * the bin. Reduced motion always snaps. Default: "crosshair"
   */
  markerMotion?: RadialDotMotion;
  /** `markerMotion="spring"`: the marker's spring. Default: `{ stiffness: 240, damping: 24 }` */
  markerSpring?: SpringOptions;
  /** Marker at the line's last value ("now"). Default: true for open lines */
  showNowMarker?: boolean;
  /** Soft pulse around the "now" marker (off under reduced motion). Default: true */
  pulse?: boolean;
  /** Marker radius in px. Default: scales with the chart */
  markerRadius?: number;
  /** Opacity while another series is hovered in the legend. Default: 0.2 */
  fadedOpacity?: number;
  /** Delay before the clockwise draw starts, in seconds. Default: 0 */
  enterDelay?: number;
}

const DRAW_DURATION_S = 1.2;
const DRAW_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

interface Point {
  x: number;
  y: number;
}

const NowMarker = memo(function NowMarker({
  point,
  color,
  r,
  pulse,
  visible,
  animate,
  delay,
}: {
  point: Point;
  color: string;
  r: number;
  pulse: boolean;
  visible: boolean;
  animate: boolean;
  delay: number;
}) {
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: animate ? `opacity 0.3s ease-out ${delay}s` : undefined,
      }}
      transform={`translate(${point.x},${point.y})`}
    >
      {pulse ? (
        <motion.circle
          animate={{ scale: [1, 2.6], opacity: [0.35, 0] }}
          fill={color}
          r={r}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transition={{
            duration: 2,
            ease: "easeOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 0.4,
          }}
        />
      ) : null}
      <circle fill={color} fillOpacity={0.16} r={r * 2} />
      <circle
        fill={color}
        r={r}
        stroke="var(--background)"
        strokeWidth={Math.max(1.5, r * 0.5)}
      />
    </g>
  );
});

function isClosedLoop(isFullCircle: boolean, values: (number | null)[]) {
  return isFullCircle && values.every((v) => v !== null);
}

function ownRadialScale(
  maxValue: number,
  innerRadius: number,
  outerRadius: number
): (value: number) => number {
  const scale = createRadialScale({ maxValue, innerRadius, outerRadius });
  return (value) => scale(value) ?? innerRadius;
}

/** Edge lookup for the hover marker — the same curve as the drawn line. */
function lineEdgeLookup(
  values: (number | null)[],
  binAngle: (index: number) => number,
  scale: (value: number) => number,
  curve: CurveFactory
) {
  const indices = values.map((_, i) => i);
  return createRadialEdgeLookup((context) =>
    lineRadial<number>()
      .angle((i) => binAngle(i))
      .radius((i) => scale(values[i] ?? 0))
      .defined((i) => values[i] !== null)
      .curve(curve)
      .context(context)(indices)
  );
}

function resolveDashArray(
  dash: boolean | string | undefined,
  strokeWidth: number
): string | undefined {
  if (dash === true) {
    return `${strokeWidth} ${strokeWidth * 3}`;
  }
  return typeof dash === "string" ? dash : undefined;
}

/**
 * Smooth radial line for {@link RadialChart}: one value per bin plotted
 * around the 24h clock (00 at the top, clockwise) with `d3.lineRadial`.
 * Draws itself clockwise on enter, ends in a "now" marker and marks the
 * hovered bin with a dot that rides the line, locked to the crosshair by
 * default (`markerMotion`). Dash it and give it a non-series `dataKey` for a comparison line
 * (e.g. yesterday).
 */
export function RadialLine({
  dataKey,
  stroke: strokeProp,
  strokeWidth = 2,
  strokeOpacity: strokeOpacityProp,
  dash,
  curve: curveProp,
  closed: closedProp,
  maxValue: maxValueProp,
  showMarkers = true,
  markerMotion = "crosshair",
  markerSpring,
  showNowMarker: showNowMarkerProp,
  pulse = true,
  markerRadius: markerRadiusProp,
  fadedOpacity = 0.2,
  enterDelay = 0,
}: RadialLineProps) {
  const {
    data,
    series,
    binCount,
    radius,
    innerRadius,
    outerRadius,
    hoveredIndex,
    hoveredSeries,
    revealed,
    animate,
    reducedMotion,
    binAngle,
    isFullCircle,
    sharedValueScale,
    valueScale,
  } = useRadialChart();
  const maskId = `radial-line-mask-${useId().replace(/:/g, "")}`;

  const seriesIndex = series.findIndex((s) => s.dataKey === dataKey);
  const seriesConfig = seriesIndex >= 0 ? series[seriesIndex] : undefined;
  const stroke = strokeProp ?? radialSeriesColor(seriesConfig, seriesIndex);
  const strokeOpacity = strokeOpacityProp ?? seriesConfig?.opacity ?? 1;

  const values = useMemo(
    () => data.map((d) => radialNumberAt(d, dataKey)),
    [data, dataKey]
  );

  const maxValue = useMemo(() => {
    if (maxValueProp !== undefined) {
      return maxValueProp;
    }
    let max = 0;
    for (const d of data) {
      for (const key of [dataKey, ...series.map((s) => s.dataKey)]) {
        max = Math.max(max, radialNumberAt(d, key) ?? 0);
      }
    }
    return max;
  }, [maxValueProp, data, dataKey, series]);

  const scale = useMemo(
    () =>
      maxValueProp === undefined && sharedValueScale
        ? valueScale
        : ownRadialScale(maxValue, innerRadius, outerRadius),
    [
      maxValueProp,
      sharedValueScale,
      valueScale,
      maxValue,
      innerRadius,
      outerRadius,
    ]
  );

  const closed = closedProp ?? isClosedLoop(isFullCircle, values);
  const curve = curveProp ?? (closed ? curveCatmullRomClosed : curveCatmullRom);

  const pathD = useMemo(() => {
    if (binCount === 0 || outerRadius <= 0) {
      return null;
    }
    const indices = values.map((_, i) => i);
    const generator = lineRadial<number>()
      .angle((i) => binAngle(i))
      .radius((i) => scale(values[i] ?? 0))
      .defined((i) => values[i] !== null)
      .curve(curve);
    return generator(indices);
  }, [binCount, outerRadius, values, binAngle, scale, curve]);

  const edge = useMemo(
    () =>
      showMarkers && pathD
        ? lineEdgeLookup(values, binAngle, scale, curve)
        : null,
    [showMarkers, pathD, values, binAngle, scale, curve]
  );
  const markerAngle = useRadialDotAngle(markerMotion, markerSpring);

  const pointAt = (index: number | null): Point | null => {
    if (index === null) {
      return null;
    }
    const value = values[index];
    if (value === null || value === undefined) {
      return null;
    }
    return polarToCartesian(binAngle(index), scale(value));
  };

  const lastIndex = useMemo(() => {
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] !== null) {
        return i;
      }
    }
    return null;
  }, [values]);

  const showNowMarker = showNowMarkerProp ?? !closed;
  const markerRadius = markerRadiusProp ?? Math.max(3.5, radius * 0.016);
  const nowPoint = showNowMarker ? pointAt(lastIndex) : null;
  // Only while the hovered bin has a value on this line.
  const markerLookup = pointAt(hoveredIndex) ? edge : null;

  const dashArray = resolveDashArray(dash, strokeWidth);

  const dimmed = hoveredSeries !== null && hoveredSeries !== seriesIndex;
  const drawEnd = enterDelay + DRAW_DURATION_S;

  if (!pathD) {
    return null;
  }

  return (
    <g
      pointerEvents="none"
      style={{
        opacity: dimmed ? fadedOpacity : 1,
        transition: "opacity 0.15s ease-out",
      }}
    >
      {animate ? (
        <defs>
          <mask
            height={radius * 2}
            id={maskId}
            maskUnits="userSpaceOnUse"
            width={radius * 2}
            x={-radius}
            y={-radius}
          >
            <path
              d={pathD}
              fill="none"
              pathLength={1}
              stroke="white"
              strokeDasharray="1 1"
              strokeLinecap="butt"
              strokeWidth={strokeWidth + 6}
              style={{
                strokeDashoffset: revealed ? 0 : 1,
                transition: `stroke-dashoffset ${DRAW_DURATION_S}s ${DRAW_EASE} ${enterDelay}s`,
              }}
            />
          </mask>
        </defs>
      ) : null}

      <path
        d={pathD}
        fill="none"
        mask={animate ? `url(#${maskId})` : undefined}
        stroke={stroke}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />

      {nowPoint ? (
        <NowMarker
          animate={animate}
          color={stroke}
          delay={drawEnd}
          point={nowPoint}
          pulse={pulse && !reducedMotion}
          r={markerRadius}
          visible={revealed}
        />
      ) : null}

      {markerLookup ? (
        <RadialHoverDot
          angle={markerAngle}
          fill={stroke}
          fillOpacity={Math.max(strokeOpacity, 0.5)}
          lookup={markerLookup}
          r={markerRadius}
          stroke="var(--background)"
          strokeWidth={Math.max(1.5, markerRadius * 0.5)}
        />
      ) : null}
    </g>
  );
}

RadialLine.displayName = "RadialLine";

export default RadialLine;
