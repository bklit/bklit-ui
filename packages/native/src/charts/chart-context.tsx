import type { SkFont } from "@shopify/react-native-skia";
import type { ScaleLinear, ScaleTime } from "d3-scale";
import { createContext, type ReactNode, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";
import type { ChartSprings, ChartTheme } from "./theme";

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSeries {
  dataKey: string;
  label: string;
  stroke: string;
  strokeWidth: number;
  /** Colour tooltip dot/row by the value's sign (profit / loss). */
  signColors?: { positive: string; negative: string };
}

/**
 * How a chart child feeds the shell: tooltip series and the values the
 * scales must include. Attached to components with `withChartPlugin`.
 */
export interface ChartPlugin<P = Record<string, unknown>> {
  series?: (props: P, index: number, theme: ChartTheme) => ChartSeries | null;
  yValues?: (props: P, data: Record<string, unknown>[]) => number[];
  xValues?: (props: P, data: Record<string, unknown>[]) => Date[];
}

export function withChartPlugin<P>(
  component: (props: P) => ReactNode,
  plugin: ChartPlugin<P>
): ((props: P) => ReactNode) & { chartPlugin: ChartPlugin<P> } {
  return Object.assign(component, { chartPlugin: plugin });
}

export function getChartPlugin(type: unknown): ChartPlugin | undefined {
  return (type as { chartPlugin?: ChartPlugin } | null)?.chartPlugin;
}

export interface ChartFonts {
  axis: SkFont;
  tooltip: SkFont;
  tooltipStrong: SkFont;
  ticker: SkFont;
  badge: SkFont;
}

export interface ChartContextValue {
  data: Record<string, unknown>[];
  xDataKey: string;
  width: number;
  height: number;
  margin: Margin;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  series: ChartSeries[];
  /** Pixel x of each datum, in data order. */
  xs: number[];
  theme: ChartTheme;
  fonts: ChartFonts;
  springs: ChartSprings;
  animationDuration: number;
  reducedMotion: boolean;
  /** 0 → 1 left-to-right reveal on mount. */
  revealProgress: SharedValue<number>;

  /** Index under the finger (last one, after release). */
  activeIndex: SharedValue<number>;
  /** Crosshair x in px, springs between snapped indices. */
  crosshairX: SharedValue<number>;
  /** 0 → 1 tooltip visibility. */
  tooltipOpacity: SharedValue<number>;
  /** Floating panel x in px (its own, softer spring). */
  boxX: SharedValue<number>;
  /** Measured tooltip panel width, written by ChartTooltip. */
  boxWidth: SharedValue<number>;
  /** Current date ticker pill width, written by DateTicker. */
  tickerWidth: SharedValue<number>;
  /** Hover-highlight band, in px. */
  highlightX: SharedValue<number>;
  highlightWidth: SharedValue<number>;

  /** Two-finger segment selection, in px / data index. */
  selectionStartX: SharedValue<number>;
  selectionEndX: SharedValue<number>;
  selectionStartIndex: SharedValue<number>;
  selectionEndIndex: SharedValue<number>;
  /** 0 → 1 selection visibility. */
  selectionOpacity: SharedValue<number>;

  /** Panel fade (web: 100ms). */
  panelOpacity: SharedValue<number>;
  /** 0 → 1 panel entrance spring (scale 0.85 → 1, x ±20 → 0). */
  panelEntrance: SharedValue<number>;
  /** 1 when the panel sits left of the crosshair. */
  panelFlipped: SharedValue<number>;
  /** 0 → 1 dot/halo grow-in spring. */
  dotEntrance: SharedValue<number>;
  /** Series dim + highlight band visibility (web: 0.4s easeInOut). */
  highlightOpacity: SharedValue<number>;
}

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error(
      "Chart components must be rendered inside <LineChart> or <AreaChart>."
    );
  }
  return ctx;
}

export function getDate(datum: Record<string, unknown>, key: string): Date {
  const value = datum[key];
  return value instanceof Date ? value : new Date(value as string | number);
}

export function getNumber(datum: Record<string, unknown>, key: string): number {
  const value = Number(datum[key]);
  return Number.isFinite(value) ? value : 0;
}

/** The value, or null when missing (e.g. actuals on forecast rows). */
export function getValue(
  datum: Record<string, unknown>,
  key: string
): number | null {
  const raw = datum[key];
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Finite values of `keys` across `data`. */
export function collectValues(
  data: Record<string, unknown>[],
  keys: string[]
): number[] {
  const out: number[] = [];
  for (const d of data) {
    for (const key of keys) {
      const v = getValue(d, key);
      if (v !== null) {
        out.push(v);
      }
    }
  }
  return out;
}

export function nearestIndex(xs: number[], x: number): number {
  "worklet";
  const last = xs.length - 1;
  if (last <= 0 || x <= xs[0]) {
    return 0;
  }
  if (x >= xs[last]) {
    return last;
  }
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (xs[mid] < x) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return x - xs[lo] < xs[hi] - x ? lo : hi;
}

/**
 * y at pixel `x`, linear between neighbouring defined points; NaN where the
 * series has no value (so dots can hide on forecast rows).
 */
export function sampleY(xs: number[], ys: number[], x: number): number {
  "worklet";
  const n = xs.length;
  if (n === 0) {
    return Number.NaN;
  }
  const i = nearestIndex(xs, x);
  const yi = ys[i] ?? Number.NaN;
  if (!Number.isFinite(yi)) {
    return Number.NaN;
  }
  const j = x >= (xs[i] ?? 0) ? i + 1 : i - 1;
  const yj = ys[j];
  const xi = xs[i] ?? 0;
  const xj = xs[j];
  if (
    yj === undefined ||
    xj === undefined ||
    !Number.isFinite(yj) ||
    xj === xi
  ) {
    return yi;
  }
  const t = (x - xi) / (xj - xi);
  return yi + (yj - yi) * t;
}
