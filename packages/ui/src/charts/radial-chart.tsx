"use client";

import {
  type MotionValue,
  type SpringOptions,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type SVGProps,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { useElementSize } from "./chart-parent-size";
import {
  cartesianToAngle,
  createRadialScale,
  defaultRadialLayout,
  degreesToRadians,
  isFullArc,
  niceRadialDomain,
  polarToCartesian,
  type RadialLayout,
  radialArcBounds,
  radialArcFraction,
  radialWedgePath,
  TAU,
} from "./radial-geometry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadialSeries {
  /** Datum key holding this series' value for a bin */
  dataKey: string;
  /** Legend / center label. Default: `dataKey` */
  label?: string;
  /**
   * Fill / stroke color. Default: the palette slot for the series index,
   * `var(--chart-N)` (see `radialSeriesColor`)
   */
  color?: string;
  /** Base opacity of the series' marks. Default: 1 */
  opacity?: number;
  /**
   * Radial opacity ramp: opacity at the band base, rising to full opacity
   * outward. Layers decide how to apply it. Default: 1 (no ramp)
   */
  rampFrom?: number;
  /** Tint this series' legend count with its color (e.g. an alert series) */
  emphasize?: boolean;
}

/**
 * What the angle encodes.
 * - `clock`: bins of a day (00 at the start angle). Tracks "now" and future
 *   bins (ghost data) and labels the axis 00 / 06 / 12 / 18.
 * - `band`: categories — `RadialAxis` labels every bin with `datum[xDataKey]`.
 * - `time`: `datum[xDataKey]` is a Date / timestamp / ISO string per evenly
 *   spaced bin — `RadialAxis` draws time ticks (e.g. months).
 */
export type RadialAngleType = "clock" | "band" | "time";

/**
 * How bins and values map onto the disc.
 * - `radial` (default): bins around the angle, value outward along the radius.
 * - `angular`: bins are concentric rings (first bin innermost) and the value
 *   sweeps along the angle — progress-ring / MUI "horizontal" radial bars.
 *   Draw it with `RadialRingBar`.
 */
export type RadialOrientation = "radial" | "angular";

/**
 * Chart-level value scale shared by every layer that doesn't pass its own
 * `maxValue`.
 * - number: the value at the band top
 * - `"auto"`: the largest single value of any series / `valueKeys` key
 * - `"stacked"`: the largest per-bin sum of the series (and any `valueKeys`)
 */
export type RadialMaxValue = number | "auto" | "stacked";

export interface RadialRingBand {
  inner: number;
  outer: number;
  /** Mid radius of the ring */
  center: number;
}

export interface RadialChartContextValue {
  data: Record<string, unknown>[];
  xDataKey: string;
  series: RadialSeries[];
  binCount: number;
  /** Stage diameter in px (twice `radius`; 0 until measured) */
  size: number;
  /** Chart radius — every layout fraction is relative to this */
  radius: number;
  layout: RadialLayout;
  /** Center circle radius in px */
  centerRadius: number;
  /** Value band base (min value) in px */
  innerRadius: number;
  /** Value band top (max value) in px */
  outerRadius: number;
  /**
   * Bins where no series has a value — e.g. the rest of today. Layers can
   * draw comparison ("ghost") data there. All false unless `trackNow`.
   */
  futureBins: boolean[];
  /** Last bin with data (or the `nowIndex` prop) */
  nowIndex: number;
  /** True when the chart tracks "now" / future bins (clock charts) */
  trackNow: boolean;
  /** Per-series sums over every non-future bin */
  totals: Record<string, number>;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  /**
   * Animated crosshair angle in radians: the mounted `RadialScrubber`'s
   * spring, else a chart-owned spring with the same config. Hover dots
   * locked to the crosshair follow it. May run past one turn (it takes the
   * short way round), so treat it as periodic.
   */
  crosshairAngle: MotionValue<number>;
  /** `RadialScrubber` registers its spring as the crosshair; returns the cleanup */
  registerCrosshair: (angle: MotionValue<number>) => () => void;
  /** Legend-hovered series index (dim the others) */
  hoveredSeries: number | null;
  setHoveredSeries: (index: number | null) => void;
  /** False until the first frame after mount — flip to run enter transitions */
  revealed: boolean;
  /** Enter animations on (false under prefers-reduced-motion) */
  animate: boolean;
  reducedMotion: boolean;

