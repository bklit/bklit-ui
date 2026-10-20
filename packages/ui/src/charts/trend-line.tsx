"use client";

import {
  animate as animateValue,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { chartCssVars, useChartStable, useYScale } from "./chart-context";
import { type FadeEdges, type FadeSides, resolveFadeSides } from "./fade-edges";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  computeTrendSegment,
  interpolateTrendSegment,
  type TrendPoint,
  type TrendSegment,
} from "./trend-line-utils";

export type TrendLineStrokeStyle = "solid" | "gradient" | "dashed";

export interface TrendLineProps {
  /** Series key to fit (linear least-squares). */
  dataKey: string;
  /** Stroke color. Default: var(--chart-line-primary) */
  stroke?: string;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Solid, dashed, or path-aligned gradient stroke. Default: dashed */
  strokeStyle?: TrendLineStrokeStyle;
  /** Dash pattern when `strokeStyle` is `"dashed"`. Default: "6,4" */
  strokeDasharray?: string;
  /** Gradient start color when `strokeStyle` is gradient. Default: `stroke` */
  gradientStart?: string;
  /** Gradient end color when `strokeStyle` is gradient. Default: var(--chart-5) */
  gradientEnd?: string;
  /** Fade the line ends to transparent. Default: false */
  fadeEdges?: FadeEdges;
  /** Fade zone as % of line length per faded end. Default: 15 */
  fadeEdgesLength?: number;
  /** Line opacity. Default: 1 */
  opacity?: number;
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string;
  /** Fade in on reveal and tween on data change. Default: true */
  animate?: boolean;
  className?: string;
}

const ENTER_FADE_MS = 420;

function clampFadeLength(length: number): number {
  return Math.min(50, Math.max(0, length));
}

function isVisiblePhase(phase: string): boolean {
  return phase === "revealing" || phase === "ready" || phase === "exitingReady";
}

function resolveFadeTransition(
  skipMotion: boolean,
  enterTransition: Transition | undefined
): Transition {
  if (skipMotion) {
    return { duration: 0 };
  }
  return enterTransition && typeof enterTransition === "object"
    ? enterTransition
    : { duration: ENTER_FADE_MS / 1000, ease: "easeOut" };
}

function segmentSignature(segment: TrendSegment | null): string {
  return segment
    ? `${segment.x1}|${segment.y1}|${segment.x2}|${segment.y2}`
    : "";
}

/** Data-space segment → plot pixels. Horizontal bars swap the axes. */
function projectTrendSegment(
  segment: TrendSegment,
  mapAlong: (x: number) => number,
  valueScale: (value: number) => number | undefined,
  swapAxes: boolean
): TrendSegment {
  const along1 = mapAlong(segment.x1);
  const along2 = mapAlong(segment.x2);
  const value1 = valueScale(segment.y1) ?? 0;
  const value2 = valueScale(segment.y2) ?? 0;
  return swapAxes
    ? { x1: value1, y1: along1, x2: value2, y2: along2 }
    : { x1: along1, y1: value1, x2: along2, y2: value2 };
}

/** Gradient vector pinned to the line endpoints (start → end). */
function lineGradientVector(pixels: TrendSegment) {
  return {
    gradientUnits: "userSpaceOnUse" as const,
    x1: pixels.x1,
    x2: pixels.x2,
    y1: pixels.y1,
    y2: pixels.y2,
  };
}

/**
 * Luminance mask fading the line ends along its own direction, so the fade
 * composes with gradient and dashed strokes.
 */
