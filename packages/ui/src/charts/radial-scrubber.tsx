"use client";

import { motion, type SpringOptions, useTransform } from "motion/react";
import { useId, useLayoutEffect } from "react";
import {
  RADIAL_CROSSHAIR_SPRING,
  useRadialAngleSpring,
  useRadialChart,
} from "./radial-chart";

/**
 * Scrubber line style.
 * - `solid`: a plain line
 * - `dashed`: a dashed line (see `dashArray`)
 * - `gradient`: fades in along its length, transparent at the center circle
 *   and full strength at the outer end
 */
export type RadialScrubberVariant = "solid" | "dashed" | "gradient";

export interface RadialScrubberProps {
  /** Line style. Default: "solid" */
  variant?: RadialScrubberVariant;
  /** `dashed` variant: SVG stroke-dasharray. Default: "4 4" */
  dashArray?: string;
  /** End dot. Default: true for solid and dashed, false for gradient */
  showDot?: boolean;
  /** Line + dot color. Default: var(--foreground) */
  color?: string;
  /** Line opacity. Default: 0.7 */
  lineOpacity?: number;
  /** Line width. Default: 1.5 */
  strokeWidth?: number;
  /** End dot radius in px. Default: scales with the chart */
  dotRadius?: number;
  /**
   * Where the scrubber rests when nothing is hovered: at "now" (the trailing
   * edge of `nowIndex`) or hidden. Default: "now" when the chart tracks now
   * (clock charts), else "hidden"
   */
  rest?: "now" | "hidden";
  /**
   * Spring toward the hovered bin. Hover dots locked to the crosshair
   * (`RadialLine` / `RadialArea` default) follow it too.
   * Default: `{ stiffness: 420, damping: 42 }`
   */
  spring?: SpringOptions;
}

/**
 * Line from the center circle outward ending in a solid dot (solid / dashed
 * lines) or fading in toward the outer end (gradient). At rest it marks
 * "now" (the trailing edge of `nowIndex`) on clock charts and is hidden
 * otherwise; while hovering it springs to the hovered bin, taking the short
 * way round across the start angle on full circles. Its spring is the
 * chart's crosshair: `RadialLine` / `RadialArea` hover dots ride along it.
 */
export function RadialScrubber({
  variant = "solid",
  dashArray = "4 4",
  showDot: showDotProp,
  color = "var(--foreground)",
  lineOpacity = 0.7,
  strokeWidth = 1.5,
  dotRadius,
  rest: restProp,
  spring: springOptions = RADIAL_CROSSHAIR_SPRING,
}: RadialScrubberProps) {
  const {
    binCount,
    nowIndex,
    trackNow,
    hoveredIndex,
    binAngle,
    binStartAngle,
    isFullCircle,
    orientation,
    centerRadius,
    radius,
    layout,
    reducedMotion,
    registerCrosshair,
  } = useRadialChart();

  const gradientId = `radial-scrubber-${useId().replace(/:/g, "")}`;
  const rest = restProp ?? (trackNow ? "now" : "hidden");
  const hidden = hoveredIndex === null && rest === "hidden";
  const angle =
    hoveredIndex === null
      ? binStartAngle(nowIndex + 1)
      : binAngle(hoveredIndex);

  const spring = useRadialAngleSpring({
    angle,
    hidden,
    isFullCircle,
    snap: reducedMotion,
    spring: springOptions,
  });

  // Hover dots locked to the crosshair follow this spring.
  const drawn = binCount > 0 && orientation !== "angular";
  useLayoutEffect(
    () => (drawn ? registerCrosshair(spring) : undefined),
    [drawn, registerCrosshair, spring]
  );

  const inner = centerRadius + 2;
  const outer = radius * layout.scrubberOuter;
  const x1 = useTransform(spring, (a) => inner * Math.sin(a));
  const y1 = useTransform(spring, (a) => -inner * Math.cos(a));
  const x2 = useTransform(spring, (a) => outer * Math.sin(a));
  const y2 = useTransform(spring, (a) => -outer * Math.cos(a));

  if (binCount === 0 || orientation === "angular") {
    return null;
  }

  const gradient = variant === "gradient";
  const dashed = variant === "dashed";
  const showDot = showDotProp ?? !gradient;

  return (
    <g
      pointerEvents="none"
      style={{
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.15s ease-out",
      }}
    >
      {gradient ? (
        <defs>
          {/* User space, following the line, so it rotates with the angle */}
          <motion.linearGradient
            gradientUnits="userSpaceOnUse"
            id={gradientId}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          >
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </motion.linearGradient>
        </defs>
      ) : null}
      <motion.line
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeDasharray={dashed ? dashArray : undefined}
        strokeLinecap={dashed ? "butt" : "round"}
        strokeOpacity={lineOpacity}
        strokeWidth={strokeWidth}
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
      />
      {showDot ? (
        <motion.circle
          cx={x2}
          cy={y2}
          fill={color}
          r={dotRadius ?? Math.max(2.5, radius * 0.011)}
        />
      ) : null}
    </g>
  );
}

RadialScrubber.displayName = "RadialScrubber";

export default RadialScrubber;
