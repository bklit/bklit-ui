import type { Transition } from "motion/react";
import {
  getMotionBezier,
  type MotionStateSlice,
  studioMotionToTransition,
} from "./motion-config";

function formatTransitionObject(transition: Transition): string {
  if (transition.type === "spring") {
    const parts = ['type: "spring"', `duration: ${transition.duration ?? 0.8}`];
    if (transition.bounce != null) {
      parts.push(`bounce: ${transition.bounce}`);
    }
    if (transition.stiffness != null) {
      parts.push(`stiffness: ${transition.stiffness}`);
    }
    if (transition.damping != null) {
      parts.push(`damping: ${transition.damping}`);
    }
    return `{ ${parts.join(", ")} }`;
  }

  if (transition.type === "tween") {
    const ease = transition.ease;
    if (Array.isArray(ease)) {
      return `{ type: "tween", duration: ${transition.duration ?? 0.8}, ease: [${ease.join(", ")}] }`;
    }
    return `{ type: "tween", duration: ${transition.duration ?? 0.8}, ease: "${ease}" }`;
  }

  return JSON.stringify(transition);
}

export function motionTransitionCodegen(state: MotionStateSlice): string {
  return formatTransitionObject(studioMotionToTransition(state));
}

export function motionEnterPropsCodegen(
  state: MotionStateSlice,
  staggerScale: number
): string {
  const transition = motionTransitionCodegen(state);
  return `enterTransition={${transition}}\n  enterStaggerScale={${staggerScale.toFixed(2)}}`;
}

export function cssRevealAnimationCodegen(
  durationMs: number,
  state: MotionStateSlice
): string {
  const bezier = getMotionBezier(state)
    .map((n) => Number(n.toFixed(3)))
    .join(", ");
  return `animationDuration={${durationMs}}\n  animationEasing="cubic-bezier(${bezier})"`;
}
