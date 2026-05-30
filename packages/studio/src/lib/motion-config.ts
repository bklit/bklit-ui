import type { Transition } from "motion/react";
import type { StudioUrlState } from "./studio-parsers";

export const MOTION_TYPES = ["spring", "ease"] as const;
export type MotionType = (typeof MOTION_TYPES)[number];

export const MOTION_EASE_IDS = [
  "easeOut",
  "easeInOut",
  "snappy",
  "smooth",
  "custom",
] as const;
export type MotionEaseId = (typeof MOTION_EASE_IDS)[number];

export const MOTION_EASE_PRESETS: Record<
  Exclude<MotionEaseId, "custom">,
  { label: string; bezier: [number, number, number, number] }
> = {
  easeOut: { label: "Ease out", bezier: [0.25, 0.1, 0.25, 1] },
  easeInOut: { label: "Ease in-out", bezier: [0.65, 0, 0.35, 1] },
  snappy: { label: "Snappy", bezier: [0.85, 0, 0.15, 1] },
  smooth: { label: "Smooth", bezier: [0.4, 0, 0.2, 1] },
};

export const DEFAULT_MOTION_BEZIER: [number, number, number, number] = [
  0.85, 0, 0.15, 1,
];

/** Default motion panel values — original line chart reveal (ease, 1.1s, snappy curve). */
export const DEFAULT_STUDIO_MOTION = {
  motionType: "ease" as const,
  motionDuration: 1.1,
  motionBounce: 0.6,
  motionEase: "snappy" as const,
  motionBezier: "0.85, 0, 0.15, 1",
  motionStaggerScale: 1,
  animationDuration: 1100,
};

export function resetStudioMotionKeys(): Array<
  keyof Pick<
    StudioUrlState,
    | "motionType"
    | "motionDuration"
    | "motionBounce"
    | "motionEase"
    | "motionBezier"
    | "motionStaggerScale"
    | "animationDuration"
  >
> {
  return [
    "motionType",
    "motionDuration",
    "motionBounce",
    "motionEase",
    "motionBezier",
    "motionStaggerScale",
    "animationDuration",
  ];
}

export const DEFAULT_NOTCH_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

/** Reference duration used for gauge notch stagger scaling. */
export const MOTION_STAGGER_REFERENCE_DURATION =
  DEFAULT_STUDIO_MOTION.motionDuration;

export type MotionStateSlice = Pick<
  StudioUrlState,
  | "motionType"
  | "motionDuration"
  | "motionBounce"
  | "motionEase"
  | "motionBezier"
>;

export function clampMotionDuration(seconds: number): number {
  return Math.min(2, Math.max(0.2, seconds));
}

export function clampMotionBounce(bounce: number): number {
  return Math.min(1, Math.max(0, bounce));
}

const CUBIC_BEZIER_PREFIX_RE = /^cubic-bezier\s*\(\s*/i;
const CUBIC_BEZIER_SUFFIX_RE = /\)\s*$/;
const BEZIER_PARTS_SPLIT_RE = /[\s,]+/;

/** Parse `cubic-bezier(0.85, 0, 0.15, 1)` or `0.85, 0, 0.15, 1` (controls may be outside 0–1). */
export function parseMotionBezier(
  input: string
): [number, number, number, number] | null {
  const trimmed = input
    .trim()
    .replace(CUBIC_BEZIER_PREFIX_RE, "")
    .replace(CUBIC_BEZIER_SUFFIX_RE, "");
  const parts = trimmed
    .split(BEZIER_PARTS_SPLIT_RE)
    .map((p) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return null;
  }
  return parts as [number, number, number, number];
}

/** Editor drag limits — allows overshoot but keeps handles recoverable. */
export const EASE_EDITOR_CONTROL_MIN = -1.25;
export const EASE_EDITOR_CONTROL_MAX = 2.25;
export const EASE_HANDLE_MARGIN = 6;

export function clampEaseBezierControl(
  bezier: [number, number, number, number]
): [number, number, number, number] {
  const clamp = (n: number) =>
    Math.min(EASE_EDITOR_CONTROL_MAX, Math.max(EASE_EDITOR_CONTROL_MIN, n));
  return [
    clamp(bezier[0]),
    clamp(bezier[1]),
    clamp(bezier[2]),
    clamp(bezier[3]),
  ];
}

/** Clamp handle visuals inside the chart so they stay grabbable when values overshoot. */
export function easeHandleSvgPosition(
  bx: number,
  by: number,
  width: number,
  height: number,
  padding = 8,
  margin = EASE_HANDLE_MARGIN
) {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const rawX = padding + bx * innerW;
  const rawY = padding + innerH - by * innerH;
  const minX = padding + margin;
  const maxX = width - padding - margin;
  const minY = padding + margin;
  const maxY = height - padding - margin;
  const x = Math.min(maxX, Math.max(minX, rawX));
  const y = Math.min(maxY, Math.max(minY, rawY));
  return {
    x,
    y,
    clamped: x !== rawX || y !== rawY,
  };
}

