/**
 * Which side(s) of a series should fade to transparent at the chart edges.
 * - `true`  → fade both edges (default for `<Line>`)
 * - `false` → no fade (default for `<Area>`)
 * - `"left"` / `"right"` → fade only that side
 */
export type FadeEdges = boolean | "left" | "right";

export interface FadeSides {
  /** Whether the left edge should fade out. */
  left: boolean;
  /** Whether the right edge should fade out. */
  right: boolean;
  /** True if either side fades — use to gate gradient/mask defs. */
  any: boolean;
}

export function resolveFadeSides(fade: FadeEdges): FadeSides {
  if (fade === false) {
    return { left: false, right: false, any: false };
  }
  if (fade === "left") {
    return { left: true, right: false, any: true };
  }
  if (fade === "right") {
    return { left: false, right: true, any: true };
  }
  return { left: true, right: true, any: true };
}

export interface FadeGradientStop {
  offset: string;
  opacity: number;
}

/**
 * Stops for a horizontal fade gradient with opacity 0 at the faded side(s)
 * and opacity 1 in the middle. Matches the historic 0/15/85/100 pattern.
 */
export function fadeGradientStops(sides: FadeSides): FadeGradientStop[] {
  return [
    { offset: "0%", opacity: sides.left ? 0 : 1 },
    { offset: "15%", opacity: 1 },
    { offset: "85%", opacity: 1 },
    { offset: "100%", opacity: sides.right ? 0 : 1 },
  ];
}

/** A colour stop on a horizontal stroke gradient. `offset` is 0–1 across the plot. */
export interface StrokeGradientStop {
  offset: number;
  color: string;
}

/**
 * Horizontal stroke colours, left → right across the plot. Plain colours are
 * spaced evenly; pass `{ offset, color }` stops for explicit positions.
 */
export type StrokeGradient = readonly string[] | readonly StrokeGradientStop[];

export interface PaintGradientStop {
  offset: string;
  color: string;
  opacity: number;
}

export function resolveStrokeGradientStops(
  gradient: StrokeGradient | undefined
): StrokeGradientStop[] | null {
  if (!gradient || gradient.length === 0) {
    return null;
  }
  const last = Math.max(1, gradient.length - 1);
  return gradient
    .map((stop, index) =>
      typeof stop === "string"
        ? { offset: gradient.length === 1 ? 0 : index / last, color: stop }
        : {
            offset: Math.min(1, Math.max(0, stop.offset)),
            color: stop.color,
          }
    )
    .sort((a, b) => a.offset - b.offset);
}

function percentToFraction(offset: string): number {
  return Number.parseFloat(offset) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10_000) / 100;
}

/** Colour at `t` on piecewise-linear stops (sRGB, matching SVG gradient interpolation). */
function colorAt(stops: StrokeGradientStop[], t: number): string {
  const first = stops[0] as StrokeGradientStop;
  const last = stops.at(-1) as StrokeGradientStop;
  if (t <= first.offset) {
    return first.color;
  }
  if (t >= last.offset) {
    return last.color;
  }
  for (let i = 1; i < stops.length; i++) {
    const b = stops[i] as StrokeGradientStop;
    if (t > b.offset) {
      continue;
    }
    const a = stops[i - 1] as StrokeGradientStop;
    if (t === b.offset || b.offset === a.offset) {
      return b.color;
    }
    const mix = roundPercent((t - a.offset) / (b.offset - a.offset));
    return `color-mix(in srgb, ${b.color} ${mix}%, ${a.color})`;
  }
  return last.color;
}

function opacityAt(stops: FadeGradientStop[], t: number): number {
  let prev = stops[0] as FadeGradientStop;
  for (const stop of stops) {
    const offset = percentToFraction(stop.offset);
    const prevOffset = percentToFraction(prev.offset);
    if (t <= offset) {
      if (offset === prevOffset) {
        return stop.opacity;
      }
      const progress = (t - prevOffset) / (offset - prevOffset);
      return prev.opacity + (stop.opacity - prev.opacity) * progress;
    }
    prev = stop;
  }
  return prev.opacity;
}

/**
 * Stops for a horizontal stroke paint that combines a colour gradient with the
 * edge-fade opacity stops. Either input may be absent; offsets are merged so
 * the colour ramp and the fade compose instead of replacing each other.
 */
export function horizontalPaintStops({
  color,
  colorStops,
  fadeStops,
}: {
  /** Solid colour used when there is no colour gradient. */
  color: string;
  colorStops: StrokeGradientStop[] | null;
  fadeStops: FadeGradientStop[] | null;
}): PaintGradientStop[] {
  const offsets = new Set<number>();
  for (const stop of colorStops ?? []) {
    offsets.add(stop.offset);
  }
  for (const stop of fadeStops ?? []) {
    offsets.add(percentToFraction(stop.offset));
  }
  if (offsets.size === 0) {
    offsets.add(0);
  }
  return [...offsets]
    .sort((a, b) => a - b)
    .map((t) => ({
      offset: `${roundPercent(t)}%`,
      color: colorStops ? colorAt(colorStops, t) : color,
      opacity: fadeStops ? opacityAt(fadeStops, t) : 1,
    }));
}

/** Horizontal fade gradient pinned to the chart viewport (not the series path bounds). */
export function viewportFadeGradientAttrs(innerWidth: number) {
  return {
    gradientUnits: "userSpaceOnUse" as const,
    x1: 0,
    x2: innerWidth,
    y1: 0,
    y2: 0,
  };
}
