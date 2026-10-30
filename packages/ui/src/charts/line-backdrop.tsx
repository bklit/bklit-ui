"use client";

import { type CurveFactory, curveNatural } from "d3-shape";
import { motion } from "motion/react";
import { type ReactNode, useId } from "react";
import {
  chartCssVars,
  useChartStable,
  useSettledYScale,
  useYScale,
} from "./chart-context";
import { useAnimatedSeriesPath } from "./use-animated-series-path";

/** Fade-in after the series reveal — matches `Background`. */
const BACKDROP_ENTER_FADE_MS = 420;

/** A colour stop on the backdrop's radial gradient (`offset` 0–1, centre → rim). */
export interface LineBackdropStop {
  offset: number;
  color: string;
  /** Stop opacity (0–1). Default: 1 */
  opacity?: number;
}

export interface LineBackdropProps {
  /** Series to follow — match the `dataKey` of the `Line` it sits behind. */
  dataKey: string;
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string | number;
  /**
   * Which region to fill: between the line and the top of the plot
   * (`"above"`) or between the line and the bottom (`"below"`).
   * Default: `"above"`
   */
  side?: "above" | "below";
  /** Curve — keep it the same as the `Line`. Default: `curveNatural` */
  curve?: CurveFactory;
  /** Follow the line's data / y-domain tweens. Default: true */
  animate?: boolean;
  /**
   * Radial gradient stops, centre → rim. Default: `--chart-line-primary` at
   * 35% opacity fading to transparent.
   */
  stops?: LineBackdropStop[];
  /** Gradient centre as fractions of the plot. Default: `{ x: 0.5, y: 1 }` */
  center?: { x: number; y: number };
  /** Gradient radii as fractions of plot width / height. Default: `{ x: 0.75, y: 1 }` */
  radius?: { x: number; y: number };
  /** Overall opacity of the backdrop. Default: 1 */
  opacity?: number;
  /**
   * Custom fill in plot coordinates (e.g. an `<image>` or your own gradient
   * `<rect>`). Replaces the radial gradient; still clipped to the region.
   */
  children?: ReactNode;
}

const DEFAULT_STOPS: LineBackdropStop[] = [
  { offset: 0, color: chartCssVars.linePrimary, opacity: 0.35 },
  { offset: 1, color: chartCssVars.linePrimary, opacity: 0 },
];
const DEFAULT_CENTER = { x: 0.5, y: 1 };
const DEFAULT_RADIUS = { x: 0.75, y: 1 };

const PATH_START_X_RE = /^M\s*(-?[\d.]+(?:e[-+]?\d+)?)/i;

/**
 * Close the series path into the region between the line and a horizontal
 * edge: down/up from the last point to `edgeY`, across to the first point's x,
 * then back to the start.
 */
function seriesRegionPath(pathD: string, edgeY: number): string | null {
  const match = PATH_START_X_RE.exec(pathD);
  if (!match) {
    return null;
  }
  return `${pathD}V${edgeY}H${match[1]}Z`;
}

/**
 * Fill clipped to the region between a series and the top (or bottom) of the
 * plot — e.g. a sky glow that only shows above the line. Follows the same
 * animated path as `Line`, so it stays glued to the stroke through data morphs,
 * y-domain tweens and the reveal clip. Fades in once the line has revealed
 * (like `Background`). Render it before the `Line`.
 */
export function LineBackdrop({
  dataKey,
  yAxisId,
  side = "above",
  curve = curveNatural,
  animate = true,
  stops = DEFAULT_STOPS,
  center = DEFAULT_CENTER,
  radius = DEFAULT_RADIUS,
  opacity = 1,
  children,
}: LineBackdropProps) {
  const {
    renderData,
    xScale,
    innerHeight,
    innerWidth,
    xAccessor,
    chartPhase,
    yDomainTweenDuration,
    isLoaded,
    enterTransition,
  } = useChartStable();
  const yScale = useYScale(yAxisId);
  const settledYScale = useSettledYScale(yAxisId);
  const { pathD } = useAnimatedSeriesPath({
    chartPhase,
    curve,
    dataKey,
    durationMs: yDomainTweenDuration,
    enabled: animate && chartPhase === "ready",
    innerWidth,
    renderData,
    settledYScale,
    xAccessor,
    xScale,
    yScale,
  });

  const reactId = useId();
  const clipId = `line-backdrop-clip-${dataKey}-${reactId}`;
  const gradientId = `line-backdrop-gradient-${dataKey}-${reactId}`;

  const showContent =
    chartPhase === "revealing" ||
    chartPhase === "ready" ||
    chartPhase === "exitingReady";
  const regionD = seriesRegionPath(pathD, side === "above" ? 0 : innerHeight);
  if (!(showContent && regionD) || innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  const cx = innerWidth * center.x;
  const cy = innerHeight * center.y;
  const rx = Math.max(1, innerWidth * radius.x);
  const ry = Math.max(1, innerHeight * radius.y);

  // Hold back until the line has revealed, then fade in (like `Background`).
  const enterFade =
    enterTransition && typeof enterTransition === "object"
      ? enterTransition
      : { duration: BACKDROP_ENTER_FADE_MS / 1000, ease: "easeOut" as const };

  return (
    <motion.g
      animate={{ opacity: isLoaded ? opacity : 0 }}
      initial={{ opacity: 0 }}
      pointerEvents="none"
      transition={isLoaded ? enterFade : { duration: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={regionD} />
        </clipPath>
        {children ? null : (
          <radialGradient
            cx={cx}
            cy={cy}
            gradientTransform={`translate(${cx} ${cy}) scale(1 ${ry / rx}) translate(${-cx} ${-cy})`}
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            r={rx}
          >
            {stops.map((stop) => (
              <stop
                key={`${stop.offset}-${stop.color}`}
                offset={stop.offset}
                style={{
                  stopColor: stop.color,
                  stopOpacity: stop.opacity ?? 1,
                }}
              />
            ))}
          </radialGradient>
        )}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {children ?? (
          <rect
            fill={`url(#${gradientId})`}
            height={innerHeight}
            width={innerWidth}
          />
        )}
      </g>
    </motion.g>
  );
}

LineBackdrop.displayName = "LineBackdrop";

export default LineBackdrop;
