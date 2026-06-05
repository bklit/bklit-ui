"use client";

import type { Transition } from "motion/react";
import { motion } from "motion/react";
import { clipRevealTransition } from "./animation";

export interface ChartRevealClipProps {
  clipPathId: string;
  height: number;
  targetWidth: number;
  enterTransition?: Transition;
  /** Bumps when motion settings change to replay the reveal. */
  revealEpoch: number;
  /** Extra inset around the clip rect so edge glyphs are not cut off. */
  padding?: number;
  /** When false, clip stays at full width (no grow animation). */
  animating?: boolean;
}

/**
 * Left-to-right clip reveal for cartesian series.
 * Grows clip rect width from 0 → full (true LTR; scaleX is avoided — it reveals from center).
 */
export function ChartRevealClip({
  clipPathId,
  height,
  targetWidth,
  enterTransition,
  revealEpoch,
  padding = 0,
  animating = true,
}: ChartRevealClipProps) {
  const transition = clipRevealTransition(enterTransition);
  const paddedWidth = Math.max(0, targetWidth + padding * 2);
  const paddedHeight = height + padding * 2;

  if (!animating) {
    return (
      <clipPath id={clipPathId}>
        <rect
          height={paddedHeight}
          width={paddedWidth}
          x={-padding}
          y={-padding}
        />
      </clipPath>
    );
  }

  return (
    <clipPath id={clipPathId}>
      <motion.rect
        animate={{ width: paddedWidth }}
        height={paddedHeight}
        initial={{ width: 0 }}
        key={`reveal-${revealEpoch}`}
        transition={transition}
        width={paddedWidth}
        x={-padding}
        y={-padding}
      />
    </clipPath>
  );
}
