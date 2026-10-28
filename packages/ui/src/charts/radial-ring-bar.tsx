"use client";

import { arc as d3Arc } from "d3-shape";
import {
  animate as animateValue,
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { memo, useEffect, useMemo } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";
import { radialNumberAt, useRadialChart } from "./radial-chart";
import { radialSeriesColor } from "./radial-series-color";
import { useEnterComplete } from "./use-enter-complete";

export interface RadialRingBarProps {
  /**
   * Value mapped to the arc end. Default: the chart's value domain
   * (`RadialChart maxValue`, else the largest per-ring stack)
   */
  maxValue?: number;
  /** Corner radius in px, or "round" for fully rounded ends. Default: 0 */
  cornerRadius?: number | "round";
  /**
   * Gap between stacked segments in px — constant across the ring's
   * thickness (parallel edges), whatever the ring's radius. Default: 0
   */
  segmentGap?: number;
  /** Faint full-arc track behind every ring. Default: true */
  track?: boolean;
  /** Track color. Default: var(--foreground) */
  trackColor?: string;
  /** Track opacity. Default: 0.06 */
  trackOpacity?: number;
  /** Opacity of other rings while a ring is hovered. Default: 0.35 */
  fadedOpacity?: number;
  /** Opacity of other series while a legend item is hovered. Default: 0.2 */
  seriesFadedOpacity?: number;
}

/*
 * Enter timing — matches RingChart's `Ring`: each ring's track scales out of
 * the center (staggered 80ms), then its value sweeps along the arc from the
 * start angle (0.6s in, staggered 100ms), both on the default chart enter
 * tween.
 */
const EXPAND_STAGGER_S = 0.08;
const SWEEP_DELAY_S = 0.6;
const SWEEP_STAGGER_S = 0.1;

interface RingSegment {
  key: string;
  seriesIndex: number;
  fill: string;
  opacity: number;
  y0: number;
  y1: number;
  /** Extend the start / end by half a pad so the outer edges stay flush */
  padStart: boolean;
  padEnd: boolean;
}

interface ArcDatum {
  inner: number;
  outer: number;
  start: number;
  end: number;
  pad: number;
}

/** 0 → 1 enter progress on the chart enter tween, once the chart is revealed. */
function useEnterProgress(
  animate: boolean,
  revealed: boolean,
  delay: number
): MotionValue<number> {
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
      ...DEFAULT_CHART_ENTER_TRANSITION,
      delay,
    });
    return () => controls.stop();
  }, [animate, revealed, progress, delay]);
  return progress;
}

function segmentArc(
  segment: RingSegment,
  p: number,
  inner: number,
  outer: number,
  pad: number,
  direction: number,
  toAngle: (value: number) => number
): ArcDatum {
  const half = (pad / 2) * direction;
  return {
    inner,
    outer,
    start: toAngle(segment.y0 * p) - (segment.padStart ? half : 0),
    end: toAngle(segment.y1 * p) + (segment.padEnd ? half : 0),
    pad,
  };
}

const RingSegmentPath = memo(function RingSegmentPath({
  segment,
  progress,
  static: isStatic,
  arcPath,
  inner,
  outer,
  pad,
  direction,
  toAngle,
  dimmed,
  seriesFadedOpacity,
}: {
  segment: RingSegment;
  progress: MotionValue<number>;
  static: boolean;
  arcPath: (d: ArcDatum) => string;
  inner: number;
  outer: number;
  pad: number;
  direction: number;
  toAngle: (value: number) => number;
  dimmed: boolean;
  seriesFadedOpacity: number;
}) {
  const d = useTransform(progress, (p) =>
    arcPath(segmentArc(segment, p, inner, outer, pad, direction, toAngle))
  );
  return (
    <g
      style={{
        opacity: segment.opacity * (dimmed ? seriesFadedOpacity : 1),
        transition: "opacity 0.15s ease-out",
      }}
    >
      {isStatic ? (
        <path
          d={arcPath(
            segmentArc(segment, 1, inner, outer, pad, direction, toAngle)
          )}
          fill={segment.fill}
        />
      ) : (
        <motion.path d={d} fill={segment.fill} />
      )}
    </g>
  );
});

const RingRow = memo(function RingRow({
  index,
  segments,
  inner,
  outer,
  pad,
  direction,
  arcPath,
  toAngle,
  trackPath,
  trackColor,
  trackOpacity,
  revealed,
  animate,
  faded,
  fadedOpacity,
  hoveredSeries,
  seriesFadedOpacity,
}: {
  index: number;
  segments: RingSegment[];
  inner: number;
  outer: number;
  pad: number;
  direction: number;
  arcPath: (d: ArcDatum) => string;
  toAngle: (value: number) => number;
  trackPath: string | null;
  trackColor: string;
  trackOpacity: number;
  revealed: boolean;
  animate: boolean;
  faded: boolean;
  fadedOpacity: number;
  hoveredSeries: number | null;
  seriesFadedOpacity: number;
}) {
  const expand = useEnterProgress(animate, revealed, index * EXPAND_STAGGER_S);
  const sweep = useEnterProgress(
    animate,
    revealed,
    SWEEP_DELAY_S + index * SWEEP_STAGGER_S
  );
  const expandDone = useEnterComplete(expand);
  const sweepDone = useEnterComplete(sweep);

  const content = (
    <>
      {trackPath ? (
        <path d={trackPath} fill={trackColor} fillOpacity={trackOpacity} />
      ) : null}
      {segments.map((segment) => (
        <RingSegmentPath
          arcPath={arcPath}
          dimmed={
            hoveredSeries !== null && hoveredSeries !== segment.seriesIndex
          }
          direction={direction}
          inner={inner}
          key={segment.key}
          outer={outer}
          pad={pad}
          progress={sweep}
          segment={segment}
          seriesFadedOpacity={seriesFadedOpacity}
          static={!animate || sweepDone}
          toAngle={toAngle}
        />
      ))}
    </>
  );

  return (
    <g
      style={{
        opacity: faded ? fadedOpacity : 1,
        transition: "opacity 0.15s ease-out",
      }}
    >
      {!animate || expandDone ? (
        content
      ) : (
        <motion.g style={{ scale: expand, transformOrigin: "0px 0px" }}>
          {content}
        </motion.g>
      )}
    </g>
  );
});

