"use client";

import { arc as arcGenerator } from "@visx/shape";
import {
  type MotionValue,
  motion,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { memo, useCallback } from "react";
import {
  getRingHitRadii,
  ringCssVars,
  useRingHover,
  useRingStable,
} from "./ring-context";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";

function generateArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number
): string {
  const generator = arcGenerator<unknown>({
    innerRadius,
    outerRadius,
    cornerRadius,
  });
  return generator({ startAngle, endAngle } as unknown as null) || "";
}

export type RingLineCap = "round" | "butt";

export interface RingProps {
  index: number;
  color?: string;
  animate?: boolean;
  showGlow?: boolean;
  lineCap?: RingLineCap;
}

function ringHoverScale(isHovered: boolean, isPushedOut: boolean): number {
  if (isHovered) {
    return 1.03;
  }
  if (isPushedOut) {
    return 1.02;
  }
  return 1;
}

function RingProgressPath({
  progressComplete,
  progressPath,
  animatedProgressPath,
  color,
}: {
  progressComplete: boolean;
  progressPath: string;
  animatedProgressPath: MotionValue<string>;
  color: string;
}) {
  if (progressComplete) {
    if (!progressPath) {
      return null;
    }
    return <path d={progressPath} fill={color} />;
  }
  return <motion.path d={animatedProgressPath} fill={color} />;
}

export const Ring = memo(function Ring({
  index,
  color: colorProp,
  animate = true,
  showGlow = true,
  lineCap = "round",
}: RingProps) {
  const {
    data,
    getColor,
    getRingRadii,
    startAngle,
    endAngle,
    enterTransition,
    enterStaggerScale,
    animationKey,
    baseInnerRadius,
    strokeWidth,
    ringGap,
  } = useRingStable();
  const { hoveredIndex, setHoveredIndex } = useRingHover();
  const reducedMotion = useReducedMotion() ?? false;

  const expandDelay = index * 0.08 * enterStaggerScale;
  const expandProgress = useMountProgress(
    enterTransition,
    expandDelay,
    `${animationKey}-expand-${index}`
  );
  const expandComplete = useEnterComplete(expandProgress);

  const progressDelay = (0.6 + index * 0.1) * enterStaggerScale;
  const progressMount = useMountProgress(
    enterTransition,
    progressDelay,
    `${animationKey}-progress-${index}`
  );
  const progressComplete = useEnterComplete(progressMount);

  const ringData = data[index];
  const progress = ringData ? ringData.value / ringData.maxValue : 0;
  const arcRange = endAngle - startAngle;

  const animatedProgressPath = useTransform(progressMount, (v) => {
    if (!ringData) {
      return "";
    }
    const currentEndAngle = startAngle + arcRange * progress * v;
    if (currentEndAngle <= startAngle + 0.01) {
      return "";
    }
    const radii = getRingRadii(index);
    const corner =
      lineCap === "round" ? (radii.outerRadius - radii.innerRadius) / 2 : 0;
    return generateArcPath(
      radii.innerRadius,
      radii.outerRadius,
      startAngle,
      currentEndAngle,
      corner
    );
  });

  const enterScale = useTransform(expandProgress, [0, 1], [0, 1]);

  const handleMouseEnter = useCallback(
    () => setHoveredIndex(index),
    [index, setHoveredIndex]
  );
  const handleMouseLeave = useCallback(
    () => setHoveredIndex(null),
    [setHoveredIndex]
  );

  if (!ringData) {
    return null;
  }

  const { innerRadius, outerRadius } = getRingRadii(index);
  const color = colorProp || getColor(index);

  const isHovered = hoveredIndex === index;
  const isFaded = hoveredIndex !== null && hoveredIndex !== index;
  const isPushedOut = hoveredIndex !== null && hoveredIndex < index;

  const cornerRadius =
    lineCap === "round" ? (outerRadius - innerRadius) / 2 : 0;
  const bgPath = generateArcPath(
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    cornerRadius
  );
  const progressEndAngle = startAngle + arcRange * progress;
  const progressPath =
    progressEndAngle <= startAngle + 0.01
      ? ""
      : generateArcPath(
          innerRadius,
          outerRadius,
          startAngle,
          progressEndAngle,
          cornerRadius
        );

  const hoverScale = ringHoverScale(isHovered, isPushedOut);
  const layerOpacity = isFaded ? 0.35 : 1;
  const enterDone =
    !animate || reducedMotion || (expandComplete && progressComplete);

  const groupStyle = {
    transformOrigin: "0px 0px",
    filter: showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : "none",
  };

  // Static hit band (does not scale with hover) so the pointer can't fall
  // off the edge of a growing ring and flicker between hover states.
  const hitRadii = getRingHitRadii(
    index,
    baseInnerRadius,
    strokeWidth,
    ringGap
  );
  const hitboxPath = generateArcPath(
    hitRadii.innerRadius,
    hitRadii.outerRadius,
    startAngle,
    endAngle,
    0
  );
  const hitbox = (
    // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox for visualization
    <path
      d={hitboxPath}
      fill="transparent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    />
  );

  if (enterDone) {
    return (
      <g>
        {hitbox}
        <motion.g
          animate={{ scale: hoverScale, opacity: layerOpacity }}
          initial={false}
          pointerEvents="none"
          style={groupStyle}
          transition={{
            scale: { type: "spring", stiffness: 400, damping: 25 },
            opacity: { duration: 0.15 },
          }}
        >
          <path d={bgPath} fill={ringCssVars.ringBackground} />
          {progressPath ? <path d={progressPath} fill={color} /> : null}
        </motion.g>
      </g>
    );
  }

  if (!expandComplete) {
    return (
      <g>
        {hitbox}
        <motion.g
          pointerEvents="none"
          style={{
            ...groupStyle,
            scale: enterScale,
            opacity: layerOpacity,
          }}
        >
          <path d={bgPath} fill={ringCssVars.ringBackground} />
        </motion.g>
      </g>
    );
  }

  return (
    <g>
      {hitbox}
      <motion.g
        animate={{ scale: hoverScale, opacity: layerOpacity }}
        initial={false}
        pointerEvents="none"
        style={groupStyle}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          opacity: { duration: 0.15 },
        }}
      >
        <path d={bgPath} fill={ringCssVars.ringBackground} />
        <RingProgressPath
          animatedProgressPath={animatedProgressPath}
          color={color}
          progressComplete={progressComplete}
          progressPath={progressPath}
        />
      </motion.g>
    </g>
  );
});

Ring.displayName = "Ring";

export default Ring;
