"use client";

/**
 * Bar 3D depth + glass surfaces — drop-in layers for `<BarChart>`.
 *
 * Adds a head-on perspective and a glossy glass-block sheen to the bars in
 * any `<BarChart>`. Bars left of chart center expose their RIGHT side face;
 * bars right of center expose their LEFT — the vanishing point sits at the
 * chart's horizontal middle, so the row reads like vertical glass blocks
 * viewed straight on.
 *
 * Three surfaces per bar:
 *   1. Side face — a parallelogram on the depth side, lit at the front edge
 *      with a horizontal black gradient and shaded toward the back.
 *   2. Top face — a parallelogram lid above the bar's top edge, with a
 *      bright catch at the front lip fading to soft white at the back.
 *   3. Glass overlay — a vertical white-to-dark gradient on the bar's front
 *      face (sharp top reflection, transparent middle, faint bottom shadow).
 *
 * Usage (purely additive — no changes to `<Bar>`):
 *
 *   <BarChart data={data} xDataKey="month">
 *     <Grid horizontal />
 *     <BarDepthBack dataKey="value" color="var(--chart-1)" />  // before <Bar>
 *     <Bar dataKey="value" fill="var(--chart-1)" />
 *     <BarDepthFront dataKey="value" />                        // after <Bar>
 *   </BarChart>
 *
 * Both depth layers read geometry from `useChart()` and figure out the
 * perspective themselves. The only configuration is the bar color
 * (`color` / `colorAccessor`) and, for stacked bars, a `segmentsAccessor`
 * supplied via `<BarDepthProvider>`.
 *
 * An optional `<BarPulse>` paints a looping vertical sweep over a single
 * "active" bar (selected by `activeIndex`) — useful for highlighting a live
 * or in-progress value. Render it AFTER `<BarDepthFront>`.
 *
 * Behavior notes:
 *   - Negative values are supported: a bar whose value is below zero grows
 *     downward from the baseline, with the lid sitting on the baseline.
 *     (This requires the host `<BarChart>` to use a value scale whose
 *     domain includes negatives.)
 *   - Zero-value bars are skipped by default; set `minBarHeight` on
 *     `<BarDepthProvider>` (and `<Bar>`) to floor them to a short visible bar.
 *
 * Performance:
 *   - Three shared SVG gradients per layer instance (ID-collision-safe via
 *     `useId()`).
 *   - A per-bar `<clipPath>` for the side face animates from the baseline so
 *     the static side path is revealed bottom-up in lockstep with the bar.
 *     Only used where depth ≥ 0.5px.
 *   - At high bar density the column gap clamps depth below the 0.5px
 *     threshold; the back surfaces skip rendering and only the cheap glass
 *     rect remains.
 *   - `useBarDepthEntries` is memoized, so the Back/Front/Pulse layers
 *     compute geometry at most once per render between them.
 */

import { motion, type Transition } from "motion/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from "react";
import { barDepthAndRise, barDepthMaxDepth } from "./bar-depth-geometry";
import { useChartHover, useChartStable } from "./chart-context";
import { transitionWithDelay } from "./motion-utils";

// ─── Constants ───────────────────────────────────────────────────────

/** Below this depth the back surfaces don't render — saves elements for
 * dead-center bars and dense charts where perspective is sub-pixel. */
const BAR_DEPTH_MIN_PX = 0.5;
/** Mirrors `Bar`'s default `fadedOpacity` so depth/glass dim in step with
 * their bar when a sibling bar is hovered. */
const BAR_FADED_OPACITY = 0.3;
/** Default bar color when neither `color` nor `colorAccessor` is provided. */
const DEFAULT_BAR_COLOR = "var(--chart-line-primary)";
/** Default opacity of the baseline "contact shadow" that grounds each bar at
 * the zero line. Configurable via `<BarDepthProvider groundShadow>`. */
const DEFAULT_GROUND_SHADOW = 0.26;
/** Peak opacity of the white reflection catch at each bar's tip. Kept here so
 * the front/side glass and the solid lid highlight all use the same value. */
const GLASS_TIP_OPACITY = 0.2;

// `BarPulse` — vertical sweep wave constants. The wave is a tall translucent
// rect with a centered bright band; it translates from below the bar's bottom
// edge to above the lid's back edge on a loop, clipped to the bar's full 3D
// silhouette.
/** Wave height = max(barHeight × this, PULSE_WAVE_HEIGHT_MIN_PX). 0.55 puts
 * the bright band's peak in the middle of the bar at mid-travel. */
const PULSE_WAVE_HEIGHT_RATIO = 0.55;
/** Minimum wave height in px so short bars still pulse on a steady cadence —
 * the wave is taller than the bar so the bright band sweeps through cleanly
 * instead of flashing for one frame. */
const PULSE_WAVE_HEIGHT_MIN_PX = 36;
/** Seconds per sweep (bottom → above the lid). 2.4s reads as a deliberate
 * heartbeat; faster feels frantic, slower feels laggy. */
const PULSE_WAVE_DURATION_S = 2.4;
/** Peak opacity of the wave's brightest gradient stop. White at 0.85 is
 * bright enough to register over saturated bar colors while the bell-curve
 * stops around it keep the falloff soft so the bar's hue still dominates. */
const PULSE_WAVE_PEAK_OPACITY = 0.85;

