"use client";

import { arc as d3Arc } from "d3-shape";
import {
  animate as animateValue,
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { memo, useEffect, useId, useMemo } from "react";
import { radialNumberAt, useRadialChart } from "./radial-chart";
import { createRadialScale } from "./radial-geometry";
import { radialSeriesColor } from "./radial-series-color";

export interface RadialBarProps {
  /**
   * Datum key of a comparison value (e.g. yesterday's total), drawn as a dim
   * "ghost" bar in bins where no series has a value (the rest of the day).
   */
  ghostDataKey?: string;
  /** Ghost bar color. Default: var(--foreground) */
  ghostColor?: string;
  /** Ghost bar opacity. Default: 0.12 */
  ghostOpacity?: number;
  /**
   * Value mapped to the band top. Default: the chart's shared scale when
   * `RadialChart` has `maxValue`, else the largest stack / ghost value
   */
  maxValue?: number;
  /**
   * Angular gap between neighbouring bars in radians, held at a constant
   * width from the band base outward (d3 `padAngle` + `padRadius`).
   * Default: 18% of one bin's angle
   */
  padAngle?: number;
  /** Corner radius in px (d3 `arc.cornerRadius`). Default: 0 */
  cornerRadius?: number;
  /**
   * Radial gap in px between stacked segments. 0 (default) draws each bin as
   * one solid column whose outline carries `cornerRadius`; above 0 every
   * segment is rounded on its own.
   */
  stackGap?: number;
  /** Fraction of the band over which `rampFrom` series reach full opacity. Default: 0.6 */
  rampExtent?: number;
  /** Opacity of other bins while a bin is hovered. Default: 0.35 */
  fadedOpacity?: number;
  /** Opacity of other series while a legend item is hovered. Default: 0.2 */
  seriesFadedOpacity?: number;
}

const ENTER_SPREAD_S = 0.6;
const ENTER_DURATION_S = 0.6;
const ENTER_EASE = [0.2, 0.8, 0.2, 1] as const;

type ArcPath = (radii: {
  inner: number;
  outer: number;
  start: number;
  end: number;
  corner: number;
}) => string;

interface SegmentSpec {
  key: string;
  /** Series index, or -1 for the ghost */
  seriesIndex: number;
  fill: string;
  opacity: number;
  /** Stack bounds in value space */
  y0: number;
  y1: number;
}

interface ColumnSpec {
  index: number;
  start: number;
  end: number;
  segments: SegmentSpec[];
  delay: number;
}

const RadialBarSegment = memo(function RadialBarSegment({
  segment,
  column,
  progress,
  toRadius,
  arcPath,
  cornerRadius,
  stackGap,
  isTop,
  clipPath,
  dimmed,
  seriesFadedOpacity,
}: {
  segment: SegmentSpec;
  column: ColumnSpec;
  progress: MotionValue<number>;
  toRadius: (value: number) => number;
  arcPath: ArcPath;
  cornerRadius: number;
  stackGap: number;
  isTop: boolean;
  clipPath: string | undefined;
  dimmed: boolean;
  seriesFadedOpacity: number;
}) {
  const d = useTransform(progress, (p) => {
    const inner = toRadius(segment.y0 * p);
    const outer = Math.max(
      inner,
      toRadius(segment.y1 * p) - (isTop ? 0 : stackGap)
    );
    return arcPath({
      inner,
      outer,
      start: column.start,
      end: column.end,
      corner: stackGap > 0 ? cornerRadius : 0,
    });
  });
  return (
    // Opacity lives on a plain group: motion.path doesn't re-apply a changed
    // static `style.opacity`, which would break legend dimming.
    <g
      style={{
        opacity: segment.opacity * (dimmed ? seriesFadedOpacity : 1),
        transition: "opacity 0.15s ease-out",
      }}
    >
      <motion.path clipPath={clipPath} d={d} fill={segment.fill} />
    </g>
  );
});

const RadialBarColumn = memo(function RadialBarColumn({
  column,
  toRadius,
  arcPath,
  cornerRadius,
  stackGap,
  revealed,
  animate,
  faded,
  fadedOpacity,
  hoveredSeries,
  seriesFadedOpacity,
}: {
  column: ColumnSpec;
  toRadius: (value: number) => number;
  arcPath: ArcPath;
  cornerRadius: number;
  stackGap: number;
  revealed: boolean;
  animate: boolean;
  faded: boolean;
  fadedOpacity: number;
  hoveredSeries: number | null;
  seriesFadedOpacity: number;
}) {
  const progress = useMotionValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) {
      progress.jump(1);
      return;
    }
    if (!revealed) {
      return;
    }
    const controls = animateValue(progress, 1, {
      duration: ENTER_DURATION_S,
      delay: column.delay,
      ease: ENTER_EASE,
    });
    return () => controls.stop();
  }, [animate, revealed, progress, column.delay]);

  const top = column.segments.at(-1)?.y1 ?? 0;
  const clipId = `radial-bar-clip-${useId().replace(/:/g, "")}`;
  const useClip = cornerRadius > 0 && stackGap <= 0;
  const outline = useTransform(progress, (p) =>
    arcPath({
      inner: toRadius(0),
      outer: toRadius(top * p),
      start: column.start,
      end: column.end,
      corner: cornerRadius,
    })
  );

  if (column.segments.length === 0) {
    return null;
  }

  return (
    <g
      style={{
        opacity: faded ? fadedOpacity : 1,
        transition: "opacity 0.15s ease-out",
      }}
    >
      {useClip ? (
        <clipPath id={clipId}>
          <motion.path d={outline} />
        </clipPath>
      ) : null}
      {column.segments.map((segment, i) => (
        <RadialBarSegment
          arcPath={arcPath}
          clipPath={useClip ? `url(#${clipId})` : undefined}
          column={column}
          cornerRadius={cornerRadius}
          dimmed={
            hoveredSeries !== null && hoveredSeries !== segment.seriesIndex
          }
          isTop={i === column.segments.length - 1}
          key={segment.key}
          progress={progress}
          segment={segment}
          seriesFadedOpacity={seriesFadedOpacity}
          stackGap={stackGap}
          toRadius={toRadius}
        />
      ))}
    </g>
  );
});

