import type { Transition } from "motion/react";
import {
  clampMotionDuration,
  getMotionBezier,
  type MotionStateSlice,
  motionSignature,
  motionStaggerScale,
  studioMotionToTransition,
} from "./motion-config";
import type { StudioRenderContext } from "./render-context";
import type { StudioUrlState } from "./studio-parsers";

export type MotionPanelKind =
  | "gauge"
  | "css-reveal"
  | "motion-enter"
  | "motion-stagger";

export function motionSliceFromState(state: StudioUrlState): MotionStateSlice {
  return {
    motionType: state.motionType,
    motionDuration: state.motionDuration,
    motionBounce: state.motionBounce,
    motionEase: state.motionEase,
    motionBezier: state.motionBezier,
  };
}

/** Ms duration for CSS clip-reveal charts (synced from motion panel). */
export function motionDurationToAnimationMs(seconds: number): number {
  return Math.round(clampMotionDuration(seconds) * 1000);
}

export function studioAnimationDurationMs(
  state: Pick<StudioUrlState, "motionDuration">
): number {
  return motionDurationToAnimationMs(state.motionDuration);
}

export function studioAnimationEasingCss(state: MotionStateSlice): string {
  const [x1, y1, x2, y2] = getMotionBezier(state);
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}

export function studioEnterStaggerScale(state: StudioUrlState): number {
  return motionStaggerScale(state) * state.motionStaggerScale;
}

export function getStudioCssRevealProps(
  state: StudioUrlState,
  options?: { revealFrom?: StudioUrlState; linear?: boolean }
) {
  const motion = motionSliceFromState(state);
  const revealMotion = options?.revealFrom
    ? motionSliceFromState(options.revealFrom)
    : motion;
  const linear = options?.linear ?? false;
  return {
    animationDuration: studioAnimationDurationMs(state),
    animationEasing: linear ? "linear" : studioAnimationEasingCss(motion),
    enterTransition: studioMotionToTransition(motion, { linear }),
    revealSignature: motionSignature(revealMotion),
  };
}

/** CSS reveal props for studio preview (live easing, stable reveal while dragging handles). */
export function getStudioCssRevealPropsForPreview(
  displayState: StudioUrlState,
  ctx: Pick<
    StudioRenderContext,
    "motionCurveDragging" | "committedState" | "isRecording"
  >
) {
  return getStudioCssRevealProps(displayState, {
    revealFrom: ctx.motionCurveDragging ? ctx.committedState : undefined,
    linear: ctx.isRecording,
  });
}

/** Chart remount key: manual replay + debounced motion signature. */
export function studioPreviewChartKey(ctx: StudioRenderContext): string {
  return `${ctx.animationKey}-${ctx.motionRemountKey}`;
}

/** Motion enter props for charts with spring/tween slice enter (gauge, pie, ring, funnel). */
export function getStudioMotionEnterProps(
  state: StudioUrlState,
  options?: { linear?: boolean }
): {
  enterTransition: Transition;
  enterStaggerScale: number;
} {
  return {
    enterTransition: studioMotionToTransition(motionSliceFromState(state), {
      linear: options?.linear,
    }),
    enterStaggerScale: studioEnterStaggerScale(state),
  };
}