const BAR_HOVER_TRANSITION = { duration: 0.15, ease: "easeOut" as const };

// ─── Types ───────────────────────────────────────────────────────────

export interface BarDepthEntry {
  label: string;
  /** Index in the original `data` array — used for stagger calc. NOT the
   * index in this entries list. */
  dataIndex: number;
  /** Original datum reference — handed back to `colorAccessor` /
   * `segmentsAccessor` so consumers can color or split bars without
   * bar-depth knowing the data shape. */
  datum: Record<string, unknown>;
  /** True when this bar is the active bar (`dataIndex === activeIndex`).
   * Used only by `<BarPulse>`; geometry is identical regardless. */
  isActive: boolean;
  /** True when the bar's value is negative — the bar extends downward from
   * the baseline. The lid still sits at the baseline; the side parallelogram
   * grows downward instead of upward. */
  isNegative: boolean;
  /** y of the chart's baseline (= `yScale(0)`). For positive bars this equals
   * `bottomY`; for negative bars it equals `topY`. Used as the grow-from
   * anchor for both the clipPath (side face) and the glass rect. */
  baselineY: number;
  bandX: number;
  bandWidth: number;
  /** Visual top of the bar in screen Y (smaller y = higher on screen). */
  topY: number;
  /** Visual bottom of the bar in screen Y. */
  bottomY: number;
  barHeight: number;
  /** Un-trimmed natural pixel height of the bar (= `|baselineY - yScale(value)|`).
   * Segment heights are scaled against this so they line up with `<Bar>`. */
  naturalHeight: number;
  /** Pixels subtracted from the bar's visual top (and added to `topY`) so the
   * lid's back edge lands at `yScale(value)` regardless of depth. */
  topYTrim: number;
  /** Side-face thickness in px (0 = dead-center bar / dense chart). */
  depth: number;
  perspectiveRise: number;
  isRightOfCenter: boolean;
}

/** One segment of a stacked bar, in stack order bottom→top. The values across
 * all segments should sum to the bar's value; bar-depth uses the proportions
 * to pick segment boundaries that line up with the front face's stacking. */
export interface BarDepthSegment {
  value: number;
  color: string;
}

/** Resolve a per-datum color, falling back to the shared `color` default. */
type ColorAccessor = (datum: Record<string, unknown>, index: number) => string;

function resolveColor(
  datum: Record<string, unknown>,
  index: number,
  color: string,
  colorAccessor?: ColorAccessor
): string {
  return colorAccessor?.(datum, index) ?? color;
}

/** Side-face parallelogram between two screen-Y edges, on the depth side of
 * the bar (left of the bar for right-of-center bars, right for left-of). */
function sideFacePath(
  e: BarDepthEntry,
  topEdge: number,
  bottomEdge: number
): string {
  const rise = e.perspectiveRise;
  if (e.isRightOfCenter) {
    const x = e.bandX;
    return `M ${x} ${topEdge} L ${x - e.depth} ${topEdge - rise} L ${x - e.depth} ${bottomEdge - rise} L ${x} ${bottomEdge} Z`;
  }
  const x = e.bandX + e.bandWidth;
  return `M ${x} ${topEdge} L ${x + e.depth} ${topEdge - rise} L ${x + e.depth} ${bottomEdge - rise} L ${x} ${bottomEdge} Z`;
}

/** Lid (top face) parallelogram above the bar's top edge. */
function lidFacePath(e: BarDepthEntry): string {
  const rise = e.perspectiveRise;
  const left = e.bandX;
  const right = e.bandX + e.bandWidth;
  if (e.isRightOfCenter) {
    return `M ${left} ${e.topY} L ${right} ${e.topY} L ${right - e.depth} ${e.topY - rise} L ${left - e.depth} ${e.topY - rise} Z`;
  }
  return `M ${left} ${e.topY} L ${right} ${e.topY} L ${right + e.depth} ${e.topY - rise} L ${left + e.depth} ${e.topY - rise} Z`;
}

/**
 * Build the side-face parallelograms for a bar. Without segments it's a single
 * piece in `baseColor`; with segments each gets its natural scaled height
 * `(seg.value/total) * naturalHeight` and only the topmost has `topYTrim`
 * removed — matching exactly how `<Bar>` stacks segments, so the side seams
 * line up with the front face.
 */
function buildSidePieces(
  e: BarDepthEntry,
  visibleSegments: BarDepthSegment[] | null,
  baseColor: string
): { path: string; color: string }[] {
  if (!(visibleSegments && visibleSegments.length > 0)) {
    return [{ path: sideFacePath(e, e.topY, e.bottomY), color: baseColor }];
  }
  const totalValue = visibleSegments.reduce((sum, s) => sum + s.value, 0);
  const pieces: { path: string; color: string }[] = [];
  let cursorY = e.bottomY;
  for (let i = 0; i < visibleSegments.length; i++) {
    const seg = visibleSegments[i];
    if (!seg) {
      continue;
    }
    const isTopmost = i === visibleSegments.length - 1;
    const segScaledHeight = (seg.value / totalValue) * e.naturalHeight;
    const segHeight = isTopmost
      ? Math.max(0, segScaledHeight - e.topYTrim)
      : segScaledHeight;
    const segBottomY = cursorY;
    const segTopY = cursorY - segHeight;
    cursorY = segTopY;
    pieces.push({
      path: sideFacePath(e, segTopY, segBottomY),
      color: seg.color,
    });
  }
  return pieces;
}