  // Angle ---------------------------------------------------------------------
  angleType: RadialAngleType;
  orientation: RadialOrientation;
  /** Arc start in radians (0 = 12 o'clock, clockwise) */
  startAngle: number;
  /** Arc end in radians */
  endAngle: number;
  /** True when the arc is the full turn */
  isFullCircle: boolean;
  /** Signed angular width of one bin (radial orientation) */
  binWidth: number;
  /** Center angle of bin `index` */
  binAngle: (index: number) => number;
  /** Start angle of bin `index` (`binStartAngle(binCount)` is the arc end) */
  binStartAngle: (index: number) => number;
  /** Bin under an angle, or null in the gap of a partial arc */
  angleToBin: (angle: number) => number | null;
  /** Fraction (0–1) along the arc → angle */
  fractionToAngle: (fraction: number) => number;
  /**
   * `time` charts: timestamp (ms) / Date → angle, or null outside the data's
   * time span. Bin `i` starts at `datum[i][xDataKey]`.
   */
  timeToAngle: (time: Date | number) => number | null;
  /** `time` charts: [first bin start, last bin end] in ms, else null */
  timeDomain: [number, number] | null;

  // Value ---------------------------------------------------------------------
  /** Value domain mapped to [innerRadius, outerRadius] (or the arc when angular) */
  valueDomain: [number, number];
  /** Shorthand for `valueDomain[1]` */
  maxValue: number;
  /**
   * True when `RadialChart` got `maxValue` — layers without their own
   * `maxValue` then share `valueScale`. False keeps each layer's own scale.
   */
  sharedValueScale: boolean;
  /** Value → radius (`scaleRadial` over `valueDomain`, clamped) */
  valueScale: (value: number) => number;
  /** `angular` orientation: value → angle (linear over `valueDomain`, clamped) */
  valueToAngle: (value: number) => number;
  /** `angular` orientation: radii of bin `index`'s ring */
  ringBand: (index: number) => RadialRingBand;
}