/** Map SVG point → cubic-bezier control (x1, y1) or (x2, y2); unclamped for overshoot. */
export function bezierFromSvgPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  padding = 8
): [number, number] {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return [(x - padding) / innerW, 1 - (y - padding) / innerH];
}

export function formatMotionBezier(
  bezier: [number, number, number, number]
): string {
  return bezier.map((n) => Number(n.toFixed(3)).toString()).join(", ");
}

export function getMotionBezier(
  state: MotionStateSlice
): [number, number, number, number] {
  if (state.motionEase === "custom") {
    return parseMotionBezier(state.motionBezier) ?? DEFAULT_MOTION_BEZIER;
  }
  return MOTION_EASE_PRESETS[state.motionEase].bezier;
}

export function motionSignature(state: MotionStateSlice): string {
  const duration = clampMotionDuration(state.motionDuration).toFixed(2);
  const bounce = clampMotionBounce(state.motionBounce).toFixed(2);
  if (state.motionType === "spring") {
    return `s-${duration}-${bounce}`;
  }
  const bezier = getMotionBezier(state)
    .map((n) => n.toFixed(2))
    .join("-");
  return `e-${duration}-${state.motionEase}-${bezier}`;
}

export function studioMotionToTransition(
  state: MotionStateSlice,
  options?: { linear?: boolean }
): Transition {
  const duration = clampMotionDuration(state.motionDuration);

  if (options?.linear) {
    return {
      type: "tween",
      duration,
      ease: "linear",
    };
  }

  if (state.motionType === "ease") {
    return {
      type: "tween",
      duration,
      ease: getMotionBezier(state),
    };
  }

  return {
    type: "spring",
    duration,
    bounce: clampMotionBounce(state.motionBounce),
  };
}

/** Stagger multiplier for gauge notch delays vs reference duration. */
export function motionStaggerScale(state: MotionStateSlice): number {
  return (
    clampMotionDuration(state.motionDuration) /
    MOTION_STAGGER_REFERENCE_DURATION
  );
}

/** Evaluate cubic-bezier easing at normalized time `t` (0–1). */
export function cubicBezierEase(
  t: number,
  [x1, y1, x2, y2]: [number, number, number, number]
): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }

  const sampleCurveX = (u: number) =>
    3 * x1 * u * (1 - u) * (1 - u) + 3 * x2 * u * u * (1 - u) + u * u * u;
  const sampleCurveY = (u: number) =>
    3 * y1 * u * (1 - u) * (1 - u) + 3 * y2 * u * u * (1 - u) + u * u * u;

  let start = 0;
  let end = 1;
  for (let i = 0; i < 14; i++) {
    const mid = (start + end) / 2;
    if (sampleCurveX(mid) < t) {
      start = mid;
    } else {
      end = mid;
    }
  }
  return sampleCurveY((start + end) / 2);
}

export const MOTION_CURVE_STEPS = 120;

/** Interpolate two sampled curves (equal length). */
export function lerpCurvePoints(
  from: { t: number; y: number }[],
  to: { t: number; y: number }[],
  progress: number
): { t: number; y: number }[] {
  const t = Math.min(1, Math.max(0, progress));
  return from.map((p, i) => {
    const q = to[i] ?? p;
    return {
      t: p.t + (q.t - p.t) * t,
      y: p.y + (q.y - p.y) * t,
    };
  });
}

/** Target curve for the motion preview (sync, immediate). */
export function targetMotionCurvePoints(
  state: MotionStateSlice,
  bezier?: [number, number, number, number]
): { t: number; y: number }[] {
  if (state.motionType === "ease") {
    const b = bezier ?? getMotionBezier(state);
    return sampleBezierCurve(b, MOTION_CURVE_STEPS);
  }
  return sampleMotionCurve(state, MOTION_CURVE_STEPS);
}

/** Sample a cubic-bezier easing curve (0→1 progress). */
export function sampleBezierCurve(
  bezier: [number, number, number, number],
  steps = 120
): { t: number; y: number }[] {
  const points: { t: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({ t, y: cubicBezierEase(t, bezier) });
  }
  return points;
}