function TrendLineFadeMask({
  fadeLength,
  id,
  pad,
  pixels,
  sides,
}: {
  fadeLength: number;
  id: string;
  pad: number;
  pixels: TrendSegment;
  sides: FadeSides;
}) {
  const gradientId = `${id}-gradient`;
  const x = Math.min(pixels.x1, pixels.x2) - pad;
  const y = Math.min(pixels.y1, pixels.y2) - pad;
  const width = Math.abs(pixels.x2 - pixels.x1) + pad * 2;
  const height = Math.abs(pixels.y2 - pixels.y1) + pad * 2;
  return (
    <>
      <linearGradient id={gradientId} {...lineGradientVector(pixels)}>
        <stop
          offset="0%"
          style={{ stopColor: "white", stopOpacity: sides.left ? 0 : 1 }}
        />
        <stop
          offset={`${sides.left ? fadeLength : 0}%`}
          style={{ stopColor: "white", stopOpacity: 1 }}
        />
        <stop
          offset={`${sides.right ? 100 - fadeLength : 100}%`}
          style={{ stopColor: "white", stopOpacity: 1 }}
        />
        <stop
          offset="100%"
          style={{ stopColor: "white", stopOpacity: sides.right ? 0 : 1 }}
        />
      </linearGradient>
      {/* userSpaceOnUse: a horizontal line has a zero-height bbox. */}
      <mask
        height={height}
        id={id}
        maskUnits="userSpaceOnUse"
        width={width}
        x={x}
        y={y}
      >
        <rect
          fill={`url(#${gradientId})`}
          height={height}
          width={width}
          x={x}
          y={y}
        />
      </mask>
    </>
  );
}

/**
 * Pixel endpoints, tweened when the fitted segment changes. Mirrors
 * `useAnimatedSeriesPath`: the target is read live each frame so a
 * concurrent y-domain tween (new scale per frame) doesn't stop the tween.
 */
function useAnimatedTrendPixels({
  dataSignature,
  durationMs,
  enabled,
  targetPixels,
}: {
  dataSignature: string;
  durationMs: number;
  enabled: boolean;
  targetPixels: TrendSegment | null;
}): TrendSegment | null {
  const reducedMotion = useReducedMotion();
  const [animated, setAnimated] = useState<TrendSegment | null>(null);
  const displayedRef = useRef<TrendSegment | null>(targetPixels);
  const animatingRef = useRef(false);
  const prevSignatureRef = useRef(dataSignature);
  const latestTargetRef = useRef(targetPixels);
  latestTargetRef.current = targetPixels;

  const shouldAnimate = enabled && !reducedMotion && durationMs > 0;

  // Layout effect so frame 0 (previous endpoints) commits before paint.
  // Target pixels are read live via latestTargetRef (the y-domain tween
  // rebuilds scales every frame); only a new fit should restart the tween.
  useLayoutEffect(() => {
    const dataChanged = prevSignatureRef.current !== dataSignature;
    prevSignatureRef.current = dataSignature;

    const from = displayedRef.current;
    const target = latestTargetRef.current;
    if (!(shouldAnimate && dataChanged && from && target)) {
      animatingRef.current = false;
      displayedRef.current = target;
      setAnimated(null);
      return;
    }

    animatingRef.current = true;
    const renderFrame = (progress: number) => {
      const to = latestTargetRef.current;
      if (!to) {
        return;
      }
      const next = interpolateTrendSegment(from, to, progress);
      displayedRef.current = next;
      setAnimated(next);
    };
    renderFrame(0);

    const control = animateValue(0, 1, {
      duration: durationMs / 1000,
      ease: [...LINE_LOADING_PULSE_EASE],
      onUpdate: renderFrame,
      onComplete: () => {
        animatingRef.current = false;
        displayedRef.current = latestTargetRef.current;
        setAnimated(null);
      },
    });

    return () => {
      control.stop();
      animatingRef.current = false;
    };
  }, [dataSignature, durationMs, shouldAnimate]);

  // After the tween effect: a data change needs the old endpoints as `from`.
  useEffect(() => {
    if (!animatingRef.current) {
      displayedRef.current = targetPixels;
    }
  }, [targetPixels]);

  return animated ?? targetPixels;
}