export interface RadialChartProps {
  /** One datum per angular bin, clockwise from the start angle (e.g. 96 × 15 min) */
  data: Record<string, unknown>[];
  /** Datum key with the bin label / category / time. Default: "time" */
  xDataKey?: string;
  /** Series, innermost / first stacked first */
  series: RadialSeries[];
  /** Override ring radii (fractions of the chart radius) */
  layout?: Partial<RadialLayout>;
  /** What the angle encodes. Default: "clock" */
  angleType?: RadialAngleType;
  /** Bins along the angle (default) or as concentric rings. Default: "radial" */
  orientation?: RadialOrientation;
  /** Arc start in degrees, 0 = 12 o'clock, clockwise. Default: 0 */
  startAngle?: number;
  /** Arc end in degrees. Default: `startAngle + 360` (full circle) */
  endAngle?: number;
  /**
   * Crop the stage to the arc's bounding box for partial arcs (e.g. a
   * semicircle is about twice as wide as tall). Default: true
   */
  fitArc?: boolean;
  /**
   * Track "now": bins after the last bin with data are future bins (ghost
   * data, scrubber rests at now). Default: true for `clock` charts
   */
  trackNow?: boolean;
  /** Bin the resting scrubber points at. Default: last bin with data */
  nowIndex?: number;
  /**
   * Shared value scale for every layer without its own `maxValue` (also
   * drives `RadialAxis` value rings). Default: unset — each layer scales
   * itself (`angular` charts default to "stacked").
   */
  maxValue?: RadialMaxValue;
  /** Value mapped to the band base. "auto" = smallest value. Default: 0 */
  minValue?: number | "auto";
  /** Extra datum keys (not series) included in the auto domain, e.g. "yesterday" */
  valueKeys?: string[];
  /** Round an automatic domain to nice tick values. Default: true */
  niceValues?: boolean;
  /** `angular` orientation: gap between rings as a fraction of a ring step. Default: 0.3 */
  ringGap?: number;
  /** Enter animations. Default: true (skipped for prefers-reduced-motion) */
  animate?: boolean;
  /** Controlled hovered bin */
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  /** Max chart width in px. Default: 640 */
  maxWidth?: number;
  className?: string;
  /**
   * SVG layers (`RadialAxis`, `RadialDotBar`, `RadialScrubber`, …) are drawn
   * in a group centred on the chart. `RadialCenter` is drawn as HTML in the
   * hole and `RadialLegend` below the chart.
   */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RadialChartContext = createContext<RadialChartContextValue | null>(null);

export function useRadialChart(): RadialChartContextValue {
  const context = useContext(RadialChartContext);
  if (!context) {
    throw new Error(
      "useRadialChart must be used within a <RadialChart> component."
    );
  }
  return context;
}

/** Finite number at `datum[key]`, else null. */
export function radialNumberAt(
  datum: Record<string, unknown> | undefined | null,
  key: string
): number | null {
  const value = datum?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Timestamp (ms) of a Date / number / date string, else null. */
export function radialTimeOf(value: unknown): number | null {
  let time = Number.NaN;
  if (value instanceof Date) {
    time = value.getTime();
  } else if (typeof value === "number") {
    time = value;
  } else if (typeof value === "string") {
    time = Date.parse(value);
  }
  return Number.isFinite(time) ? time : null;
}

// ---------------------------------------------------------------------------
// Crosshair + hover dots
// ---------------------------------------------------------------------------

/** Spring of the crosshair (`RadialScrubber` and dots locked to it). */
export const RADIAL_CROSSHAIR_SPRING: SpringOptions = {
  stiffness: 420,
  damping: 42,
};

/** Default spring of a hover dot with its own spring (`"spring"` motion). */
export const RADIAL_DOT_SPRING: SpringOptions = {
  stiffness: 240,
  damping: 24,
};

/**
 * How a hover dot (`RadialLine` marker, `RadialArea` active dot) follows the
 * pointer. It always rides the curve: its radius is the edge's radius at the
 * dot's current angle.
 * - `crosshair`: locked to the crosshair — the same animated angle as
 *   `RadialScrubber` (or the chart's matching spring when there is none)
 * - `spring`: its own spring toward the hovered bin (see the `*Spring` prop)
 * - `none`: snaps to the hovered bin
 */
export type RadialDotMotion = "crosshair" | "spring" | "none";

/**
 * Angle that springs toward `angle`, taking the short way round on full
 * circles. While `hidden` it holds still; leaving hidden jumps straight to
 * the target. `snap` (e.g. reduced motion) jumps on every change.
 */
export function useRadialAngleSpring({
  angle,
  hidden,
  isFullCircle,
  snap,
  spring: springOptions = RADIAL_CROSSHAIR_SPRING,
}: {
  angle: number;
  hidden: boolean;
  isFullCircle: boolean;
  snap: boolean;
  spring?: SpringOptions;
}): MotionValue<number> {
  const spring = useSpring(angle, springOptions);
  const targetRef = useRef(angle);
  const wasHiddenRef = useRef(hidden);

  // Layout effect: hover dots read the jump before the first paint.
  useLayoutEffect(() => {
    const wasHidden = wasHiddenRef.current;
    wasHiddenRef.current = hidden;
    if (hidden) {
      return;
    }
    if (wasHidden) {
      targetRef.current = angle;
      spring.jump(angle);
      return;
    }
    const previous = targetRef.current;
    let next = angle;
    if (isFullCircle) {
      let delta = (angle - previous) % TAU;
      if (delta > Math.PI) {
        delta -= TAU;
      } else if (delta < -Math.PI) {
        delta += TAU;
      }
      next = previous + delta;
    }
    targetRef.current = next;
    if (snap) {
      spring.jump(next);
    } else {
      spring.set(next);
    }
  }, [spring, angle, snap, isFullCircle, hidden]);

  return spring;
}

/**
 * Animated angle for a hover dot. `crosshair` returns the chart's crosshair;
 * `spring` / `none` run the dot's own spring (`none` and reduced motion snap).
 */
export function useRadialDotAngle(
  motion: RadialDotMotion,
  spring: SpringOptions = RADIAL_DOT_SPRING
): MotionValue<number> {
  const {
    crosshairAngle,
    hoveredIndex,
    binAngle,
    isFullCircle,
    reducedMotion,
  } = useRadialChart();
  const own = useRadialAngleSpring({
    angle: binAngle(hoveredIndex ?? 0),
    hidden: hoveredIndex === null || motion === "crosshair",
    isFullCircle,
    snap: motion === "none" || reducedMotion,
    spring,
  });
  return motion === "crosshair" ? crosshairAngle : own;
}

/** Edge radius along a ray at `angle`, or null where there is no edge (gaps). */
export type RadialEdgeLookup = (angle: number) => number | null;

const BEZIER_STEPS = 10;

/**
 * Flatten whatever a d3 radial generator draws (pass it the context) into
 * segments, and look up the edge radius at any angle by ray intersection —
 * exact for the rendered curve, gaps included.
 */
export function createRadialEdgeLookup(
  draw: (context: CanvasRenderingContext2D) => void
): RadialEdgeLookup {
  const segments: number[] = [];
  let startX = 0;
  let startY = 0;
  let x = 0;
  let y = 0;
  const push = (nx: number, ny: number) => {
    segments.push(x, y, nx, ny);
    x = nx;
    y = ny;
  };
  const context = {
    moveTo(nx: number, ny: number) {
      startX = nx;
      startY = ny;
      x = nx;
      y = ny;
    },
    lineTo: push,
    bezierCurveTo(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number
    ) {
      const x0 = x;
      const y0 = y;
      for (let k = 1; k <= BEZIER_STEPS; k++) {
        const t = k / BEZIER_STEPS;
        const u = 1 - t;
        const a = u * u * u;
        const b = 3 * u * u * t;
        const c = 3 * u * t * t;
        const d = t * t * t;
        push(
          a * x0 + b * x1 + c * x2 + d * x3,
          a * y0 + b * y1 + c * y2 + d * y3
        );
      }
    },
    quadraticCurveTo(x1: number, y1: number, x2: number, y2: number) {
      const x0 = x;
      const y0 = y;
      for (let k = 1; k <= BEZIER_STEPS; k++) {
        const t = k / BEZIER_STEPS;
        const u = 1 - t;
        push(
          u * u * x0 + 2 * u * t * x1 + t * t * x2,
          u * u * y0 + 2 * u * t * y1 + t * t * y2
        );
      }
    },
    closePath() {
      if (x !== startX || y !== startY) {
        push(startX, startY);
      }
    },
  };
  draw(context as unknown as CanvasRenderingContext2D);
  const flat = Float64Array.from(segments);

  return (angle) => {
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    let best = -1;
    for (let i = 0; i < flat.length; i += 4) {
      const x0 = flat[i] ?? 0;
      const y0 = flat[i + 1] ?? 0;
      const ex = (flat[i + 2] ?? 0) - x0;
      const ey = (flat[i + 3] ?? 0) - y0;
      const denom = dx * ey - dy * ex;
      if (Math.abs(denom) < 1e-9) {
        continue;
      }
      // Ray s·d meets segment P0 + t·e
      const t = (x0 * dy - y0 * dx) / denom;
      if (t < -1e-6 || t > 1 + 1e-6) {
        continue;
      }
      const s = (x0 * ey - y0 * ex) / denom;
      if (s > best) {
        best = s;
      }
    }
    return best > 0 ? best : null;
  };
}

/**
 * Hover dot that rides an edge at an animated angle. Position is written to
 * the DOM from the motion value (no React render per frame); the dot hides
 * where the edge has no point (gaps, partial runs).
 */
export function RadialHoverDot({
  angle,
  lookup,
  ...props
}: {
  angle: MotionValue<number>;
  lookup: RadialEdgeLookup;
} & Omit<SVGProps<SVGCircleElement>, "cx" | "cy" | "ref" | "visibility">) {
  const ref = useRef<SVGCircleElement>(null);
  const place = useCallback(
    (a: number) => {
      const r = lookup(a);
      return r === null ? null : polarToCartesian(a, r);
    },
    [lookup]
  );

  useLayoutEffect(() => {
    const apply = (a: number) => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const p = place(a);
      if (!p) {
        el.setAttribute("visibility", "hidden");
        return;
      }
      el.removeAttribute("visibility");
      el.setAttribute("cx", String(p.x));
      el.setAttribute("cy", String(p.y));
    };
    apply(angle.get());
    return angle.on("change", apply);
  }, [angle, place]);

  const initial = place(angle.get());
  return (
    <circle
      {...props}
      cx={initial?.x ?? 0}
      cy={initial?.y ?? 0}
      ref={ref}
      visibility={initial ? undefined : "hidden"}
    />
  );
}

/** Children with these display names are drawn as HTML over the hole. */
const CENTER_CHILDREN = new Set(["RadialCenter"]);
/** Children with these display names are drawn below the chart. */
const BELOW_CHILDREN = new Set(["RadialLegend"]);

function childDisplayName(child: ReactNode): string {
  if (!isValidElement(child)) {
    return "";
  }
  return (child.type as { displayName?: string }).displayName ?? "";
}

/** Smallest / largest value of any key, and the largest per-bin series stack. */
function scanValues(
  data: Record<string, unknown>[],
  series: RadialSeries[],
  keys: string[]
) {
  let lo = Number.POSITIVE_INFINITY;
  let hi = 0;
  let stack = 0;
  for (const d of data) {
    for (const key of keys) {
      const v = radialNumberAt(d, key);
      if (v !== null) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
    const sum = series.reduce(
      (total, s) => total + Math.max(0, radialNumberAt(d, s.dataKey) ?? 0),
      0
    );
    stack = Math.max(stack, sum);
  }
  return { lo: Number.isFinite(lo) ? lo : 0, hi, stack };
}

function computeValueDomain({
  data,
  series,
  valueKeys,
  maxValue,
  minValue,
  nice,
}: {
  data: Record<string, unknown>[];
  series: RadialSeries[];
  valueKeys: string[];
  maxValue: RadialMaxValue;
  minValue: number | "auto";
  nice: boolean;
}): [number, number] {
  const keys = [...series.map((s) => s.dataKey), ...valueKeys];
  const { lo, hi, stack } = scanValues(data, series, keys);
  const autoMin = minValue === "auto";
  const fixedMax = typeof maxValue === "number";
  const min = autoMin ? lo : minValue;
  let max = Math.max(hi, maxValue === "stacked" ? stack : 0);
  if (fixedMax) {
    max = maxValue;
  }
  if (!nice || (fixedMax && !autoMin)) {
    return [min, max];
  }
  const [niceMin, niceMax] = niceRadialDomain([min, Math.max(max, min)]);
  return [autoMin ? niceMin : min, fixedMax ? max : niceMax];
}

// ---------------------------------------------------------------------------
// Chart shell
// ---------------------------------------------------------------------------

/**
 * Square, responsive shell for radial charts: measures itself, owns the
 * shared geometry (start angle at the top, clockwise; full circle or a
 * partial arc), the shared value scale, hover-by-angle (or by ring), legend
 * hover and the enter flag, and exposes them through {@link useRadialChart}.
 */
export function RadialChart({
  data,
  xDataKey = "time",
  series,
  layout: layoutProp,
  angleType = "clock",
  orientation = "radial",
  startAngle: startAngleDeg = 0,
  endAngle: endAngleDeg,
  fitArc = true,
  trackNow: trackNowProp,
  nowIndex: nowIndexProp,
  maxValue: maxValueProp,
  minValue = 0,
  valueKeys,
  niceValues = true,
  ringGap = 0.3,
  animate = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  maxWidth = 640,
  className,
  children,
}: RadialChartProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(stageRef, 100);
  const layout = useMemo(
    () => ({ ...defaultRadialLayout, ...layoutProp }),
    [layoutProp]
  );

  // Arc -----------------------------------------------------------------------
  const startAngle = degreesToRadians(startAngleDeg);
  const endAngle = degreesToRadians(endAngleDeg ?? startAngleDeg + 360);
  const isFullCircle = isFullArc(startAngle, endAngle);
  const span = endAngle - startAngle;

  const bounds = useMemo(
    () =>
      isFullCircle || !fitArc
        ? { minX: -1, maxX: 1, minY: -1, maxY: 1 }
        : (() => {
            const b = radialArcBounds(startAngle, endAngle);
            // Room around the centre for the hole / center content.
            const pad = 0.12;
            return {
              minX: Math.min(b.minX, -pad),
              maxX: Math.max(b.maxX, pad),
              minY: Math.min(b.minY, -pad),
              maxY: Math.max(b.maxY, pad),
            };
          })(),
    [isFullCircle, fitArc, startAngle, endAngle]
  );
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  const stageWidth = Math.max(0, width);
  const radius = stageWidth / boundsWidth;
  const stageHeight = radius * boundsHeight;
  const cx = -bounds.minX * radius;
  const cy = -bounds.minY * radius;
  const size = radius * 2;

  const reducedMotion = useReducedMotion() === true;
  const shouldAnimate = animate && !reducedMotion;

  // Hover ------------------------------------------------------------------
  const [internalHovered, setInternalHovered] = useState<number | null>(null);
  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHovered;
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (!isControlled) {
        setInternalHovered(index);
      }
      onHoverChange?.(index);
    },
    [isControlled, onHoverChange]
  );
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

