import {
  type CurveFactory,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  area as d3Area,
  line as d3Line,
} from "d3-shape";

export type SparklineCurve = "linear" | "monotone" | "natural" | "step";

export type SparklineDataKey<T> =
  | keyof T
  | ((datum: T, index: number) => number);

export interface SparklinePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SparklinePoint {
  x: number;
  y: number;
  /** NaN when the source value is missing. */
  value: number;
}

export interface SparklineLayout {
  points: SparklinePoint[];
  /** Pixel y of the baseline (0, clamped into the domain). */
  baselineY: number;
  /** Pixel width of one bar slot (bars only; 0 for line/area). */
  band: number;
  domain: [number, number];
}

const curves: Record<SparklineCurve, CurveFactory> = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  natural: curveNatural,
  step: curveStep,
};

export function resolveSparklinePadding(
  padding: number | Partial<SparklinePadding> | undefined,
  fallback: number
): SparklinePadding {
  if (typeof padding === "number" || padding === undefined) {
    const p = padding ?? fallback;
    return { top: p, right: p, bottom: p, left: p };
  }
  return {
    top: padding.top ?? fallback,
    right: padding.right ?? fallback,
    bottom: padding.bottom ?? fallback,
    left: padding.left ?? fallback,
  };
}

export function resolveSparklineValues<T>(
  data: readonly T[],
  dataKey: SparklineDataKey<T>
): number[] {
  return data.map((datum, index) => {
    const raw =
      typeof dataKey === "function"
        ? dataKey(datum, index)
        : (datum as Record<PropertyKey, unknown>)[dataKey as PropertyKey];
    const value = typeof raw === "number" ? raw : Number(raw);
    return raw === null || raw === undefined ? Number.NaN : value;
  });
}

/**
 * Value domain for the sparkline. Bars always include zero so heights read
 * honestly; line/area hug the data unless `includeZero` is set.
 */
export function computeSparklineDomain(
  values: readonly number[],
  options: { yDomain?: [number?, number?]; includeZero?: boolean } = {}
): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (Number.isFinite(value)) {
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
  }
  if (min === Number.POSITIVE_INFINITY) {
    min = 0;
    max = 0;
  }
  if (options.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  min = options.yDomain?.[0] ?? min;
  max = options.yDomain?.[1] ?? max;
  if (min === max) {
    // Flat series: centre the line instead of pinning it to an edge.
    return [min - 1, max + 1];
  }
  return [min, max];
}

export function computeSparklineLayout(
  values: readonly number[],
  options: {
    width: number;
    height: number;
    padding: SparklinePadding;
    domain: [number, number];
    kind: "point" | "band";
  }
): SparklineLayout {
  const { width, height, padding, domain, kind } = options;
  const innerWidth = Math.max(0, width - padding.left - padding.right);
  const innerHeight = Math.max(0, height - padding.top - padding.bottom);
  const [d0, d1] = domain;
  const yOf = (value: number) =>
    padding.top + innerHeight - ((value - d0) / (d1 - d0)) * innerHeight;

  const n = values.length;
  const band = kind === "band" && n > 0 ? innerWidth / n : 0;
  const step = n > 1 ? innerWidth / (n - 1) : 0;

  const points = values.map((value, i) => ({
    x:
      kind === "band"
        ? padding.left + band * (i + 0.5)
        : padding.left + (n > 1 ? step * i : innerWidth / 2),
    y: Number.isFinite(value) ? yOf(value) : Number.NaN,
    value,
  }));

  const baseline = Math.min(Math.max(0, d0), d1);
  return { points, baselineY: yOf(baseline), band, domain };
}

const isDefined = (point: SparklinePoint) => Number.isFinite(point.y);

export function buildSparklineLinePath(
  points: readonly SparklinePoint[],
  curve: SparklineCurve
): string {
  return (
    d3Line<SparklinePoint>()
      .defined(isDefined)
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(curves[curve])(points as SparklinePoint[]) ?? ""
  );
}

export function buildSparklineAreaPath(
  points: readonly SparklinePoint[],
  curve: SparklineCurve,
  baselineY: number
): string {
  return (
    d3Area<SparklinePoint>()
      .defined(isDefined)
      .x((p) => p.x)
      .y0(baselineY)
      .y1((p) => p.y)
      .curve(curves[curve])(points as SparklinePoint[]) ?? ""
  );
}