export function TrendLine({
  dataKey,
  stroke = chartCssVars.linePrimary,
  strokeWidth = 2,
  strokeStyle = "dashed",
  strokeDasharray = "6,4",
  gradientStart,
  gradientEnd = "var(--chart-5)",
  fadeEdges = false,
  fadeEdgesLength = 15,
  opacity = 1,
  yAxisId,
  animate = true,
  className,
}: TrendLineProps) {
  const {
    data,
    xScale,
    xAccessor,
    barScale,
    barXAccessor,
    bandWidth = 0,
    orientation,
    chartPhase,
    enterTransition,
    isLoaded,
    yDomainTweenDuration,
  } = useChartStable();
  const valueScale = useYScale(yAxisId);
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `chart-trend-line-gradient-${uniqueId}`;
  const maskId = `chart-trend-line-fade-${uniqueId}`;

  // BarChart exposes a band scale; regression x is the category index there.
  const isBar = barScale != null && barXAccessor != null;
  const isHorizontal = isBar && orientation === "horizontal";

  const points = useMemo<TrendPoint[]>(
    () =>
      data.map((d, index) => {
        const value = d[dataKey];
        return {
          x: isBar ? index : xAccessor(d).getTime(),
          y: typeof value === "number" ? value : Number.NaN,
        };
      }),
    [data, dataKey, isBar, xAccessor]
  );

  const segment = useMemo(() => computeTrendSegment(points), [points]);

  const targetPixels = useMemo<TrendSegment | null>(() => {
    if (!segment) {
      return null;
    }
    let mapAlong: (x: number) => number;
    if (isBar) {
      // Bands are evenly spaced, so centers are linear in the index.
      const bandCenter = (d: Record<string, unknown> | undefined) =>
        (d ? (barScale(barXAccessor(d)) ?? 0) : 0) + bandWidth / 2;
      const firstCenter = bandCenter(data[0]);
      const lastCenter = bandCenter(data.at(-1));
      const span = Math.max(1, data.length - 1);
      mapAlong = (x) => firstCenter + ((lastCenter - firstCenter) * x) / span;
    } else {
      mapAlong = (x) => xScale(new Date(x)) ?? 0;
    }
    return projectTrendSegment(segment, mapAlong, valueScale, isHorizontal);
  }, [
    bandWidth,
    barScale,
    barXAccessor,
    data,
    isBar,
    isHorizontal,
    segment,
    valueScale,
    xScale,
  ]);

  const reducedMotion = useReducedMotion();
  const pixels = useAnimatedTrendPixels({
    dataSignature: segmentSignature(segment),
    durationMs: yDomainTweenDuration,
    enabled: animate && chartPhase === "ready",
    targetPixels,
  });

  if (!pixels) {
    return null;
  }

  // Bars grow in first; the trend line fades in once they've landed.
  const visible =
    isVisiblePhase(chartPhase) && (!isBar || isLoaded || !animate);
  const skipMotion = !animate || reducedMotion === true;
  const fadeTransition = resolveFadeTransition(skipMotion, enterTransition);

  const fadeSides = resolveFadeSides(fadeEdges);
  const fadeLength = clampFadeLength(fadeEdgesLength);
  const gradientVector = lineGradientVector(pixels);
  const isGradient = strokeStyle === "gradient";

  return (
    <motion.g
      animate={{ opacity: visible ? opacity : 0 }}
      aria-hidden="true"
      className={className ?? "chart-trend-line"}
      initial={skipMotion ? false : { opacity: 0 }}
      transition={fadeTransition}
    >
      {isGradient || fadeSides.any ? (
        <defs>
          {isGradient ? (
            <linearGradient id={gradientId} {...gradientVector}>
              <stop offset="0%" stopColor={gradientStart ?? stroke} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          ) : null}
          {fadeSides.any ? (
            <TrendLineFadeMask
              fadeLength={fadeLength}
              id={maskId}
              pad={strokeWidth + 2}
              pixels={pixels}
              sides={fadeSides}
            />
          ) : null}
        </defs>
      ) : null}
      <line
        fill="none"
        mask={fadeSides.any ? `url(#${maskId})` : undefined}
        stroke={isGradient ? `url(#${gradientId})` : stroke}
        strokeDasharray={strokeStyle === "dashed" ? strokeDasharray : undefined}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x1={pixels.x1}
        x2={pixels.x2}
        y1={pixels.y1}
        y2={pixels.y2}
      />
    </motion.g>
  );
}

TrendLine.displayName = "TrendLine";

export default TrendLine;