  // Data -------------------------------------------------------------------
  const binCount = data.length;
  const trackNow = trackNowProp ?? angleType === "clock";

  const futureBins = useMemo(
    () =>
      data.map(
        (d) =>
          trackNow && series.every((s) => radialNumberAt(d, s.dataKey) === null)
      ),
    [data, series, trackNow]
  );

  const nowIndex = useMemo(() => {
    if (nowIndexProp !== undefined) {
      return nowIndexProp;
    }
    for (let i = binCount - 1; i >= 0; i--) {
      if (series.some((s) => radialNumberAt(data[i], s.dataKey) !== null)) {
        return i;
      }
    }
    return binCount - 1;
  }, [nowIndexProp, data, series, binCount]);

  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    for (const s of series) {
      result[s.dataKey] = 0;
    }
    data.forEach((d, i) => {
      if (futureBins[i]) {
        return;
      }
      for (const s of series) {
        result[s.dataKey] =
          (result[s.dataKey] ?? 0) + (radialNumberAt(d, s.dataKey) ?? 0);
      }
    });
    return result;
  }, [data, series, futureBins]);

  // Value scale ----------------------------------------------------------------
  const sharedValueScale =
    maxValueProp !== undefined || orientation === "angular";
  const valueKeysKey = valueKeys?.join("\u0000") ?? "";
  const valueDomain = useMemo(
    () =>
      computeValueDomain({
        data,
        series,
        valueKeys: valueKeys ?? [],
        maxValue: maxValueProp ?? "stacked",
        minValue,
        nice: niceValues,
      }),
    [data, series, valueKeysKey, maxValueProp, minValue, niceValues]
  );

  const innerRadius = radius * layout.bandInner;
  const outerRadius = radius * layout.bandOuter;

  const valueScale = useMemo(() => {
    const scale = createRadialScale({
      minValue: valueDomain[0],
      maxValue: valueDomain[1],
      innerRadius,
      outerRadius,
    });
    return (value: number) => scale(value) ?? innerRadius;
  }, [valueDomain, innerRadius, outerRadius]);

  const valueToAngle = useCallback(
    (value: number) => {
      const [lo, hi] = valueDomain;
      const t = hi > lo ? (value - lo) / (hi - lo) : 0;
      return startAngle + Math.min(1, Math.max(0, t)) * span;
    },
    [valueDomain, startAngle, span]
  );

  const ringBand = useCallback(
    (index: number): RadialRingBand => {
      const step = (outerRadius - innerRadius) / Math.max(1, binCount);
      const gap = step * Math.min(0.95, Math.max(0, ringGap));
      const inner = innerRadius + index * step + gap / 2;
      const outer = innerRadius + (index + 1) * step - gap / 2;
      return { inner, outer, center: (inner + outer) / 2 };
    },
    [innerRadius, outerRadius, binCount, ringGap]
  );

  // Time --------------------------------------------------------------------
  const timeDomain = useMemo((): [number, number] | null => {
    if (angleType !== "time" || binCount === 0) {
      return null;
    }
    const first = radialTimeOf(data[0]?.[xDataKey]);
    const last = radialTimeOf(data[binCount - 1]?.[xDataKey]);
    if (first === null || last === null) {
      return null;
    }
    const step = binCount > 1 ? (last - first) / (binCount - 1) : 1;
    return [first, first + step * binCount];
  }, [angleType, binCount, data, xDataKey]);

  const timeToAngle = useCallback(
    (time: Date | number) => {
      if (!timeDomain) {
        return null;
      }
      const t = typeof time === "number" ? time : time.getTime();
      const [t0, t1] = timeDomain;
      if (t < t0 || t > t1 || t1 <= t0) {
        return null;
      }
      return startAngle + ((t - t0) / (t1 - t0)) * span;
    },
    [timeDomain, startAngle, span]
  );

  // Enter flag ---------------------------------------------------------------
  const [revealed, setRevealed] = useState(false);
  const hasSize = stageWidth > 0;
  useEffect(() => {
    if (!hasSize) {
      return;
    }
    if (!shouldAnimate) {
      setRevealed(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setRevealed(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [hasSize, shouldAnimate]);

  // Angle helpers ------------------------------------------------------------
  const centerRadius = radius * layout.center;
  const binWidth = binCount > 0 ? span / binCount : 0;

  const binStartAngle = useCallback(
    (index: number) => startAngle + (index / Math.max(1, binCount)) * span,
    [startAngle, span, binCount]
  );
  const binAngle = useCallback(
    (index: number) =>
      startAngle + ((index + 0.5) / Math.max(1, binCount)) * span,
    [startAngle, span, binCount]
  );
  const fractionToAngle = useCallback(
    (fraction: number) => startAngle + fraction * span,
    [startAngle, span]
  );
  const angleToBin = useCallback(
    (angle: number) => {
      const fraction = radialArcFraction(angle, startAngle, endAngle);
      if (fraction === null || binCount === 0) {
        return null;
      }
      return Math.min(binCount - 1, Math.floor(fraction * binCount));
    },
    [startAngle, endAngle, binCount]
  );

  // Crosshair ------------------------------------------------------------------
  // Fallback for charts without a RadialScrubber, so locked hover dots move
  // the same way either way.
  const fallbackCrosshair = useRadialAngleSpring({
    angle: binAngle(hoveredIndex ?? 0),
    hidden: hoveredIndex === null,
    isFullCircle,
    snap: reducedMotion,
  });
  const [scrubberCrosshair, setScrubberCrosshair] =
    useState<MotionValue<number> | null>(null);
  const registerCrosshair = useCallback((angle: MotionValue<number>) => {
    setScrubberCrosshair(angle);
    return () =>
      setScrubberCrosshair((current) => (current === angle ? null : current));
  }, []);
  const crosshairAngle = scrubberCrosshair ?? fallbackCrosshair;

  // Pointer ----------------------------------------------------------------
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (binCount === 0) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const dx = event.clientX - rect.left - cx;
      const dy = event.clientY - rect.top - cy;
      const distance = Math.hypot(dx, dy);
      let next: number | null = null;
      if (orientation === "angular") {
        const step = (outerRadius - innerRadius) / binCount;
        const ring = Math.floor((distance - innerRadius) / step);
        next = ring >= 0 && ring < binCount ? ring : null;
      } else if (distance >= centerRadius * 0.5) {
        next = angleToBin(cartesianToAngle(dx, dy));
      }
      if (next !== hoveredIndex) {
        setHoveredIndex(next);
      }
    },
    [
      binCount,
      cx,
      cy,
      orientation,
      outerRadius,
      innerRadius,
      centerRadius,
      angleToBin,
      hoveredIndex,
      setHoveredIndex,
    ]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredIndex(null);
  }, [setHoveredIndex]);

  // Context ----------------------------------------------------------------
  const contextValue = useMemo(
    (): RadialChartContextValue => ({
      data,
      xDataKey,
      series,
      binCount,
      size,
      radius,
      layout,
      centerRadius,
      innerRadius,
      outerRadius,
      futureBins,
      nowIndex,
      trackNow,
      totals,
      hoveredIndex,
      setHoveredIndex,
      crosshairAngle,
      registerCrosshair,
      hoveredSeries,
      setHoveredSeries,
      revealed,
      animate: shouldAnimate,
      reducedMotion,
      angleType,
      orientation,
      startAngle,
      endAngle,
      isFullCircle,
      binWidth,
      binAngle,
      binStartAngle,
      angleToBin,
      fractionToAngle,
      timeToAngle,
      timeDomain,
      valueDomain,
      maxValue: valueDomain[1],
      sharedValueScale,
      valueScale,
      valueToAngle,
      ringBand,
    }),
    [
      data,
      xDataKey,
      series,
      binCount,
      size,
      radius,
      layout,
      centerRadius,
      innerRadius,
      outerRadius,
      futureBins,
      nowIndex,
      trackNow,
      totals,
      hoveredIndex,
      setHoveredIndex,
      crosshairAngle,
      registerCrosshair,
      hoveredSeries,
      revealed,
      shouldAnimate,
      reducedMotion,
      angleType,
      orientation,
      startAngle,
      endAngle,
      isFullCircle,
      binWidth,
      binAngle,
      binStartAngle,
      angleToBin,
      fractionToAngle,
      timeToAngle,
      timeDomain,
      valueDomain,
      sharedValueScale,
      valueScale,
      valueToAngle,
      ringBand,
    ]
  );

  // Children -------------------------------------------------------------------
  const svgChildren: ReactNode[] = [];
  const centerChildren: ReactNode[] = [];
  const belowChildren: ReactNode[] = [];
  Children.forEach(children, (child) => {
    const name = childDisplayName(child);
    if (CENTER_CHILDREN.has(name)) {
      centerChildren.push(child);
    } else if (BELOW_CHILDREN.has(name)) {
      belowChildren.push(child);
    } else if (child !== null && child !== undefined && child !== false) {
      svgChildren.push(child);
    }
  });

  const centerSize = Math.max(0, centerRadius * 2 - 16);

  return (
    <RadialChartContext.Provider value={contextValue}>
      <div
        className={cn("mx-auto flex w-full flex-col items-center", className)}
        style={{ maxWidth }}
      >
        <div
          className="relative w-full"
          ref={stageRef}
          style={{ aspectRatio: `${boundsWidth} / ${boundsHeight}` }}
        >
          {hasSize ? (
            <>
              <svg
                aria-hidden="true"
                className="absolute inset-0 touch-pan-y select-none"
                height={stageHeight}
                onPointerLeave={handlePointerLeave}
                onPointerMove={handlePointerMove}
                style={{ overflow: "visible" }}
                width={stageWidth}
              >
                <g transform={`translate(${cx},${cy})`}>
                  {/* Hit area so the whole disc tracks the pointer */}
                  {isFullCircle ? (
                    <circle fill="transparent" r={radius} />
                  ) : (
                    <path
                      d={radialWedgePath(radius, startAngle, endAngle)}
                      fill="transparent"
                    />
                  )}
                  {svgChildren}
                </g>
              </svg>

              {centerChildren.length > 0 ? (
                <div
                  className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{
                    left: cx,
                    top: cy,
                    width: centerSize,
                    height: centerSize,
                  }}
                >
                  {centerChildren}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        {belowChildren}
      </div>
    </RadialChartContext.Provider>
  );
}

RadialChart.displayName = "RadialChart";

export default RadialChart;