/**
 * Radial stacked bars for {@link RadialChart} (after d3's radial stacked bar
 * chart): every bin is an arc column with one segment per series, innermost
 * series first, on a `scaleRadial` so segment *area* tracks the value. Bars
 * grow outward on enter, staggered clockwise from 12 o'clock.
 */
export function RadialBar({
  ghostDataKey,
  ghostColor = "var(--foreground)",
  ghostOpacity = 0.12,
  maxValue: maxValueProp,
  padAngle: padAngleProp,
  cornerRadius = 0,
  stackGap = 0,
  rampExtent = 0.6,
  fadedOpacity = 0.35,
  seriesFadedOpacity = 0.2,
}: RadialBarProps) {
  const {
    data,
    series,
    binCount,
    innerRadius,
    outerRadius,
    futureBins,
    hoveredIndex,
    hoveredSeries,
    revealed,
    animate,
    binStartAngle,
    binWidth,
    sharedValueScale,
    valueScale,
  } = useRadialChart();
  const gradientPrefix = `radial-bar-ramp-${useId().replace(/:/g, "")}`;

  const maxValue = useMemo(() => {
    if (maxValueProp !== undefined) {
      return maxValueProp;
    }
    let max = 0;
    data.forEach((d, i) => {
      const value = futureBins[i]
        ? ((ghostDataKey ? radialNumberAt(d, ghostDataKey) : 0) ?? 0)
        : series.reduce(
            (sum, s) => sum + Math.max(0, radialNumberAt(d, s.dataKey) ?? 0),
            0
          );
      max = Math.max(max, value);
    });
    return max;
  }, [maxValueProp, data, series, futureBins, ghostDataKey]);

  const toRadius = useMemo(() => {
    if (maxValueProp === undefined && sharedValueScale) {
      return (value: number) => valueScale(Math.max(0, value));
    }
    const scale = createRadialScale({ maxValue, innerRadius, outerRadius });
    return (value: number) => scale(Math.max(0, value)) ?? innerRadius;
  }, [
    maxValueProp,
    sharedValueScale,
    valueScale,
    maxValue,
    innerRadius,
    outerRadius,
  ]);

  const padAngle = padAngleProp ?? Math.abs(binWidth) * 0.18;

  const arcPath = useMemo((): ArcPath => {
    const generator = d3Arc<{
      inner: number;
      outer: number;
      start: number;
      end: number;
      corner: number;
    }>()
      .innerRadius((a) => a.inner)
      .outerRadius((a) => a.outer)
      .startAngle((a) => a.start)
      .endAngle((a) => a.end)
      .cornerRadius((a) => a.corner)
      .padAngle(padAngle)
      .padRadius(innerRadius);
    return (radii) => generator(radii) ?? "";
  }, [padAngle, innerRadius]);

  const rampFills = useMemo(
    () =>
      series.map((s, i) =>
        (s.rampFrom ?? 1) < 1 ? `url(#${gradientPrefix}-${i})` : null
      ),
    [series, gradientPrefix]
  );

  const columns = useMemo(
    (): ColumnSpec[] =>
      data.map((d, index) => {
        const start = binStartAngle(index);
        const delay = (index / Math.max(1, binCount)) * ENTER_SPREAD_S;
        const column = { index, start, end: start + binWidth, delay };
        if (futureBins[index]) {
          const ghost = ghostDataKey
            ? (radialNumberAt(d, ghostDataKey) ?? 0)
            : 0;
          return {
            ...column,
            segments:
              ghost > 0
                ? [
                    {
                      key: "ghost",
                      seriesIndex: -1,
                      fill: ghostColor,
                      opacity: ghostOpacity,
                      y0: 0,
                      y1: ghost,
                    },
                  ]
                : [],
          };
        }
        const segments: SegmentSpec[] = [];
        let y0 = 0;
        series.forEach((s, seriesIndex) => {
          const value = Math.max(0, radialNumberAt(d, s.dataKey) ?? 0);
          if (value <= 0) {
            return;
          }
          segments.push({
            key: s.dataKey,
            seriesIndex,
            fill: rampFills[seriesIndex] ?? radialSeriesColor(s, seriesIndex),
            opacity: s.opacity ?? 1,
            y0,
            y1: y0 + value,
          });
          y0 += value;
        });
        return { ...column, segments };
      }),
    [
      data,
      binCount,
      binStartAngle,
      binWidth,
      futureBins,
      ghostDataKey,
      ghostColor,
      ghostOpacity,
      series,
      rampFills,
    ]
  );

  if (binCount === 0 || outerRadius <= innerRadius) {
    return null;
  }

  const rampStart = innerRadius / outerRadius;
  const rampEnd =
    (innerRadius + (outerRadius - innerRadius) * rampExtent) / outerRadius;

  return (
    <g pointerEvents="none">
      <defs>
        {series.map((s, i) =>
          rampFills[i] ? (
            <radialGradient
              cx={0}
              cy={0}
              gradientUnits="userSpaceOnUse"
              id={`${gradientPrefix}-${i}`}
              key={s.dataKey}
              r={outerRadius}
            >
              <stop
                offset={rampStart}
                stopColor={radialSeriesColor(s, i)}
                stopOpacity={s.rampFrom ?? 1}
              />
              <stop
                offset={rampEnd}
                stopColor={radialSeriesColor(s, i)}
                stopOpacity={1}
              />
            </radialGradient>
          ) : null
        )}
      </defs>
      {columns.map((column) => (
        <RadialBarColumn
          animate={animate}
          arcPath={arcPath}
          column={column}
          cornerRadius={cornerRadius}
          faded={hoveredIndex !== null && hoveredIndex !== column.index}
          fadedOpacity={fadedOpacity}
          hoveredSeries={hoveredSeries}
          key={column.index}
          revealed={revealed}
          seriesFadedOpacity={seriesFadedOpacity}
          stackGap={stackGap}
          toRadius={toRadius}
        />
      ))}
    </g>
  );
}

RadialBar.displayName = "RadialBar";

export default RadialBar;