// ─── Context ──────────────────────────────────────────────────────────
// `BarDepthProvider` is the single source of truth for `segmentsAccessor`,
// shared by every depth surface (`<BarDepthBack>`, `<BarDepthFront>`,
// `<BarPulse>`) AND by the entries hook those surfaces consume.
//
// Why context instead of per-component props: `useBarDepthEntries` computes
// `topYTrim` from the topmost segment's scaled height, so all three layers
// need the *same* `segmentsAccessor` to produce the same `topY`. A single
// provider above the chart makes it structurally impossible for them to
// disagree.
//
// `BarChart` reads its `<Bar>` children with `React.Children.forEach`, which
// doesn't recurse into a provider. Wrap the provider *around* the
// `<BarChart>`, not inside it.

interface BarDepthContextValue {
  segmentsAccessor?: (
    datum: Record<string, unknown>
  ) => BarDepthSegment[] | null | undefined;
  /** Opacity (0–1) of the baseline contact shadow. 0 removes it. */
  groundShadow?: number;
  /** Minimum bar height in px — floors short/zero bars so they stay visible.
   * Match the value passed to `<Bar minBarHeight>`. */
  minBarHeight?: number;
}

const BarDepthContext = createContext<BarDepthContextValue>({});

export interface BarDepthProviderProps extends BarDepthContextValue {
  children: ReactNode;
}

/**
 * Provides shared bar-depth configuration to every depth surface beneath it.
 * Wrap a `<BarChart>` whose children include `<BarDepthBack>` /
 * `<BarDepthFront>` / `<BarPulse>` with this provider to:
 *   - split stacked bars into per-segment side faces (`segmentsAccessor`),
 *   - tune the baseline contact shadow (`groundShadow`, default 0.26; 0 = off),
 *   - floor short/zero bars so they stay visible (`minBarHeight`; pair with the
 *     same value on `<Bar minBarHeight>`).
 *
 * Because the glass gradient is chart-wide (one Y-anchored ramp shared by the
 * front face and the side glass), the provider is the single source of truth —
 * so the surfaces can never disagree.
 */
export function BarDepthProvider({
  segmentsAccessor,
  groundShadow,
  minBarHeight,
  children,
}: BarDepthProviderProps) {
  // Memoize so consumers don't re-render when the config is stable.
  const value = useMemo<BarDepthContextValue>(
    () => ({ segmentsAccessor, groundShadow, minBarHeight }),
    [segmentsAccessor, groundShadow, minBarHeight]
  );
  return (
    <BarDepthContext.Provider value={value}>
      {children}
    </BarDepthContext.Provider>
  );
}

BarDepthProvider.displayName = "BarDepthProvider";

// ─── Per-bar glass gradient ──────────────────────────────────────────
// The glass is anchored to EACH BAR's own height (objectBoundingBox: 0% = the
// bar's tip, 100% = its baseline), not to the chart. So every bar — tall or
// short — gets the identical proportional gloss. (Anchoring per-chart made a
// tall bar's tip bright while a short bar's tip fell in the transparent middle
// and read as matte.)

interface GlassGradientStop {
  offset: string;
  color: string;
  opacity: string;
}

/**
 * Stop list for a POSITIVE bar's glass (0% = tip, 100% = baseline): a sharp
 * white reflection catch at the tip falling off fast to transparent, then the
 * contact shadow at the base.
 */
function buildPosBarStops(groundShadow: number): GlassGradientStop[] {
  return [
    { offset: "0%", color: "white", opacity: String(GLASS_TIP_OPACITY) },
    { offset: "3%", color: "white", opacity: "0.09" },
    { offset: "8%", color: "white", opacity: "0.02" },
    { offset: "55%", color: "white", opacity: "0" },
    { offset: "100%", color: "black", opacity: String(groundShadow) },
  ];
}

/**
 * Mirror of `buildPosBarStops` for NEGATIVE bars (which grow downward): the
 * contact shadow sits at the top (the baseline) and the reflection catch at
 * the bottom (the bar's tip).
 */
function buildNegBarStops(groundShadow: number): GlassGradientStop[] {
  return [
    { offset: "0%", color: "black", opacity: String(groundShadow) },
    { offset: "45%", color: "white", opacity: "0" },
    { offset: "92%", color: "white", opacity: "0.02" },
    { offset: "97%", color: "white", opacity: "0.09" },
    { offset: "100%", color: "white", opacity: String(GLASS_TIP_OPACITY) },
  ];
}

/**
 * Build both per-bar glass stop lists from the current `groundShadow`. Each
 * depth surface picks `posStops` or `negStops` by the bar's direction and
 * paints it objectBoundingBox, so the gloss is identical across bar heights.
 */
function useGlassStops() {
  const { groundShadow = DEFAULT_GROUND_SHADOW } = useContext(BarDepthContext);
  return useMemo(
    () => ({
      posStops: buildPosBarStops(groundShadow),
      negStops: buildNegBarStops(groundShadow),
    }),
    [groundShadow]
  );
}

function readBarValue(d: Record<string, unknown>, key: string): number {
  const v = key ? d[key] : undefined;
  return typeof v === "number" ? v : 0;
}

// ─── Hooks ───────────────────────────────────────────────────────────

