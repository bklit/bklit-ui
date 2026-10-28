"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { memo } from "react";
import { arcStartLabelLayout } from "./arc-geometry";
import {
  type RingData,
  ringCssVars,
  useRingHover,
  useRingStable,
} from "./ring-context";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";

export interface RingLabelsProps {
  /** Label text per ring. Default: `data[index].label` */
  format?: (data: RingData, index: number) => string;
  /** Color each label with its ring color. Default: false (muted) */
  colorByRing?: boolean;
  /** Label color when `colorByRing` is false. Default: var(--chart-label) */
  color?: string;
  /** Font size, px. Default: scales with the ring pitch (9–12) */
  fontSize?: number;
  /** Distance before each ring's start, px. Default: 0.6 × font size */
  offset?: number;
}

interface RingLabelProps {
  index: number;
  text: string;
  color: string;
  x: number;
  y: number;
  transform: string | undefined;
  anchor: "start" | "middle" | "end";
  isStatic: boolean;
}

const RingLabel = memo(function RingLabel({
  index,
  text,
  color,
  x,
  y,
  transform,
  anchor,
  isStatic,
}: RingLabelProps) {
  const { enterTransition, enterStaggerScale, animationKey } = useRingStable();
  const { hoveredIndex } = useRingHover();
  // Fades in as its ring's progress starts filling (same delay as `Ring`).
  const progress = useMountProgress(
    enterTransition,
    (0.6 + index * 0.1) * enterStaggerScale,
    `${animationKey}-label-${index}`
  );
  const done = useEnterComplete(progress);
  const enterOpacity = useTransform(progress, [0, 1], [0, 1]);
  const hoverOpacity =
    hoveredIndex !== null && hoveredIndex !== index ? 0.35 : 1;

  const node = (
    <text
      dominantBaseline="central"
      fill={color}
      style={{ fill: color }}
      textAnchor={anchor}
      transform={transform}
      x={x}
      y={y}
    >
      {text}
    </text>
  );

  if (isStatic || done) {
    return (
      <motion.g
        animate={{ opacity: hoverOpacity }}
        initial={false}
        transition={{ duration: 0.15 }}
      >
        {node}
      </motion.g>
    );
  }
  return <motion.g style={{ opacity: enterOpacity }}>{node}</motion.g>;
});

/**
 * Ring labels for {@link RingChart}: each ring's label sits just before the
 * ring's start angle, aligned with its bar — beside the start in the empty
 * quadrant of a 270° arc, rotated upright along the start edge when the arc
 * starts at 3 or 9 o'clock (semicircles). Best on partial arcs; on a full
 * circle the labels sit over the end of each track.
 */
export const RingLabels = memo(function RingLabels({
  format,
  colorByRing = false,
  color = ringCssVars.label,
  fontSize: fontSizeProp,
  offset: offsetProp,
}: RingLabelsProps) {
  const {
    data,
    startAngle,
    endAngle,
    strokeWidth,
    ringGap,
    getRingRadii,
    getColor,
    geometryScrubbing,
  } = useRingStable();
  const reducedMotion = useReducedMotion() ?? false;

  const fontSize =
    fontSizeProp ?? Math.min(12, Math.max(9, (strokeWidth + ringGap) * 0.6));
  const layout = arcStartLabelLayout(
    startAngle,
    endAngle,
    offsetProp ?? fontSize * 0.6
  );

  return (
    <g className="font-mono" fontSize={fontSize} pointerEvents="none">
      {data.map((ring, index) => {
        const { innerRadius, outerRadius } = getRingRadii(index);
        const { x, y, transform } = layout.position(
          (innerRadius + outerRadius) / 2
        );
        return (
          <RingLabel
            anchor={layout.anchor}
            color={colorByRing ? getColor(index) : color}
            index={index}
            isStatic={reducedMotion || geometryScrubbing}
            key={ring.label}
            text={format ? format(ring, index) : ring.label}
            transform={transform}
            x={x}
            y={y}
          />
        );
      })}
    </g>
  );
});

RingLabels.displayName = "RingLabels";

export default RingLabels;
