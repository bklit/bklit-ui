import { scaleLinear, scaleRadial } from "d3-scale";
import {
  isFullArc,
  polarToCartesian,
  radialArcPath,
  TAU,
} from "./arc-geometry";

// Shared with the ring chart (dependency-free).
// biome-ignore lint/performance/noBarrelFile: keeps the radial geometry API stable
export {
  isFullArc,
  polarToCartesian,
  radialArcPath,
  TAU,
} from "./arc-geometry";

/**
 * Radii of the radial chart's rings, as fractions of the chart radius
 * (half the square stage). Shared by every radial layer.
 */
export interface RadialLayout {
  /** Center circle (hole) radius */
  center: number;
  /** Tick ring: inner end of every tick */
  tickInner: number;
  /** Tick ring: outer end of minor ticks */
  tickMinorOuter: number;
  /** Tick ring: outer end of major ticks */
  tickMajorOuter: number;
  /** Value band base — value 0 maps here */
  bandInner: number;
  /** Value band top — the max value maps here */
  bandOuter: number;
  /** Where the scrubber line ends */
  scrubberOuter: number;
  /** Axis (hour) labels */
  axisLabel: number;
}

export const defaultRadialLayout: RadialLayout = {
  center: 0.37,
  tickInner: 0.38,
  tickMinorOuter: 0.393,
  tickMajorOuter: 0.405,
  bandInner: 0.408,
  bandOuter: 0.83,
  scrubberOuter: 0.895,
  axisLabel: 0.955,
};

/** Degrees → radians. */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Clockwise angle from 12 o'clock for a point relative to the centre. */
export function cartesianToAngle(dx: number, dy: number): number {
  const angle = Math.atan2(dx, -dy);
  return angle < 0 ? angle + TAU : angle;
}

/** Start angle of bin `index` when `binCount` bins fill the full turn. */
export function radialBinStartAngle(index: number, binCount: number): number {
  return (index / Math.max(1, binCount)) * TAU;
}

/** Center angle of bin `index`. */
export function radialBinCenterAngle(index: number, binCount: number): number {
  return ((index + 0.5) / Math.max(1, binCount)) * TAU;
}

/** Bin under a clockwise angle (radians). */
export function radialAngleToBin(angle: number, binCount: number): number {
  const normalized = ((angle % TAU) + TAU) % TAU;
  return Math.min(binCount - 1, Math.floor((normalized / TAU) * binCount));
}

/**
 * Fraction (0–1) of the arc `start → end` at `angle`, or null when the angle
 * falls in the gap of a partial arc. Works for clockwise (end > start) and
 * counter-clockwise (end < start) arcs.
 */
export function radialArcFraction(
  angle: number,
  startAngle: number,
  endAngle: number
): number | null {
  const span = endAngle - startAngle;
  if (span === 0) {
    return null;
  }
  const direction = Math.sign(span);
  const offset = ((((angle - startAngle) * direction) % TAU) + TAU) % TAU;
  const length = Math.abs(span);
  if (length >= TAU - 1e-6) {
    return offset / TAU;
  }
  if (offset <= length) {
    return offset / length;
  }
  return null;
}

/**
 * Bounding box of an arc of radius 1 (and the centre point), in unit
 * coordinates — used to crop the stage around partial arcs.
 */
export function radialArcBounds(startAngle: number, endAngle: number) {
  const lo = Math.min(startAngle, endAngle);
  const hi = Math.max(startAngle, endAngle);
  const points = [
    { x: 0, y: 0 },
    polarToCartesian(lo, 1),
    polarToCartesian(hi, 1),
  ];
  // Cardinal directions inside the arc extend the box.
  const first = Math.ceil(lo / (Math.PI / 2));
  for (let k = first; k * (Math.PI / 2) <= hi; k++) {
    points.push(polarToCartesian(k * (Math.PI / 2), 1));
  }
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

/** Pie-slice path (centre → arc → centre) of radius `r`, for clip paths. */
export function radialWedgePath(
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  if (isFullArc(startAngle, endAngle)) {
    return `${radialArcPath(radius, startAngle, endAngle)}`;
  }
  return `M0,0L${radialArcPath(radius, startAngle, endAngle).slice(1)}Z`;
}

/**
 * Value → radius with `d3.scaleRadial`, so the *area* between the band base
 * and the radius grows linearly with the value (the d3 radial bar / area
 * convention). `minValue` (default 0) maps to the band base.
 */
export function createRadialScale({
  minValue = 0,
  maxValue,
  innerRadius,
  outerRadius,
}: {
  minValue?: number;
  maxValue: number;
  innerRadius: number;
  outerRadius: number;
}) {
  return scaleRadial()
    .domain([minValue, Math.max(maxValue, minValue + Number.EPSILON)])
    .range([innerRadius, outerRadius])
    .clamp(true);
}

/** Round a value domain outward to nice tick values (d3 `scale.nice`). */
export function niceRadialDomain(
  domain: [number, number],
  count = 5
): [number, number] {
  const [min, max] = scaleLinear().domain(domain).nice(count).domain();
  return [min ?? domain[0], max ?? domain[1]];
}

/** Evenly spaced round values across a domain (d3 `scale.ticks`). */
export function radialValueTicks(
  domain: [number, number],
  count = 5
): number[] {
  return scaleLinear().domain(domain).ticks(count);
}
