"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo, useMemo } from "react";
import {
  GRID_ANGLE_LABEL_FADE_S,
  GRID_ANGLE_LABEL_STAGGER_S,
  GRID_RING_STAGGER_S,
  GRID_SPOKE_SPRING,
  GRID_SPOKE_STAGGER_S,
  gridLabelDelay,
} from "./animation";
import {
  isFullArc,
  outsideArcLabelPoint,
  polarToCartesian,
} from "./arc-geometry";
import { transitionWithDelay } from "./motion-utils";
import { ringCssVars, useRingStable } from "./ring-context";

export interface RingGridProps {
  /**
   * Progress ticks as fractions of each ring's `maxValue` (0–1), or the
   * number of equal intervals. Default: 4 (0 / 25 / 50 / 75 / 100%)
   */
  ticks?: number | number[];
  /** Tick label format. Default: whole percent ("25%") */
  tickFormat?: (fraction: number) => string;
  /** Spokes across the rings at every tick. Default: true */
  showSpokes?: boolean;
  /** Tick labels along the outer edge of the arc. Default: true */
  showLabels?: boolean;
  /** Spoke color. Default: var(--chart-foreground) */
  stroke?: string;
  /** Spoke opacity. Default: 0.2 */
  strokeOpacity?: number;
  /** Spoke overhang past the outermost ring, px. Default: 4 */
  tickLength?: number;
  /** Tick label color. Default: var(--chart-label) */
  labelColor?: string;
  /** Tick label font size, px. Default: scales with the chart (9–12) */
  fontSize?: number;
  /** Gap between the spoke end and its label, px. Default: 4 */
  labelOffset?: number;
}

const defaultTickFormat = (fraction: number) =>
  `${Math.round(fraction * 100)}%`;

/** Default `RingChart` padding when a `RingGrid` is present (label room). */
export const RING_GRID_PADDING = 32;

function resolveTicks(ticks: number | number[], fullCircle: boolean) {
  const list =
    typeof ticks === "number"
      ? Array.from(
          { length: Math.max(1, Math.round(ticks)) + 1 },
          (_, i) => i / Math.max(1, Math.round(ticks))
        )
      : ticks;
  const clamped = list.filter((t) => t >= 0 && t <= 1);
  // On a full circle 100% lands on 0% — keep one of them.
  return fullCircle && clamped.includes(0)
    ? clamped.filter((t) => t < 1)
    : clamped;
}

/**
 * Circular grid for {@link RingChart}: spokes across the rings at progress
 * intervals with tick labels around the outer edge. Place it before the
 * `Ring`s so the spokes sit behind the progress fill.
 *
 * Enters like the radar grid: spokes extend outward one after another, then
 * the tick labels fade in while sliding out from the center.
 */
export const RingGrid = memo(function RingGrid({
  ticks = 4,
  tickFormat = defaultTickFormat,
  showSpokes = true,
  showLabels = true,
  stroke = ringCssVars.foreground,
  strokeOpacity = 0.2,
  tickLength = 4,
  labelColor = ringCssVars.label,
  fontSize: fontSizeProp,
  labelOffset = 4,
}: RingGridProps) {
  const {
    data,
    size,
    startAngle,
    endAngle,
    getRingRadii,
    enterTransition,
    enterStaggerScale,
    animationKey,
    geometryScrubbing,
  } = useRingStable();
  const reducedMotion = useReducedMotion() ?? false;
  const isStatic = reducedMotion || geometryScrubbing;

  const fontSize = fontSizeProp ?? Math.min(12, Math.max(9, size / 26));
  const ringCount = data.length;

  const geometry = useMemo(() => {
    if (ringCount === 0) {
      return null;
    }
    const inner = getRingRadii(0).innerRadius;
    const outer = getRingRadii(ringCount - 1).outerRadius + tickLength;
    const span = endAngle - startAngle;
    return resolveTicks(ticks, isFullArc(startAngle, endAngle)).map(
      (fraction) => {
        const angle = startAngle + span * fraction;
        const text = tickFormat(fraction);
        return {
          key: `tick-${fraction}`,
          text,
          a: polarToCartesian(angle, inner),
          b: polarToCartesian(angle, outer),
          label: outsideArcLabelPoint(
            angle,
            outer,
            labelOffset,
            text.length * fontSize * 0.62,
            fontSize
          ),
        };
      }
    );
  }, [
    ringCount,
    getRingRadii,
    tickLength,
    startAngle,
    endAngle,
    ticks,
    tickFormat,
    labelOffset,
    fontSize,
  ]);

  if (!geometry) {
    return null;
  }

  const spokeStagger = GRID_SPOKE_STAGGER_S * enterStaggerScale;
  const labelDelay = gridLabelDelay(
    ringCount,
    GRID_RING_STAGGER_S * enterStaggerScale
  );
  const labelStagger = GRID_ANGLE_LABEL_STAGGER_S * enterStaggerScale;

  const spokes = showSpokes ? (
    <g stroke={stroke} strokeLinecap="round" strokeOpacity={strokeOpacity}>
      {geometry.map((t, i) =>
        isStatic ? (
          <line key={t.key} x1={t.a.x} x2={t.b.x} y1={t.a.y} y2={t.b.y} />
        ) : (
          // RadarAxis: each spoke extends from its inner end outward.
          <motion.line
            animate={{ x2: t.b.x, y2: t.b.y }}
            initial={{ x2: t.a.x, y2: t.a.y }}
            key={`${t.key}-${animationKey}`}
            transition={transitionWithDelay(
              enterTransition,
              i * spokeStagger,
              GRID_SPOKE_SPRING
            )}
            x1={t.a.x}
            y1={t.a.y}
          />
        )
      )}
    </g>
  ) : null;

  const labels = showLabels ? (
    <g
      className="font-mono tabular-nums"
      fill={labelColor}
      fontSize={fontSize}
      style={{ fill: labelColor }}
    >
      {geometry.map((t, i) => {
        const text = (
          <text
            dominantBaseline="central"
            textAnchor="middle"
            x={t.label.x}
            y={t.label.y}
          >
            {t.text}
          </text>
        );
        if (isStatic) {
          return <g key={t.key}>{text}</g>;
        }
        // RadarLabels: fade in while sliding out from the center.
        return (
          <motion.g
            animate={{ opacity: 1, x: 0, y: 0 }}
            initial={{ opacity: 0, x: -t.label.x, y: -t.label.y }}
            key={`${t.key}-${animationKey}`}
            transition={{
              opacity: {
                duration: GRID_ANGLE_LABEL_FADE_S,
                delay: labelDelay + i * labelStagger,
              },
              x: GRID_SPOKE_SPRING,
              y: GRID_SPOKE_SPRING,
            }}
          >
            {text}
          </motion.g>
        );
      })}
    </g>
  ) : null;

  return (
    <g pointerEvents="none">
      {spokes}
      {labels}
    </g>
  );
});

RingGrid.displayName = "RingGrid";

export default RingGrid;