/**
 * Compute per-bar 3D depth geometry from chart context.
 *
 * Memoized on the chart's scales + data, so calling this from sibling layers
 * within the same chart is essentially free after the first settles. Returns
 * one entry per renderable bar; bars with no resolvable height are excluded.
 *
 * Negative-value bars are kept — `isNegative` flips the entry's geometry so
 * the side parallelogram and lid render in the correct direction.
 *
 * Exported for advanced consumers that want to render custom layers aligned
 * with the same geometry (e.g. labels above each bar's top face).
 */
export function useBarDepthEntries(
  dataKey: string,
  activeIndex?: number
): BarDepthEntry[] {
  const {
    data,
    barScale,
    bandWidth,
    yScale,
    innerHeight,
    innerWidth,
    barXAccessor,
  } = useChartStable();
  // Read shared config from `<BarDepthProvider>`. Outside a provider these are
  // the defaults (no segmentation, no floor) — correct for simple charts.
  const { segmentsAccessor, minBarHeight = 0 } = useContext(BarDepthContext);

  return useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }

    const centerX = innerWidth / 2;
    const zeroY = yScale(0) ?? innerHeight;

    // d3-scaleBand exposes step() (= bandwidth + gap); the shared helper caps
    // depth below the gap so a side face never spills past the next bar.
    const step =
      (barScale as unknown as { step?: () => number }).step?.() ?? bandWidth;
    const maxDepth = barDepthMaxDepth(step, bandWidth);

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: per-bar 3D geometry (direction, perspective trim, segment scaling) reads clearest as one pass
    return data.flatMap((d, dataIndex): BarDepthEntry[] => {
      // Stacked bars: the bar's value is the SUM of its segments (so the depth
      // height matches the host BarChart's stacked total). Single bars: the
      // `dataKey` column. `segmentsAccessor` comes from `<BarDepthProvider>`.
      const visibleSegs =
        segmentsAccessor?.(d)?.filter((s) => s.value > 0) ?? null;
      const value =
        visibleSegs && visibleSegs.length > 0
          ? visibleSegs.reduce((sum, s) => sum + s.value, 0)
          : readBarValue(d, dataKey);
      const isActive = activeIndex != null && dataIndex === activeIndex;
      const isNegative = value < 0;
      const label = barXAccessor(d);
      const bandX = barScale(label) ?? 0;
      const cx = bandX + bandWidth / 2;

      // `Math.abs` so negative bars produce a positive height — direction is
      // captured by `isNegative`. Non-negative bars are floored to
      // `minBarHeight` so short/zero values stay visible (mirrors
      // `<Bar minBarHeight>`); a floored bar skips the perspective trim so its
      // tiny front face and lid stay aligned. With the default floor of 0,
      // zero-value bars produce no height and are skipped.
      const valuePos = yScale(value) ?? innerHeight;
      const rawHeight = Math.abs(zeroY - valuePos);
      const naturalHeight = isNegative
        ? rawHeight
        : Math.max(rawHeight, minBarHeight);
      if (naturalHeight <= 0) {
        return [];
      }
      const isFloored = !isNegative && rawHeight < naturalHeight;

      const offsetFromCenter = centerX > 0 ? (cx - centerX) / centerX : 0;
      const isRightOfCenter = offsetFromCenter > 0;
      const absOffset = Math.min(1, Math.abs(offsetFromCenter));
      const { depth, perspectiveRise: rawRise } = barDepthAndRise(
        absOffset,
        naturalHeight,
        maxDepth
      );
      // Perspective lift applies only to positive bars. For negative bars a
      // lift would raise the lid's back edge above the baseline (a visible
      // "lip" at the chart edges), so it's forced to 0 — degenerating the lid
      // and flattening the side into a rectangle flush with the baseline.
      const perspectiveRise = isNegative ? 0 : rawRise;

      // Perspective trim — positive value-bearing bars only. The lid's back
      // edge sits `perspectiveRise` above `topY`. Without trim the silhouette
      // top would vary with depth (bars further from center look taller).
      // Trim shifts `topY` DOWN by `perspectiveRise` so the lid's back edge
      // lands on `yScale(value)` regardless of depth. The clamp denominator
      // is the topmost segment's scaled height (for stacked bars) or the whole
      // bar's natural height, matching how `<Bar>` stacks segments.
      let trimClampReference = naturalHeight;
      if (visibleSegs && visibleSegs.length > 0) {
        const segTotal = visibleSegs.reduce((sum, s) => sum + s.value, 0);
        const topmost = visibleSegs.at(-1);
        if (segTotal > 0 && topmost) {
          trimClampReference = (topmost.value / segTotal) * naturalHeight;
        }
      }
      const isValueBar = naturalHeight > 0 && !isNegative && !isFloored;
      const topYTrim = isValueBar
        ? Math.min(perspectiveRise, Math.max(0, trimClampReference - 1))
        : 0;
      // Direction-aware top/bottom: positive bars hang ABOVE the baseline;
      // negative bars hang BELOW it. The lid always lives at `topY` so for
      // negative bars it sits on the baseline.
      const topY = isNegative ? zeroY : zeroY - naturalHeight + topYTrim;
      const bottomY = isNegative ? zeroY + naturalHeight : zeroY;
      const barHeight = bottomY - topY;

      return [
        {
          label,
          dataIndex,
          datum: d,
          isActive,
          isNegative,
          baselineY: zeroY,
          bandX,
          bandWidth,
          topY,
          bottomY,
          barHeight,
          naturalHeight,
          topYTrim,
          depth,
          perspectiveRise,
          isRightOfCenter,
        },
      ];
    });
  }, [
    data,
    barScale,
    bandWidth,
    yScale,
    innerHeight,
    innerWidth,
    barXAccessor,
    segmentsAccessor,
    minBarHeight,
    dataKey,
    activeIndex,
  ]);
}