/**
 * Concentric ring bars for an `orientation="angular"` {@link RadialChart}
 * (MUI-style "horizontal" radial bars / progress rings): every bin is a
 * ring, first bin innermost, and each series' value sweeps along the arc
 * from the start angle, stacked end to end. Works on full circles and
 * partial arcs (e.g. `startAngle={-90} endAngle={90}`). Enters like
 * `RingChart`: tracks grow out of the center, then values sweep in. For
 * single-value progress rings with hover glow, `RingChart` is the simpler
 * choice.
 */
export function RadialRingBar({
  maxValue: maxValueProp,
  cornerRadius = 0,
  segmentGap = 0,
  track = true,
  trackColor = "var(--foreground)",
  trackOpacity = 0.06,
  fadedOpacity = 0.35,
  seriesFadedOpacity = 0.2,
}: RadialRingBarProps) {
  const {
    data,
    series,
    binCount,
    startAngle,
    endAngle,
    isFullCircle,
    valueDomain,
    valueToAngle,
    ringBand,
    hoveredIndex,
    hoveredSeries,
    revealed,
    animate,
  } = useRadialChart();

  const direction = endAngle >= startAngle ? 1 : -1;

  const toAngle = useMemo(() => {
    if (maxValueProp === undefined) {
      return valueToAngle;
    }
    const lo = valueDomain[0];
    const span = endAngle - startAngle;
    return (value: number) => {
      const t = maxValueProp > lo ? (value - lo) / (maxValueProp - lo) : 0;
      return startAngle + Math.min(1, Math.max(0, t)) * span;
    };
  }, [maxValueProp, valueToAngle, valueDomain, startAngle, endAngle]);

  const arcPath = useMemo(() => {
    // d3 pads by a constant linear width (padRadius × padAngle) on both
    // edges, so segment gaps stay parallel and rounded corners stay intact.
    const generator = d3Arc<ArcDatum>()
      .innerRadius((d) => d.inner)
      .outerRadius((d) => d.outer)
      .startAngle((d) => d.start)
      .endAngle((d) => d.end)
      .padAngle((d) => d.pad)
      .cornerRadius((d) =>
        cornerRadius === "round" ? (d.outer - d.inner) / 2 : cornerRadius
      );
    return (d: ArcDatum) =>
      Math.abs(d.end - d.start) <= d.pad + 1e-4 ? "" : (generator(d) ?? "");
  }, [cornerRadius]);

  const rings = useMemo(
    () =>
      data.map((d, index) => {
        const band = ringBand(index);
        const segments: RingSegment[] = [];
        let y0 = 0;
        series.forEach((s, seriesIndex) => {
          const value = Math.max(0, radialNumberAt(d, s.dataKey) ?? 0);
          if (value <= 0) {
            return;
          }
          segments.push({
            key: s.dataKey,
            seriesIndex,
            fill: radialSeriesColor(s, seriesIndex),
            opacity: s.opacity ?? 1,
            y0,
            y1: y0 + value,
            padStart: false,
            padEnd: false,
          });
          y0 += value;
        });
        // Gaps only between segments: the first segment keeps its start on
        // the start angle and the last its true end (full circles keep a
        // gap at the seam too).
        const first = segments[0];
        const last = segments.at(-1);
        if (first && last && !isFullCircle) {
          first.padStart = true;
          last.padEnd = true;
        }
        // d3's default pad radius: √(inner² + outer²)
        const padRadius = Math.sqrt(band.inner ** 2 + band.outer ** 2);
        const pad =
          segmentGap > 0 && segments.length > 0 && padRadius > 0
            ? segmentGap / padRadius
            : 0;
        return { index, band, segments, pad };
      }),
    [data, series, ringBand, segmentGap, isFullCircle]
  );

  if (binCount === 0) {
    return null;
  }

  return (
    <g pointerEvents="none">
      {rings.map((ring) => (
        <RingRow
          animate={animate}
          arcPath={arcPath}
          direction={direction}
          faded={hoveredIndex !== null && hoveredIndex !== ring.index}
          fadedOpacity={fadedOpacity}
          hoveredSeries={hoveredSeries}
          index={ring.index}
          inner={ring.band.inner}
          key={ring.index}
          outer={ring.band.outer}
          pad={ring.pad}
          revealed={revealed}
          segments={ring.segments}
          seriesFadedOpacity={seriesFadedOpacity}
          toAngle={toAngle}
          trackColor={trackColor}
          trackOpacity={trackOpacity}
          trackPath={
            track
              ? arcPath({
                  inner: ring.band.inner,
                  outer: ring.band.outer,
                  start: startAngle,
                  end: endAngle,
                  pad: 0,
                })
              : null
          }
        />
      ))}
    </g>
  );
}

RadialRingBar.displayName = "RadialRingBar";

export default RadialRingBar;