const round = (value: number) => Math.round(value * 100) / 100;

/** One bar as a path segment, rounding the corners away from the baseline. */
export function buildSparklineBarSegment(
  cx: number,
  barWidth: number,
  y: number,
  baselineY: number,
  radius: number
): string {
  const height = Math.abs(baselineY - y);
  if (height === 0 || barWidth <= 0) {
    return "";
  }
  const x0 = round(cx - barWidth / 2);
  const x1 = round(cx + barWidth / 2);
  const r = Math.min(radius, barWidth / 2, height);
  const up = y < baselineY;
  const tip = round(y);
  const base = round(baselineY);
  if (r <= 0) {
    return `M${x0},${base}V${tip}H${x1}V${base}Z`;
  }
  const dir = up ? 1 : -1;
  const rr = round(r);
  const sweep = up ? 1 : 0;
  return (
    `M${x0},${base}V${round(tip + dir * r)}` +
    `A${rr},${rr} 0 0 ${sweep} ${round(x0 + r)},${tip}` +
    `H${round(x1 - r)}` +
    `A${rr},${rr} 0 0 ${sweep} ${x1},${round(tip + dir * r)}` +
    `V${base}Z`
  );
}

export function sparklineBarWidth(band: number, gap: number): number {
  return Math.max(1, band - gap);
}

/** All bars as a single path — one DOM node regardless of point count. */
export function buildSparklineBarsPath(
  layout: SparklineLayout,
  options: { gap: number; radius: number }
): string {
  const barWidth = sparklineBarWidth(layout.band, options.gap);
  let d = "";
  for (const point of layout.points) {
    if (Number.isFinite(point.y)) {
      d += buildSparklineBarSegment(
        point.x,
        barWidth,
        point.y,
        layout.baselineY,
        options.radius
      );
    }
  }
  return d;
}

/** Nearest data index for a pointer x position (in chart pixels). */
export function sparklineIndexAtX(
  x: number,
  options: {
    count: number;
    width: number;
    padding: SparklinePadding;
    kind: "point" | "band";
  }
): number | null {
  const { count, width, padding, kind } = options;
  if (count === 0) {
    return null;
  }
  const innerWidth = width - padding.left - padding.right;
  if (innerWidth <= 0) {
    return 0;
  }
  const t = (x - padding.left) / innerWidth;
  const raw =
    kind === "band" ? Math.floor(t * count) : Math.round(t * (count - 1));
  return Math.min(count - 1, Math.max(0, raw));
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Screen-reader summary, e.g. "12 points, from 3.1K to 4.2K, up 35%". */
export function describeSparkline(values: readonly number[]): string {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) {
    return "No data";
  }
  const first = finite[0] as number;
  const last = finite.at(-1) as number;
  let summary = `${finite.length} points, from ${formatCompact(first)} to ${formatCompact(last)}`;
  if (first !== 0) {
    const change = ((last - first) / Math.abs(first)) * 100;
    const direction = change >= 0 ? "up" : "down";
    summary += `, ${direction} ${Math.abs(Math.round(change))}%`;
  }
  return summary;
}

/**
 * Tween frame between two layouts. Points take the target x; the previous
 * shape is resampled onto the target grid so series of different lengths
 * rise and fall into place. Missing values snap.
 */
export function interpolateSparklineLayout(
  from: SparklineLayout,
  to: SparklineLayout,
  t: number
): SparklineLayout {
  const m = from.points.length;
  const n = to.points.length;
  const fromYAt = (i: number): number => {
    if (m === 0) {
      return Number.NaN;
    }
    if (m === n) {
      return from.points[i]?.y ?? Number.NaN;
    }
    const position = n > 1 ? (i / (n - 1)) * (m - 1) : 0;
    const lo = Math.floor(position);
    const a = from.points[lo]?.y ?? Number.NaN;
    const b = from.points[Math.min(m - 1, lo + 1)]?.y ?? Number.NaN;
    return a + (b - a) * (position - lo);
  };
  return {
    ...to,
    baselineY: from.baselineY + (to.baselineY - from.baselineY) * t,
    points: to.points.map((point, i) => {
      const fromY = fromYAt(i);
      return Number.isFinite(fromY) && Number.isFinite(point.y)
        ? { ...point, y: fromY + (point.y - fromY) * t }
        : point;
    }),
  };
}