function useBarDepthStagger() {
  const { data, animationDuration } = useChartStable();
  // Mirror `Bar`'s stagger formula so each depth surface enters in lockstep
  // with its front face (`Bar` uses `animationDuration * 0.4 / count`).
  const total = animationDuration || 1100;
  return data.length > 1 ? (total * 0.4) / 1000 / data.length : 0;
}

// ─── Components ───────────────────────────────────────────────────────

export interface BarDepthBackProps {
  /** Key in data for the bar value. Match the sibling `<Bar dataKey>`. */
  dataKey: string;
  /** Solid color for the side + top faces. Default: var(--chart-line-primary). */
  color?: string;
  /** Per-bar color override; takes precedence over `color` when provided. */
  colorAccessor?: ColorAccessor;
}

/**
 * Renders the back surfaces (side + top faces) of the 3D bar effect.
 *
 * Place BEFORE the `<Bar>` elements in `<BarChart>` children so the bar's
 * solid front face occludes any depth that would extend into an adjacent
 * column. Skips bars at chart center (depth ≈ 0) and dense charts.
 *
 * For stacked bars, wrap the `<BarChart>` in a
 * `<BarDepthProvider segmentsAccessor={...}>` so the side face splits into
 * per-segment parallelograms and the lid color matches the topmost segment.
 */
