import {
  Group,
  LinearGradient,
  Mask,
  Rect,
  rect,
  Skia,
  type SkPath,
  vec,
} from "@shopify/react-native-skia";
import { type CurveFactory, area as d3Area, line as d3Line } from "d3-shape";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getDate, getValue, useChart } from "./chart-context";
import { CHART_EASING } from "./motion";
import { type KeyedPoint, type SeriesPoints, unionMorph } from "./series-morph";

/** `true` = both sides at 15% (web default), or per-side % of plot width. */
export type FadeEdges =
  | boolean
  | "left"
  | "right"
  | { left?: number; right?: number };

const DEFAULT_FADE = 15;
/** Room past the plot edge for round caps and markers. */
const PLOT_CLIP_PAD = 6;

export function resolveFade(fade: FadeEdges): { left: number; right: number } {
  if (fade === false) {
    return { left: 0, right: 0 };
  }
  if (fade === "left") {
    return { left: DEFAULT_FADE, right: 0 };
  }
  if (fade === "right") {
    return { left: 0, right: DEFAULT_FADE };
  }
  if (typeof fade === "object") {
    const clamp = (v = 0) => Math.min(50, Math.max(0, v));
    return { left: clamp(fade.left), right: clamp(fade.right) };
  }
  return { left: DEFAULT_FADE, right: DEFAULT_FADE };
}

export function toSkPath(d: string | null): SkPath {
  return (d ? Skia.Path.MakeFromSVGString(d) : null) ?? Skia.Path.Make();
}

/**
 * Morph from the previous geometry to `target` on the UI thread whenever it
 * changes (data, scales, size). Falls back to a cut when point counts differ.
 */
export function useMorphPath(
  target: SkPath,
  duration: number
): SharedValue<SkPath> {
  const { reducedMotion } = useChart();
  const [pair, setPair] = useState({ from: target, to: target });
  const progress = useSharedValue(1);

  useEffect(() => {
    setPair((prev) =>
      prev.to === target ? prev : { from: prev.to, to: target }
    );
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: CHART_EASING });
  }, [target, reducedMotion, duration, progress]);

  return useDerivedValue(() => {
    const { from, to } = pair;
    if (progress.value >= 1 || from === to || !to.isInterpolatable(from)) {
      return to;
    }
    return to.interpolate(from, progress.value) ?? to;
  });
}

/**
 * Morph a series whenever its points change — data, size, or a range switch
 * that adds or removes points. See `unionMorph`: the morph runs over old ∪
 * new keys so nothing pops, then the series rests on the new points.
 *
 * `series` must be memoised (see `useSeriesPoints`); `build` per curve.
 */
export function useKeyedMorph(
  series: SeriesPoints,
  build: (pts: KeyedPoint[]) => SkPath,
  duration: number
): SharedValue<SkPath> {
  const { reducedMotion } = useChart();
  const progress = useSharedValue(1);
  /** Generation whose morph has started on the UI thread. */
  const started = useSharedValue(0);
  const prevRef = useRef<SeriesPoints | null>(null);
  const pairRef = useRef<MorphPair | null>(null);

  // Built during render (refs only, no shared-value writes); the effect
  // below starts the morph. Until it does, the derived value keeps showing
  // `from` (the old geometry), so there's no flash.
  const pair = useMemo<MorphPair>(() => {
    const prev = prevRef.current;
    const current = pairRef.current;
    if (prev === series && current) {
      return current;
    }
    prevRef.current = series;
    const gen = (current?.gen ?? 0) + 1;
    const rest = build(series.points);
    let next: MorphPair = { from: rest, to: rest, rest, gen };
    if (prev && prev.points.length > 0 && !reducedMotion) {
      const union = unionMorph(prev, series);
      const from = build(union.from);
      const to = build(union.to);
      if (to.isInterpolatable(from)) {
        next = { from, to, rest, gen };
      }
    }
    pairRef.current = next;
    return next;
  }, [series, build, reducedMotion]);

  useEffect(() => {
    if (pair.from === pair.to) {
      started.value = pair.gen;
      progress.value = 1;
      return;
    }
    progress.value = 0;
    started.value = pair.gen;
    progress.value = withTiming(1, { duration, easing: CHART_EASING });
  }, [pair, duration, progress, started]);

  return useDerivedValue(() => {
    const { from, to, rest, gen } = pair;
    if (from === to) {
      return rest;
    }
    if (started.value !== gen) {
      return from;
    }
    if (progress.value >= 1) {
      return rest;
    }
    return to.interpolate(from, progress.value) ?? rest;
  });
}

interface MorphPair {
  from: SkPath;
  to: SkPath;
  /** New points only, drawn at rest. */
  rest: SkPath;
  gen: number;
}

