import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export const DEFAULT_ACTIVE_GRADIENT: readonly [string, string] = [
  "#bef264",
  "#10b981",
];

export const DEFAULT_ACTIVE_FILL_OPACITY = 1;
export const DEFAULT_INACTIVE_FILL_OPACITY = 0.8;
export const DEFAULT_LINEAR_GAUGE_HEIGHT = 24;

export interface NotchPoint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
}

export interface ComputedNotch {
  index: number;
  points: NotchPoint;
  isActive: boolean;
  gradientColor: string;
  xCenter: number;
  yCenter: number;
}

function isDefsComponent(child: ReactElement): boolean {
  const typeLabel =
    (child.type as { displayName?: string })?.displayName ||
    (child.type as { name?: string })?.name ||
    "";
  return (
    typeLabel.includes("Gradient") ||
    typeLabel.includes("Pattern") ||
    typeLabel === "LinearGradient" ||
    typeLabel === "RadialGradient" ||
    typeLabel === "Lines" ||
    typeLabel === "PatternLines" ||
    typeLabel === "Circles" ||
    typeLabel === "Hexagons" ||
    typeLabel === "Waves"
  );
}

export function collectGaugeDefsElements(nodes: ReactNode): ReactElement[] {
  const out: ReactElement[] = [];
  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    if (child.type === Fragment) {
      out.push(
        ...collectGaugeDefsElements(
          (child.props as { children?: ReactNode }).children
        )
      );
      return;
    }
    if (isDefsComponent(child)) {
      out.push(child);
    }
  });
  return out;
}

export function interpolateGaugeHex(
  color1: string,
  color2: string,
  factor: number
): string {
  const hex = (c: string) => Number.parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function createNotchPath(
  points: NotchPoint,
  cornerRadiusPx: number,
  verticalDepth: number
): string {
  const { x1, y1, x2, y2, x3, y3, x4, y4 } = points;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const dist = (ax: number, ay: number, bx: number, by: number) =>
    Math.hypot(bx - ax, by - ay);

  const d12 = dist(x1, y1, x2, y2);
  const d23 = dist(x2, y2, x3, y3);
  const d34 = dist(x3, y3, x4, y4);
  const d41 = dist(x4, y4, x1, y1);

  if (cornerRadiusPx <= 0) {
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
  }

  const minEdge = Math.min(d12, d23, d34, d41);
  const cr = Math.min(
    cornerRadiusPx,
    verticalDepth * 0.48,
    d12 * 0.49,
    d23 * 0.49,
    d34 * 0.49,
    d41 * 0.49,
    minEdge * 0.49
  );

  const r1 = Math.min(cr / d12, 0.49);
  const r2 = Math.min(cr / d23, 0.49);
  const r3 = Math.min(cr / d34, 0.49);
  const r4 = Math.min(cr / d41, 0.49);

  const p1a = { x: lerp(x1, x4, r4), y: lerp(y1, y4, r4) };
  const p1b = { x: lerp(x1, x2, r1), y: lerp(y1, y2, r1) };
  const p2a = { x: lerp(x2, x1, r1), y: lerp(y2, y1, r1) };
  const p2b = { x: lerp(x2, x3, r2), y: lerp(y2, y3, r2) };
  const p3a = { x: lerp(x3, x2, r2), y: lerp(y3, y2, r2) };
  const p3b = { x: lerp(x3, x4, r3), y: lerp(y3, y4, r3) };
  const p4a = { x: lerp(x4, x3, r3), y: lerp(y4, y3, r3) };
  const p4b = { x: lerp(x4, x1, r4), y: lerp(y4, y1, r4) };

  return `M ${p1a.x} ${p1a.y} Q ${x1} ${y1} ${p1b.x} ${p1b.y} L ${p2a.x} ${p2a.y} Q ${x2} ${y2} ${p2b.x} ${p2b.y} L ${p3a.x} ${p3a.y} Q ${x3} ${y3} ${p3b.x} ${p3b.y} L ${p4a.x} ${p4a.y} Q ${x4} ${y4} ${p4b.x} ${p4b.y} Z`;
}

export function resolveGaugeBgFill(options: {
  notchIndex: number;
  totalNotches: number;
  hasCustomInactive: boolean;
  inactiveFill?: string;
  useThemePaletteGradient: boolean;
  useGradient: boolean;
  inactiveGrad0: string;
  inactiveGrad1: string;
  arcTrackFill: string;
  linearTrackFill: string;
  linearMode: boolean;
}): string {
  const {
    notchIndex,
    totalNotches,
    hasCustomInactive,
    inactiveFill,
    useThemePaletteGradient,
    useGradient,
    inactiveGrad0,
    inactiveGrad1,
    arcTrackFill,
    linearTrackFill,
    linearMode,
  } = options;

  if (hasCustomInactive) {
    return inactiveFill as string;
  }
  if (useThemePaletteGradient) {
    return linearMode ? "var(--chart-1)" : arcTrackFill;
  }
  if (useGradient) {
    const denom = totalNotches > 1 ? totalNotches - 1 : 1;
    return interpolateGaugeHex(
      inactiveGrad0,
      inactiveGrad1,
      notchIndex / denom
    );
  }
  return linearMode ? linearTrackFill : arcTrackFill;
}

export function resolveGaugeActiveFill(options: {
  notch: ComputedNotch;
  hasCustomActive: boolean;
  activeFill?: string;
  useThemePaletteGradient: boolean;
  themeActiveGradientId: string;
  useGradient: boolean;
  activeFillSolid: string;
}): string {
  const {
    notch,
    hasCustomActive,
    activeFill,
    useThemePaletteGradient,
    themeActiveGradientId,
    useGradient,
    activeFillSolid,
  } = options;

  if (hasCustomActive) {
    return activeFill as string;
  }
  if (useThemePaletteGradient) {
    return `url(#${themeActiveGradientId})`;
  }
  if (useGradient) {
    return notch.gradientColor;
  }
  return activeFillSolid;
}