export function BarDepthBack({
  dataKey,
  color = DEFAULT_BAR_COLOR,
  colorAccessor,
}: BarDepthBackProps) {
  const { isLoaded, enterTransition, revealEpoch = 0 } = useChartStable();
  const { hoveredBarIndex } = useChartHover();
  const { segmentsAccessor } = useContext(BarDepthContext);
  const entries = useBarDepthEntries(dataKey);
  const stagger = useBarDepthStagger();
  const { posStops: glassStops, negStops: glassNegStops } = useGlassStops();
  const idPrefix = useId().replace(/[^a-z0-9]/gi, "_");

  // Two horizontal black gradients (one per depth direction) shade the side
  // from front-edge (lit) to back-edge (in shadow). A single vertical white
  // gradient on the lid: bright catch at the front lip → soft white at the
  // back. The vertical glass gradient layered on top of the side adds the same
  // bright-tip / dark-baseline curve as the front face for continuity.
  const sideShadeRtl = `bdb-side-rtl-${idPrefix}`;
  const sideShadeLtr = `bdb-side-ltr-${idPrefix}`;
  const topShade = `bdb-top-${idPrefix}`;
  const sideGlass = `bdb-glass-${idPrefix}`;
  // Per-bar bbox variant used only for bars that extend below the baseline.
  const sideGlassNeg = `bdb-glass-neg-${idPrefix}`;

  return (
    <g className="bar-depth-back" pointerEvents="none">
      <defs>
        {/* Side shade — diagonal: lit corner at front-top, dark corner at
            back-bottom. Right-of-center bars have the side on the LEFT
            (gradient runs (1,0)→(0,1)); left-of-center bars mirror it. */}
        <linearGradient id={sideShadeRtl} x1="1" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={sideShadeLtr} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.55" />
        </linearGradient>
        {/* Lid 3D shade — mirrors the side face's directionality so the lid
            never reads as a brighter "white-washed cap". Front lip at opacity
            0 (seamless with the front face), back edge picks up shadow as it
            angles into perspective. */}
        <linearGradient id={topShade} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.18" />
        </linearGradient>
        {/* Side glass — per-bar (objectBoundingBox): 0% = the bar's tip,
            100% = its baseline, same proportional gloss as the front face. */}
        <linearGradient id={sideGlass} x1="0" x2="0" y1="0" y2="1">
          {glassStops.map((stop) => (
            <stop
              key={`${stop.offset}-${stop.opacity}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
        {/* Side glass (per-bar bbox variant for negative bars). The gradient
            runs from the bar's baseline-edge (top of bbox) down to the bar's
            value tip (bottom of bbox), lifting the tip glow onto each bar's
            own value edge. */}
        <linearGradient id={sideGlassNeg} x1="0" x2="0" y1="0" y2="1">
          {glassNegStops.map((stop) => (
            <stop
              key={`${stop.offset}-${stop.opacity}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      </defs>

      {entries.map((e) => {
        if (e.depth < BAR_DEPTH_MIN_PX) {
          return null;
        }

        // Resolve stacked segments for this bar. Filter to non-zero so a
        // missing segment doesn't paint an invisible 0-height piece or quietly
        // become the lid color.
        const rawSegments = segmentsAccessor?.(e.datum);
        const visibleSegments = rawSegments?.filter((s) => s.value > 0) ?? null;
        const baseColor = resolveColor(
          e.datum,
          e.dataIndex,
          color,
          colorAccessor
        );

        const sidePieces = buildSidePieces(e, visibleSegments, baseColor);
        // Full-side path for the vertical glass overlay — drawn once per bar
        // so the brightness curve sweeps across the entire side as one layer.
        const fullSidePath = sideFacePath(e, e.topY, e.bottomY);
        // Lid is one parallelogram regardless of segmentation — colored by the
        // topmost visible segment so it matches the front face's top section.
        const topPath = lidFacePath(e);
        const topColor = visibleSegments?.at(-1)?.color ?? baseColor;

        const delay = e.dataIndex * stagger;
        // Grow uses the SAME enter transition + stagger as `<Bar>` so the side
        // and lid rise at the exact speed of the front face. Post-load geometry
        // changes get a quick settle instead.
        const growTransition = isLoaded
          ? { duration: 0.3, ease: "easeOut" as const }
          : transitionWithDelay(enterTransition, delay);
        const isFaded =
          hoveredBarIndex != null && hoveredBarIndex !== e.dataIndex;
        const sideShadeId = e.isRightOfCenter ? sideShadeRtl : sideShadeLtr;
        const safeId = e.label.replace(/[^a-z0-9]/gi, "_");
        const clipId = `bdb-clip-${idPrefix}-${safeId}`;
        // Lid ENTRANCE only (hover-dim is owned by the wrapping group below, so
        // the lid can never dim differently from the side). Positive lids
        // translate up from the baseline riding the growing top edge; negative
        // lids already sit at the baseline, so they fade in instead.
        let lidEntrance: {
          initial: false | { y?: number; opacity?: number };
          animate: { y?: number; opacity?: number };
          transition: Transition;
        } = {
          initial: false,
          animate: { y: 0 },
          transition: { y: growTransition },
        };
        if (!isLoaded && e.isNegative) {
          lidEntrance = {
            initial: { y: 0, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { y: growTransition, opacity: growTransition },
          };
        } else if (!isLoaded) {
          lidEntrance = {
            initial: { y: e.barHeight },
            animate: { y: 0 },
            transition: { y: growTransition },
          };
        }

        return (
          // Single hover-dim group for the whole back surface — side AND lid
          // share this one opacity so they always fade in lockstep (mirrors
          // `<Bar>`, which puts grow on the inner rect and hover-dim on a
          // wrapping group). Entrance animations live on the inner groups.
          <motion.g
            animate={{ opacity: isFaded ? BAR_FADED_OPACITY : 1 }}
            initial={false}
            key={e.label}
            transition={BAR_HOVER_TRANSITION}
          >
            {/* Side face — a clip-rect that grows from the baseline reveals the
                static side path(s) bottom-up, in lockstep with the bar's grow
                animation. ClipPath beats CSS scaleY because motion writes the
                SVG `transform` directly. */}
            <defs>
              <clipPath id={clipId}>
                {/* Keyed on revealEpoch AND isLoaded so it (a) replays on
                    every reveal and (b) snaps to final the instant `<Bar>`
                    swaps to its static rect at isLoaded — so the side never
                    trails the face past the animation cutoff. */}
                <motion.rect
                  animate={{
                    y: e.topY - e.perspectiveRise,
                    height: e.barHeight + e.perspectiveRise,
                  }}
                  initial={isLoaded ? false : { y: e.baselineY, height: 0 }}
                  key={`${clipId}-${revealEpoch}-${isLoaded}`}
                  transition={growTransition}
                  width={e.bandWidth + 2 * e.depth + 2}
                  x={e.bandX - e.depth - 1}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              {/* Per-segment SOLID colors only. */}
              {sidePieces.map((piece) => (
                <path d={piece.path} fill={piece.color} key={piece.path} />
              ))}
              {/* Directional shade + Y-anchored glass painted ONCE over the
                  full side so both gradients stay continuous across segment
                  seams. Per-segment shading uses objectBoundingBox units, which
                  would restart the lit→shadowed ramp at every stacked boundary
                  and read as a notch/indent. The glass is the same global
                  Y-anchored curve as the front face; negatives swap to the
                  per-bar bbox variant so the tip catch lands on the bar's own
                  bottom edge. */}
              <path d={fullSidePath} fill={`url(#${sideShadeId})`} />
              <path
                d={fullSidePath}
                fill={`url(#${e.isNegative ? sideGlassNeg : sideGlass})`}
              />
            </g>

            {/* Top face — three paint passes: solid color → a flat tip-bright
                highlight (the lid is the bar's top, so it gets the reflection
                catch; it can't share the side's objectBoundingBox glass, which
                would map the full ramp onto the lid's own tiny bbox) →
                directional 3D shade darkening the back edge. */}
            <motion.g
              animate={lidEntrance.animate}
              initial={lidEntrance.initial}
              key={`lid-${safeId}-${revealEpoch}-${isLoaded}`}
              transition={lidEntrance.transition}
            >
              <path d={topPath} fill={topColor} />
              <path d={topPath} fill="white" fillOpacity={GLASS_TIP_OPACITY} />
              <path d={topPath} fill={`url(#${topShade})`} />
            </motion.g>
          </motion.g>
        );
      })}
    </g>
  );
}

BarDepthBack.displayName = "BarDepthBack";
// Mark as a non-series layer so `BarChart` doesn't count it as a bar (it
// carries a `dataKey` to pair with a Bar). Mirrors `ChartMarkers`'
// `__isChartMarkers` flag — a static property is minification-safe, unlike
// matching on `displayName`.
(BarDepthBack as { __isBarDepthLayer?: boolean }).__isBarDepthLayer = true;

export interface BarDepthFrontProps {
  /** Key in data for the bar value. Match the sibling `<Bar dataKey>`. */
  dataKey: string;
}

/**
 * Renders the front surface: a glossy glass sheen over the bar's solid fill.
 * Place AFTER the `<Bar>` elements in `<BarChart>` children so the gradient
 * sits on top of the bar.
 *
 * Reads `segmentsAccessor` from the surrounding `<BarDepthProvider>` (if any)
 * via `useBarDepthEntries`, so the glass rectangle's `topY` automatically
 * matches the lid+side's trim. No prop wiring required.
 */
export function BarDepthFront({ dataKey }: BarDepthFrontProps) {
  const { isLoaded, enterTransition, revealEpoch = 0 } = useChartStable();
  const { hoveredBarIndex } = useChartHover();
  const entries = useBarDepthEntries(dataKey);
  const stagger = useBarDepthStagger();
  const { posStops: glassStops, negStops: glassNegStops } = useGlassStops();
  const idPrefix = useId().replace(/[^a-z0-9]/gi, "_");
  const glassId = `bdf-glass-${idPrefix}`;
  const glassIdNeg = `bdf-glass-neg-${idPrefix}`;

  return (
    <g className="bar-depth-front" pointerEvents="none">
      <defs>
        {/* Per-bar (objectBoundingBox) glass for POSITIVE bars: 0% = the bar's
            tip, 100% = its baseline — same proportional gloss on every bar. */}
        <linearGradient id={glassId} x1="0" x2="0" y1="0" y2="1">
          {glassStops.map((stop) => (
            <stop
              key={`${stop.offset}-${stop.opacity}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
        {/* Per-bar bbox variant for negative bars — the bright catch always
            sits on the value-bearing tip no matter how deep the bar reaches. */}
        <linearGradient id={glassIdNeg} x1="0" x2="0" y1="0" y2="1">
          {glassNegStops.map((stop) => (
            <stop
              key={`${stop.offset}-${stop.opacity}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      </defs>

      {entries.map((e) => {
        const delay = e.dataIndex * stagger;
        // Same enter transition + stagger as `<Bar>` so the glass rises in
        // lockstep with the front face.
        const baseTransition = isLoaded
          ? { duration: 0.3, ease: "easeOut" as const }
          : transitionWithDelay(enterTransition, delay);
        const isFaded =
          hoveredBarIndex != null && hoveredBarIndex !== e.dataIndex;

        return (
          <motion.rect
            animate={{
              y: e.topY,
              height: e.barHeight,
              opacity: isFaded ? BAR_FADED_OPACITY : 1,
            }}
            fill={`url(#${e.isNegative ? glassIdNeg : glassId})`}
            // Anchor the grow at the baseline (not bottomY) so the glass grows
            // outward in whichever direction the bar extends. Keyed on
            // revealEpoch so it replays the grow on every reveal, like `<Bar>`.
            initial={isLoaded ? false : { y: e.baselineY, height: 0 }}
            key={`${e.label}-${revealEpoch}-${isLoaded}`}
            transition={{ ...baseTransition, opacity: BAR_HOVER_TRANSITION }}
            width={e.bandWidth}
            x={e.bandX}
          />
        );
      })}
    </g>
  );
}

BarDepthFront.displayName = "BarDepthFront";
(BarDepthFront as { __isBarDepthLayer?: boolean }).__isBarDepthLayer = true;

// ─── BarPulse ─────────────────────────────────────────────────────────

/**
 * Builds the SVG path tracing the silhouette of a 3D bar — the unioned
 * outline of front face + visible side parallelogram + lid parallelogram.
 * Used as the clip region for `BarPulse`'s wave so the gradient only paints
 * inside the bar's visible 3D shape. For dead-center bars (`depth <= 0`) the
 * silhouette degenerates to just the front rectangle.
 */
function buildBarSilhouettePath(e: BarDepthEntry): string {
  const {
    bandX,
    bandWidth,
    topY,
    bottomY,
    depth,
    perspectiveRise,
    isRightOfCenter,
  } = e;
  if (depth <= 0) {
    return [
      `M ${bandX} ${topY}`,
      `L ${bandX + bandWidth} ${topY}`,
      `L ${bandX + bandWidth} ${bottomY}`,
      `L ${bandX} ${bottomY}`,
      "Z",
    ].join(" ");
  }
  if (isRightOfCenter) {
    // Side face on LEFT — back shifted (-depth, -perspectiveRise).
    return [
      `M ${bandX - depth} ${topY - perspectiveRise}`,
      `L ${bandX + bandWidth - depth} ${topY - perspectiveRise}`,
      `L ${bandX + bandWidth} ${topY}`,
      `L ${bandX + bandWidth} ${bottomY}`,
      `L ${bandX} ${bottomY}`,
      `L ${bandX - depth} ${bottomY - perspectiveRise}`,
      "Z",
    ].join(" ");
  }
  // Side face on RIGHT — back shifted (+depth, -perspectiveRise).
  return [
    `M ${bandX} ${topY}`,
    `L ${bandX + depth} ${topY - perspectiveRise}`,
    `L ${bandX + bandWidth + depth} ${topY - perspectiveRise}`,
    `L ${bandX + bandWidth + depth} ${bottomY - perspectiveRise}`,
    `L ${bandX + bandWidth} ${bottomY}`,
    `L ${bandX} ${bottomY}`,
    "Z",
  ].join(" ");
}

export interface BarPulseProps {
  /** Key in data for the bar value. Match the sibling `<Bar dataKey>`. */
  dataKey: string;
  /** Index (in the data array) of the bar to pulse. */
  activeIndex?: number;
  /** Suppress the sweep while keeping the bar's 3D + glass treatment. */
  pulsePaused?: boolean;
}

/**
 * Vertical wave that sweeps from a bar's root (baseline) toward its tip on a
 * continuous loop, painted across the bar's full 3D silhouette (front face +
 * lid + visible side). Reads as a heartbeat pulse flowing up the column for
 * positive bars and down for negative bars — useful for marking a live or
 * in-progress value without adding any fixed element.
 *
 * Select the bar via `activeIndex`. Set `pulsePaused` to freeze it. Place
 * AFTER `<BarDepthFront />` so the wave brightens on top of the glass.
 *
 * Performance: at most one clipped `<motion.rect>` with a single Y translate
 * per frame (no per-frame paint of gradient stops, no SVG filters).
 */
export function BarPulse({ dataKey, activeIndex, pulsePaused }: BarPulseProps) {
  const { isLoaded } = useChartStable();
  const { hoveredBarIndex } = useChartHover();
  const entries = useBarDepthEntries(dataKey, activeIndex);
  const idPrefix = useId().replace(/[^a-z0-9]/gi, "_");
  const activeEntries = useMemo(
    () => entries.filter((e) => e.isActive),
    [entries]
  );

  if (activeEntries.length === 0 || pulsePaused) {
    return null;
  }
  // Hold the wave until bars finish growing — the silhouette clip is computed
  // at the final geometry, so painting it mid-grow would reveal a wave inside
  // an area the bar hasn't reached yet.
  if (!isLoaded) {
    return null;
  }

  return (
    <g className="bar-pulse" pointerEvents="none">
      <defs>
        {activeEntries.flatMap((e) => {
          const safeId = e.label.replace(/[^a-z0-9]/gi, "_");
          const clipId = `bar-pulse-clip-${idPrefix}-${safeId}`;
          const gradId = `bar-pulse-grad-${idPrefix}-${safeId}`;
          return [
            <clipPath id={clipId} key={`clip-${safeId}`}>
              <path d={buildBarSilhouettePath(e)} />
            </clipPath>,
            // Vertical gradient with a centered bright band shaped into a soft
            // bell curve. y1=1, y2=0 makes offset 50% the rect's center, so the
            // brightest pixel sits mid-rect during travel.
            <linearGradient
              id={gradId}
              key={`grad-${safeId}`}
              x1="0"
              x2="0"
              y1="1"
              y2="0"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="10%" stopColor="white" stopOpacity="0" />
              <stop
                offset="22%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.18}
              />
              <stop
                offset="34%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.5}
              />
              <stop
                offset="44%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.85}
              />
              <stop
                offset="50%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY}
              />
              <stop
                offset="56%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.85}
              />
              <stop
                offset="66%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.5}
              />
              <stop
                offset="78%"
                stopColor="white"
                stopOpacity={PULSE_WAVE_PEAK_OPACITY * 0.18}
              />
              <stop offset="90%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>,
          ];
        })}
      </defs>

      {activeEntries.map((e) => {
        const safeId = e.label.replace(/[^a-z0-9]/gi, "_");
        const clipId = `bar-pulse-clip-${idPrefix}-${safeId}`;
        const gradId = `bar-pulse-grad-${idPrefix}-${safeId}`;

        const waveHeight = Math.max(
          e.barHeight * PULSE_WAVE_HEIGHT_RATIO,
          PULSE_WAVE_HEIGHT_MIN_PX
        );
        // Travel always flows root → tip. Positive bars sweep up (root =
        // bottomY); negative bars sweep down (root = topY, the baseline). The
        // gradient is symmetric, so reversing the endpoints reverses direction.
        const yAboveLid = e.topY - e.perspectiveRise - waveHeight;
        const yBelowFloor = e.bottomY;
        const yStart = e.isNegative ? yAboveLid : yBelowFloor;
        const yEnd = e.isNegative ? yBelowFloor : yAboveLid;

        const isFaded =
          hoveredBarIndex != null && hoveredBarIndex !== e.dataIndex;

        return (
          <motion.g
            animate={{ opacity: isFaded ? BAR_FADED_OPACITY : 1 }}
            clipPath={`url(#${clipId})`}
            initial={false}
            key={e.label}
            transition={BAR_HOVER_TRANSITION}
          >
            <motion.rect
              animate={{ y: yEnd }}
              fill={`url(#${gradId})`}
              height={waveHeight}
              initial={{ y: yStart }}
              transition={{
                duration: PULSE_WAVE_DURATION_S,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              // Span wide enough to cover the bar plus its depth on either
              // side; the clipPath crops anything outside the silhouette.
              width={e.bandWidth + 2 * e.depth + 2}
              x={e.bandX - e.depth - 1}
            />
          </motion.g>
        );
      })}
    </g>
  );
}

BarPulse.displayName = "BarPulse";
(BarPulse as { __isBarDepthLayer?: boolean }).__isBarDepthLayer = true;