/** Sample easing curve for preview (ease = exact bezier; spring = physics approx). */
export function sampleMotionCurve(
  state: MotionStateSlice,
  steps = 120
): { t: number; y: number }[] {
  const duration = clampMotionDuration(state.motionDuration);
  const points: { t: number; y: number }[] = [];

  if (state.motionType === "ease") {
    const bezier = getMotionBezier(state);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({ t, y: cubicBezierEase(t, bezier) });
    }
    return points;
  }

  const bounce = clampMotionBounce(state.motionBounce);
  const mass = 1;
  const angularFreq = (2 * Math.PI) / duration;
  const stiffness = angularFreq * angularFreq * mass;
  const dampingRatio = Math.max(0.05, 0.2 + (1 - bounce) * 0.75);
  const damping = 2 * dampingRatio * Math.sqrt(stiffness * mass);

  let position = 0;
  let velocity = 0;
  const dt = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({ t, y: position });
    const springForce = -stiffness * (position - 1);
    const dampForce = -damping * velocity;
    const acceleration = (springForce + dampForce) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
  }

  return points;
}

/** Resample recorded `{ time, y }` to uniform `t` in [0, 1]. */
export function resampleMotionRecordings(
  recordings: { time: number; y: number }[],
  steps: number
): { t: number; y: number }[] {
  if (recordings.length === 0) {
    return [{ t: 0, y: 0 }];
  }
  const maxTime = Math.max(...recordings.map((r) => r.time), 0.001);
  const points: { t: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const target = t * maxTime;
    let y = recordings[0]?.y ?? 0;
    for (let j = 1; j < recordings.length; j++) {
      const prev = recordings[j - 1];
      const next = recordings[j];
      if (next && target >= (prev?.time ?? 0) && target <= next.time) {
        const span = next.time - (prev?.time ?? 0) || 1;
        const ratio = (target - (prev?.time ?? 0)) / span;
        y = (prev?.y ?? 0) + ((next.y ?? 0) - (prev?.y ?? 0)) * ratio;
        break;
      }
      if (next && target > next.time) {
        y = next.y;
      }
    }
    points.push({ t, y });
  }
  return points;
}

export function motionCurveBounds(points: { t: number; y: number }[]) {
  const yMin = Math.min(0, ...points.map((p) => p.y));
  const yMax = Math.max(1.12, ...points.map((p) => p.y));
  return { yMin, yMax, yRange: yMax - yMin || 1 };
}

export function motionCurveToSvg(
  points: { t: number; y: number }[],
  width: number,
  height: number,
  padding = 8
) {
  const { yMin, yMax, yRange } = motionCurveBounds(points);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const toSvg = (t: number, y: number) => ({
    x: padding + t * innerW,
    y: padding + innerH - ((y - yMin) / yRange) * innerH,
  });

  const path = points
    .map((p, i) => {
      const { x, y } = toSvg(p.t, p.y);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const targetY = toSvg(1, 1).y;
  const baselineY = toSvg(0, 0).y;

  return {
    path,
    targetY,
    baselineY,
    toSvg,
    padding,
    innerW,
    innerH,
    yMin,
    yMax,
  };
}

/** Progress `t` (0–1) → point on sampled curve. */
export function pointOnMotionCurve(
  points: { t: number; y: number }[],
  t: number,
  width: number,
  height: number,
  padding = 8
) {
  const clamped = Math.min(1, Math.max(0, t));
  let y = points[0]?.y ?? 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    if (prev && next && clamped >= prev.t && clamped <= next.t) {
      const span = next.t - prev.t || 1;
      const ratio = (clamped - prev.t) / span;
      y = prev.y + (next.y - prev.y) * ratio;
      break;
    }
  }
  if (clamped >= (points.at(-1)?.t ?? 1)) {
    y = points.at(-1)?.y ?? 1;
  }
  const { toSvg } = motionCurveToSvg(points, width, height, padding);
  return toSvg(clamped, y);
}

/** Bezier control polygon + curve path for ease editor. */
export function easeEditorGeometry(
  bezier: [number, number, number, number],
  width: number,
  height: number,
  padding = 8
) {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const toSvg = (bx: number, by: number) => ({
    x: padding + bx * innerW,
    y: padding + innerH - by * innerH,
  });

  const p0 = toSvg(0, 0);
  const p1 = easeHandleSvgPosition(
    bezier[0],
    bezier[1],
    width,
    height,
    padding
  );
  const p2 = easeHandleSvgPosition(
    bezier[2],
    bezier[3],
    width,
    height,
    padding
  );
  const p3 = toSvg(1, 1);

  const samples: { t: number; y: number }[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    samples.push({ t, y: cubicBezierEase(t, bezier) });
  }
  const { path } = motionCurveToSvg(samples, width, height, padding);

  const handlePathStart = `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
  const handlePathEnd = `M ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`;

  return {
    p0,
    p1,
    p2,
    p3,
    path,
    handlePathStart,
    handlePathEnd,
    toSvg,
    innerW,
    innerH,
    padding,
  };
}
