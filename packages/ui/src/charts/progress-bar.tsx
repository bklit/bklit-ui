"use client";

import { ParentSize } from "@visx/responsive";
import { motion, type Transition, useReducedMotion } from "motion/react";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

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

function collectDefsElements(nodes: ReactNode): ReactElement[] {
  const out: ReactElement[] = [];
  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    if (child.type === Fragment) {
      out.push(
        ...collectDefsElements(
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

function interpolateHex(
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

const DEFAULT_ACTIVE_GRADIENT: readonly [string, string] = [
  "#bef264",
  "#10b981",
];

const DEFAULT_ACTIVE_FILL_OPACITY = 1;
const DEFAULT_INACTIVE_FILL_OPACITY = 0.8;
const DEFAULT_BAR_HEIGHT = 24;

const DEFAULT_NOTCH_ENTER_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export interface ProgressBarProps {
  /** Fill level 0–100 */
  value: number;
  /** Number of bar notches */
  totalNotches?: number;
  /** Percentage of the bar reserved for gaps between notches */
  spacing?: number;
  /**
   * Corner fillet radius for each notch corner (pixels). **0** = sharp corners;
   * higher values read more rounded.
   */
  notchCornerRadius?: number;
  /** `true` = rectangular notches; `false` = tapered toward the vertical center */
  uniformWidth?: boolean;
  useGradient?: boolean;
  /**
   * When `useGradient` is true, active notch colors interpolate along the bar
   * between these hex stops (default lime → emerald).
   */
  activeGradient?: readonly [string, string];
  /**
   * When `useGradient` is true, inactive notch colors interpolate between these
   * hex stops. Defaults to {@link activeGradient} when omitted.
   */
  inactiveGradient?: readonly [string, string];
  /**
   * Inactive / track notch fill — CSS color or `url(#patternId)` (define patterns
   * in `children`).
   */
  inactiveFill?: string;
  /**
   * Active notch fill — CSS color or `url(#patternId)`.
   * When set, overrides solid / gradient active fills for that layer.
   */
  activeFill?: string;
  /**
   * SVG `fill-opacity` for inactive / track notches (0–1).
   * Default **0.8** (foreground default is **1**).
   */
  inactiveFillOpacity?: number;
  /**
   * SVG `fill-opacity` for active notches (0–1). Default **1**.
   */
  activeFillOpacity?: number;
  /**
   * `PatternLines`, gradients, etc. — rendered inside `<defs>` (same convention
   * as `Gauge` children).
   */
  children?: ReactNode;
  className?: string;
  /**
   * Explicit pixel size. When omitted, the bar fills its parent width; give the
   * parent a size for responsive layouts.
   */
  width?: number;
  height?: number;
  /** Minimum width (px) when using the built-in responsive wrapper. Default 200 */
  minWidth?: number;
  /**
   * Vertical depth of notches as a **%** of the built-in default (outer 42% /
   * inner 28% of `height`). **100** = full depth; lower values shorten each
   * notch toward the vertical center. Clamped **5–100**.
   */
  notchLengthPercent?: number;
  /** Framer Motion transition for notch enter animation (opacity / scale). */
  enterTransition?: Transition;
  /** Scales notch stagger delays relative to default timing (1 = reference). */
  enterStaggerScale?: number;
  /**
   * Studio-only: render static notch paths with no enter animation so geometry
   * props (spacing, count, etc.) update live while scrubbing controls.
   */
  geometryScrubbing?: boolean;
}

interface ProgressBarInnerProps
  extends Omit<ProgressBarProps, "className" | "minWidth"> {
  width: number;
  height: number;
}

function ProgressBarInner({
  value,
  totalNotches = 40,
  spacing = 25,
  notchCornerRadius = 0,
  uniformWidth = false,
  width,
  height,
  useGradient = false,
  activeGradient,
  inactiveGradient,
  inactiveFill,
  activeFill,
  inactiveFillOpacity,
  activeFillOpacity,
  children,
  notchLengthPercent = 100,
  enterTransition,
  enterStaggerScale = 1,
  geometryScrubbing = false,
}: ProgressBarInnerProps) {
  const prefersReducedMotion = useReducedMotion();
  const themeActiveGradientId = `progress-bar-theme-active-${useId().replace(/:/g, "")}`;
  const defsChildren = useMemo(() => collectDefsElements(children), [children]);

  const notchTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : (enterTransition ?? DEFAULT_NOTCH_ENTER_TRANSITION);

  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));

  const hasCustomInactive =
    inactiveFill !== undefined && inactiveFill.length > 0;
  const hasCustomActive = activeFill !== undefined && activeFill.length > 0;

  const resolvedActiveFillOpacity =
    activeFillOpacity ?? DEFAULT_ACTIVE_FILL_OPACITY;
  const resolvedInactiveFillOpacity =
    inactiveFillOpacity ?? DEFAULT_INACTIVE_FILL_OPACITY;

  const centerY = height / 2;
  const outerOffset = height * 0.42;
  const innerOffsetBase = height * 0.28;
  const defaultVerticalDepth = outerOffset - innerOffsetBase;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const notchDepth = defaultVerticalDepth * depthFactor;
  const innerOffset = outerOffset - notchDepth;

  const activeNotches = Math.round((value / 100) * totalNotches);

  const availableWidth = width * (1 - spacing / 100);
  const notchWidth = totalNotches > 0 ? availableWidth / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapWidth = (width * (spacing / 100)) / gapDen;

  const activeGrad0 = activeGradient?.[0] ?? DEFAULT_ACTIVE_GRADIENT[0];
  const activeGrad1 = activeGradient?.[1] ?? DEFAULT_ACTIVE_GRADIENT[1];
  const inactiveGrad0 = inactiveGradient?.[0] ?? activeGrad0;
  const inactiveGrad1 = inactiveGradient?.[1] ?? activeGrad1;
  const useThemePaletteGradient = useGradient && activeGradient === undefined;

  const notches = useMemo(() => {
    return Array.from({ length: totalNotches }, (_, i) => {
      const xCenter = i * (notchWidth + gapWidth) + notchWidth / 2;
      const halfWidth = (notchWidth * 0.8) / 2;

      let x1: number;
      let y1: number;
      let x2: number;
      let y2: number;
      let x3: number;
      let y3: number;
      let x4: number;
      let y4: number;

      if (uniformWidth) {
        const halfHeight = notchDepth / 2;
        x1 = xCenter - halfWidth;
        y1 = centerY - halfHeight;
        x2 = xCenter + halfWidth;
        y2 = centerY - halfHeight;
        x3 = xCenter + halfWidth;
        y3 = centerY + halfHeight;
        x4 = xCenter - halfWidth;
        y4 = centerY + halfHeight;
      } else {
        x1 = xCenter - halfWidth;
        y1 = centerY - outerOffset;
        x2 = xCenter + halfWidth;
        y2 = centerY - outerOffset;
        const innerHalfWidth = halfWidth * (innerOffset / outerOffset);
        x3 = xCenter + innerHalfWidth;
        y3 = centerY + outerOffset;
        x4 = xCenter - innerHalfWidth;
        y4 = centerY + outerOffset;
      }

      const denom = totalNotches > 1 ? totalNotches - 1 : 1;
      const gradientFactor = i / denom;
      const gradientColor =
        useGradient && !useThemePaletteGradient
          ? interpolateHex(activeGrad0, activeGrad1, gradientFactor)
          : "var(--chart-1)";

      return {
        index: i,
        points: { x1, y1, x2, y2, x3, y3, x4, y4 },
        isActive: i < activeNotches,
        gradientColor,
        xCenter,
      };
    });
  }, [
    totalNotches,
    notchWidth,
    gapWidth,
    centerY,
    outerOffset,
    innerOffset,
    activeNotches,
    uniformWidth,
    notchDepth,
    activeGrad0,
    activeGrad1,
    useGradient,
    useThemePaletteGradient,
  ]);

  const createNotchPath = (
    points: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
      x4: number;
      y4: number;
    },
    cornerRadiusPx: number,
    verticalDepth: number
  ) => {
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
  };

  const bgFillSolid = "var(--chart-background)";
  const activeFillSolid = "var(--chart-1)";

  const denom = totalNotches > 1 ? totalNotches - 1 : 1;

  const resolveBgFill = (notchIndex: number) => {
    if (hasCustomInactive) {
      return inactiveFill as string;
    }
    if (useThemePaletteGradient) {
      // Use series color so track opacity is visible on the studio canvas (not
      // chart-background, which matches the frame and hides inactiveFillOpacity).
      return activeFillSolid;
    }
    if (useGradient) {
      return interpolateHex(inactiveGrad0, inactiveGrad1, notchIndex / denom);
    }
    return bgFillSolid;
  };

  const resolveActiveFill = (notch: (typeof notches)[number]) => {
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
  };

  return (
    <div className="relative" style={{ height, width }}>
      <svg
        aria-hidden="true"
        className="overflow-visible"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        {defsChildren.length > 0 || useThemePaletteGradient ? (
          <defs>
            {useThemePaletteGradient ? (
              <linearGradient
                id={themeActiveGradientId}
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-5)" />
              </linearGradient>
            ) : null}
            {defsChildren}
          </defs>
        ) : null}
        {notches.map((notch) => {
          const pathD = createNotchPath(
            notch.points,
            notchCornerRadius,
            notchDepth
          );
          if (geometryScrubbing) {
            return (
              <path
                d={pathD}
                fill={resolveBgFill(notch.index)}
                fillOpacity={resolvedInactiveFillOpacity}
                key={`bg-${notch.index}`}
              />
            );
          }
          return (
            <motion.path
              animate={{ opacity: 1, scale: 1 }}
              d={pathD}
              fill={resolveBgFill(notch.index)}
              fillOpacity={resolvedInactiveFillOpacity}
              initial={{ opacity: 0, scale: 0 }}
              key={`bg-${notch.index}`}
              style={{
                transformOrigin: `${notch.xCenter}px ${centerY}px`,
              }}
              transition={{
                ...notchTransition,
                delay: notch.index * 0.015 * stagger,
              }}
            />
          );
        })}

        {notches
          .filter((n) => n.isActive)
          .map((notch) => {
            const pathD = createNotchPath(
              notch.points,
              notchCornerRadius,
              notchDepth
            );
            if (geometryScrubbing) {
              return (
                <path
                  d={pathD}
                  fill={resolveActiveFill(notch)}
                  fillOpacity={resolvedActiveFillOpacity}
                  key={`active-${notch.index}`}
                />
              );
            }
            return (
              <motion.path
                animate={{ opacity: 1, scale: 1 }}
                d={pathD}
                fill={resolveActiveFill(notch)}
                fillOpacity={resolvedActiveFillOpacity}
                initial={{ opacity: 0, scale: 0 }}
                key={`active-${notch.index}`}
                style={{
                  transformOrigin: `${notch.xCenter}px ${centerY}px`,
                }}
                transition={{
                  ...notchTransition,
                  delay: (0.3 + notch.index * 0.02) * stagger,
                }}
              />
            );
          })}
      </svg>
    </div>
  );
}

export function ProgressBar({
  width: widthProp,
  height: heightProp,
  className,
  minWidth = 200,
  ...props
}: ProgressBarProps) {
  const resolvedHeight = heightProp ?? DEFAULT_BAR_HEIGHT;

  if (widthProp != null && heightProp != null) {
    return (
      <div className={cn("relative inline-flex max-w-full", className)}>
        <ProgressBarInner height={heightProp} width={widthProp} {...props} />
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full max-w-full", className)}
      style={{ minWidth }}
    >
      <div className="w-full" style={{ height: resolvedHeight }}>
        <ParentSize debounceTime={10}>
          {({ width }) =>
            width > 0 ? (
              <ProgressBarInner
                height={resolvedHeight}
                width={width}
                {...props}
              />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

ProgressBar.displayName = "ProgressBar";