/**
 * Pixel points for `yKey` (rows where it's defined), keyed by time, plus a
 * projector for these scales. `y0` is a second key (band upper edge) or a
 * fixed pixel baseline (area).
 */
export function useSeriesPoints(
  yKey: string,
  y0?: string | number
): SeriesPoints {
  const { data, xDataKey, xScale, yScale } = useChart();
  return useMemo(() => {
    const project = (p: KeyedPoint): KeyedPoint => ({
      ...p,
      x: xScale(new Date(p.key)),
      y: yScale(p.v),
      y0: baselineY(y0, p.v0, yScale),
    });
    const points: KeyedPoint[] = [];
    for (const d of data) {
      const v = getValue(d, yKey);
      const v0 = typeof y0 === "string" ? getValue(d, y0) : null;
      if (v === null || (typeof y0 === "string" && v0 === null)) {
        continue;
      }
      points.push(
        project({
          key: getDate(d, xDataKey).getTime(),
          x: 0,
          y: 0,
          v,
          v0: v0 ?? undefined,
        })
      );
    }
    return { points, project };
  }, [data, xDataKey, xScale, yScale, yKey, y0]);
}

function baselineY(
  y0: string | number | undefined,
  v0: number | undefined,
  yScale: (v: number) => number
): number | undefined {
  if (typeof y0 === "number") {
    return y0;
  }
  return v0 === undefined ? undefined : yScale(v0);
}

/** Line through `y` (or `y0`) of keyed points. Memoise per curve. */
export function lineBuilder(curve: CurveFactory, field: "y" | "y0" = "y") {
  return (pts: KeyedPoint[]) =>
    toSkPath(
      d3Line<KeyedPoint>()
        .x((p) => p.x)
        .y((p) => (field === "y" ? p.y : (p.y0 ?? p.y)))
        .curve(curve)(pts)
    );
}

/** Area between `y` and `y0` of keyed points. Memoise per curve. */
export function areaBuilder(curve: CurveFactory) {
  return (pts: KeyedPoint[]) =>
    toSkPath(
      d3Area<KeyedPoint>()
        .x((p) => p.x)
        .y0((p) => p.y0 ?? p.y)
        .y1((p) => p.y)
        .curve(curve)(pts)
    );
}

/**
 * Wraps a series: left-to-right reveal clip, then the horizontal edge fade
 * as an alpha mask so fill and stroke fade together.
 */
export function SeriesLayer({
  fadeEdges,
  children,
}: {
  fadeEdges: FadeEdges;
  children: ReactNode;
}) {
  const { width, height, margin, revealProgress } = useChart();
  const { left, right } = resolveFade(fadeEdges);
  const plotLeft = margin.left;
  const plotRight = width - margin.right;

  // Left-to-right reveal, and keep the series inside the plot so points
  // sliding off during a range morph never draw in the margins.
  const reveal = useDerivedValue(() => {
    const left = plotLeft - PLOT_CLIP_PAD;
    const right = Math.min(
      plotLeft + revealProgress.value * (width - plotLeft),
      plotRight + PLOT_CLIP_PAD
    );
    return rect(left, 0, Math.max(0, right - left), height);
  });

  const content = <Group clip={reveal}>{children}</Group>;
  if (left === 0 && right === 0) {
    return content;
  }

  const l = left / 100;
  const r = 1 - right / 100;
  return (
    <Mask
      mask={
        <Rect height={height} width={width} x={0} y={0}>
          <LinearGradient
            colors={[
              left > 0 ? "rgba(0,0,0,0)" : "#000",
              "#000",
              "#000",
              right > 0 ? "rgba(0,0,0,0)" : "#000",
            ]}
            end={vec(plotRight, 0)}
            positions={[0, l, r, 1]}
            start={vec(plotLeft, 0)}
          />
        </Rect>
      }
    >
      {content}
    </Mask>
  );
}

/** Web default: the rest of the series drops to 30% while scrubbing. */
export const HIGHLIGHT_DIM_OPACITY = 0.3;

/** Series opacity: dims while the tooltip is up (when highlight is on). */
export function useDimOpacity(enabled: boolean) {
  const { highlightOpacity } = useChart();
  return useDerivedValue(() =>
    enabled ? 1 - highlightOpacity.value * (1 - HIGHLIGHT_DIM_OPACITY) : 1
  );
}

/**
 * Re-draws `children` at full strength inside the springing hover band
 * (±1 point around the active index).
 */
export function HighlightBand({ children }: { children: ReactNode }) {
  const { height, highlightX, highlightWidth, highlightOpacity } = useChart();
  const band = useDerivedValue(() =>
    rect(highlightX.value, 0, Math.max(0, highlightWidth.value), height)
  );
  return (
    <Group clip={band} opacity={highlightOpacity}>
      {children}
    </Group>
  );
}
