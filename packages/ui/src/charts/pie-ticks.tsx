"use client";

import {
  animate,
  type MotionValue,
  motionValue,
  type Transition,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { arcPath } from "./arc-path";
import { usePieHover, usePieStable } from "./pie-context";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Writes a motion value to the DOM on every change — no React renders. */
function useMotionValueApply(
  value: MotionValue<number>,
  apply: (v: number) => void
) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useIsoLayoutEffect(() => {
    applyRef.current(value.get());
  });
  useMotionValueEvent(value, "change", (v) => applyRef.current(v));
}

/** Ticks that fade in at once behind the sweep's leading edge. */
const SWEEP_RAMP_TICKS = 4;

/** Default ring sweep: eases out so the last slices settle like a needle. */
export const DEFAULT_PIE_TICKS_SWEEP_TRANSITION: Transition = {
  duration: 1.4,
  ease: [0.32, 0.72, 0, 1],
};

const HOVER_SPRING = { stiffness: 420, damping: 32 } as const;

/** Tick hover: snap up fast… */
const TICK_ATTACK: Transition = { type: "spring", stiffness: 700, damping: 28 };
/** …and fall back slowly, so a sweeping pointer leaves a trail. */
const TICK_RELEASE: Transition = { duration: 0.75, ease: [0.22, 1, 0.36, 1] };
/** Lift for the hovered tick and its neighbours, by distance. */
const TICK_FALLOFF = [1, 0.45, 0.15] as const;
/** Hovered tick thickens by this fraction of its stroke width at full lift. */
const TICK_WIDEN = 0.6;

/**
 * - `"slice"`: hovering a slice extends all of its ticks.
 * - `"tick"`: the tick under the pointer grows on its own; the slice still
 *   drives the center readout and dims the rest.
 */
export type PieTicksHoverEffect = "slice" | "tick";

export interface PieTicksProps {
  /** Ticks around the full sweep, shared across slices. Default: 96 */
  count?: number;
  /** Tick stroke width in px. Default: 2.5 */
  strokeWidth?: number;
  /** Tick end caps. Default: "round" */
  lineCap?: "round" | "butt";
  /** Empty tick slots between slices. Default: 1 */
  sliceGap?: number;
  /** How far a hovered slice's ticks extend outward, in px. Defaults to PieChart's `hoverOffset` */
  hoverOffset?: number;
  /** What grows on hover — the whole slice or the single tick. Default: "slice" */
  hoverEffect?: PieTicksHoverEffect;
  /** Tick mode — how far the hovered tick shoots outward, in px. Default: 2.2 × `hoverOffset` */
  tickHoverOffset?: number;
  /** Opacity of the other slices while one is hovered. Default: 0.3 */
  fadedOpacity?: number;
  /**
   * Ring sweep on mount — ticks light one after another, like a gauge
   * filling. Defaults to PieChart's `enterTransition`, else an ease-out tween.
   */
  enterTransition?: Transition;
  /** Animate on mount. Default: true */
  animate?: boolean;
  className?: string;
}

interface Tick {
  /** Position in the whole ring — drives the sweep order */
  order: number;
  angle: number;
}

interface SliceTicks {
  index: number;
  ticks: Tick[];
  /** Angular width of one tick slot */
  step: number;
  startAngle: number;
  endAngle: number;
}

/**
 * Split `count` slots between slices by value (largest remainder), so the
 * ticks stay evenly spaced around the ring and every slice gets at least one.
 */
function allocateTicks(values: number[], count: number): number[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total <= 0) {
    return values.map(() => 0);
  }
  const exact = values.map((v) => (Math.max(0, v) / total) * count);
  const slots = exact.map((e, i) =>
    (values[i] ?? 0) > 0 ? Math.max(1, Math.floor(e)) : 0
  );
  let remaining = count - slots.reduce((sum, s) => sum + s, 0);
  const byRemainder = exact
    .map((e, i) => ({ i, r: e - Math.floor(e) }))
    .filter(({ i }) => (values[i] ?? 0) > 0)
    .sort((a, b) => b.r - a.r);
  for (let k = 0; remaining > 0 && byRemainder.length > 0; k++) {
    const slot = byRemainder[k % byRemainder.length];
    if (slot) {
      slots[slot.i] = (slots[slot.i] ?? 0) + 1;
    }
    remaining--;
  }
  return slots;
}

function polar(angle: number, radius: number) {
  // d3-shape convention: 0 rad at 12 o'clock, clockwise.
  return { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
}

interface PieTickSliceProps {
  slice: SliceTicks;
  color: string;
  innerRadius: number;
  outerRadius: number;
  hoverOffset: number;
  tickReach: number;
  strokeWidth: number;
  lineCap: "round" | "butt";
  opacity: number;
  isHovered: boolean;
  hoverEffect: PieTicksHoverEffect;
  sweep: MotionValue<number>;
  onHover: (index: number | null) => void;
}

const PieTickSlice = memo(function PieTickSlice({
  slice,
  color,
  innerRadius,
  outerRadius,
  hoverOffset,
  tickReach,
  strokeWidth,
  lineCap,
  opacity,
  isHovered,
  hoverEffect,
  sweep,
  onHover,
}: PieTickSliceProps) {
  const refs = useRef<(SVGLineElement | null)[]>([]);
  const grow = useSpring(0, HOVER_SPRING);
  const tickMode = hoverEffect === "tick";
  // Per-tick grow values (tick mode). Plain motion values so the count can
  // follow the data without breaking hook order.
  const tickGrow = useRef<MotionValue<number>[]>([]);
  const tickGrowAt = (k: number) => {
    let mv = tickGrow.current[k];
    if (!mv) {
      mv = motionValue(0);
      tickGrow.current[k] = mv;
    }
    return mv;
  };

  useEffect(() => {
    grow.set(isHovered && !tickMode ? 1 : 0);
  }, [grow, isHovered, tickMode]);

  const depth = outerRadius - innerRadius;
  const applyTick = (k: number) => {
    const el = refs.current[k];
    const tick = slice.ticks[k];
    if (!(el && tick)) {
      return;
    }
    const t = clamp01((sweep.get() - tick.order) / SWEEP_RAMP_TICKS);
    const tickLift = tickGrow.current[k]?.get() ?? 0;
    const reach = grow.get() * hoverOffset + tickLift * tickReach;
    const end = polar(tick.angle, innerRadius + (depth + reach) * t);
    el.setAttribute("x2", String(end.x));
    el.setAttribute("y2", String(end.y));
    el.setAttribute("stroke-opacity", String(t));
    el.setAttribute(
      "stroke-width",
      String(strokeWidth * (1 + TICK_WIDEN * tickLift))
    );
  };
  // One write pass per frame for this slice — no React renders while sweeping.
  const apply = () => {
    for (let k = 0; k < slice.ticks.length; k++) {
      applyTick(k);
    }
  };
  useMotionValueApply(sweep, apply);
  useMotionValueApply(grow, apply);

  const applyTickRef = useRef(applyTick);
  applyTickRef.current = applyTick;
  useEffect(() => {
    if (!tickMode) {
      return;
    }
    const unsubscribers = slice.ticks.map((_, k) =>
      tickGrowAt(k).on("change", () => applyTickRef.current(k))
    );
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [tickMode, slice.ticks]);

  const setTickHover = (k: number, hovered: boolean) => {
    const reachTicks = TICK_FALLOFF.length - 1;
    for (let d = -reachTicks; d <= reachTicks; d++) {
      const j = k + d;
      if (j < 0 || j >= slice.ticks.length) {
        continue;
      }
      const mv = tickGrowAt(j);
      if (!hovered) {
        animate(mv, 0, TICK_RELEASE);
        continue;
      }
      const target = TICK_FALLOFF[Math.abs(d)] ?? 0;
      // Never pull a tick down that is still decaying from a higher lift.
      if (mv.get() < target) {
        animate(mv, target, TICK_ATTACK);
      }
    }
  };

  const hitOuter =
    outerRadius + Math.max(hoverOffset, tickMode ? tickReach : 0);
  const hitPath = arcPath(
    Math.max(0, innerRadius - strokeWidth),
    hitOuter,
    slice.startAngle,
    slice.endAngle
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: SVG hover target for the slice
    <g
      onMouseEnter={() => onHover(slice.index)}
      onMouseLeave={() => onHover(null)}
      style={{
        cursor: "pointer",
        opacity,
        transition: "opacity 150ms ease-out",
      }}
    >
      <path d={hitPath} fill="transparent" />
      {tickMode
        ? slice.ticks.map((tick, k) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: SVG hover hitbox for one tick
            <path
              d={arcPath(
                Math.max(0, innerRadius - strokeWidth),
                hitOuter,
                tick.angle - slice.step / 2,
                tick.angle + slice.step / 2
              )}
              fill="transparent"
              key={`hit-${tick.order}`}
              onMouseEnter={() => setTickHover(k, true)}
              onMouseLeave={() => setTickHover(k, false)}
            />
          ))
        : null}
      {slice.ticks.map((tick, k) => {
        const start = polar(tick.angle, innerRadius);
        // First paint matches the sweep so SSR / instant mode never flashes.
        const t0 = clamp01((sweep.get() - tick.order) / SWEEP_RAMP_TICKS);
        const end = polar(tick.angle, innerRadius + depth * t0);
        return (
          <line
            key={tick.order}
            pointerEvents="none"
            ref={(el) => {
              refs.current[k] = el;
            }}
            stroke={color}
            strokeLinecap={lineCap}
            strokeOpacity={t0}
            strokeWidth={strokeWidth}
            x1={start.x}
            x2={end.x}
            y1={start.y}
            y2={end.y}
          />
        );
      })}
    </g>
  );
});

/**
 * Draws a PieChart as a ring of radial ticks. Each slice owns a share of the
 * ticks; on mount they light up one after another around the ring like a
 * gauge filling, and hovering a slice extends its ticks and dims the rest.
 *
 * Use inside `<PieChart innerRadius={…}>` in place of `<PieSlice>`. Pair with
 * `<PieCenter valueDisplay="percent" />` for a gauge-style readout.
 */
export function PieTicks({
  count = 96,
  strokeWidth = 2.5,
  lineCap = "round",
  sliceGap = 1,
  hoverOffset: hoverOffsetProp,
  hoverEffect = "slice",
  tickHoverOffset,
  fadedOpacity = 0.3,
  enterTransition: enterTransitionProp,
  animate: animateOnMount = true,
  className,
}: PieTicksProps) {
  const {
    arcs,
    data,
    innerRadius: pieInnerRadius,
    outerRadius: pieOuterRadius,
    hoverOffset: pieHoverOffset,
    enterTransition: pieEnterTransition,
    enterStaggerScale,
    animationKey,
    geometryScrubbing,
    getColor,
  } = usePieStable();
  const { hoveredIndex, setHoveredIndex } = usePieHover();
  const prefersReducedMotion = useReducedMotion();

  const hoverOffset = hoverOffsetProp ?? pieHoverOffset;
  // Hovered ticks grow into the hover padding PieChart reserves.
  const outerRadius = pieOuterRadius;
  const innerRadius =
    pieInnerRadius > 0 ? pieInnerRadius : pieOuterRadius * 0.72;

  const slices = useMemo((): SliceTicks[] => {
    const first = arcs[0];
    const last = arcs.at(-1);
    if (!(first && last) || count < 1) {
      return [];
    }
    const sweepStart = Math.min(first.startAngle, last.endAngle);
    const sweepSpan = Math.abs(last.endAngle - first.startAngle);
    const direction = last.endAngle >= first.startAngle ? 1 : -1;
    const step = sweepSpan / count;
    const slots = allocateTicks(
      data.map((d) => d.value),
      Math.round(count)
    );
    const base = direction === 1 ? first.startAngle : sweepStart + sweepSpan;

    let cursor = 0;
    return arcs.map((_, index) => {
      const n = slots[index] ?? 0;
      const gap = n > sliceGap ? sliceGap : 0;
      const ticks: Tick[] = [];
      for (let k = 0; k < n - gap; k++) {
        const order = cursor + k;
        ticks.push({ order, angle: base + direction * (order + 0.5) * step });
      }
      const sliceStart = base + direction * cursor * step;
      cursor += n;
      const sliceEnd = base + direction * cursor * step;
      return {
        index,
        ticks,
        step,
        startAngle: Math.min(sliceStart, sliceEnd),
        endAngle: Math.max(sliceStart, sliceEnd),
      };
    });
  }, [arcs, data, count, sliceGap]);

  const sweepEnd = count + SWEEP_RAMP_TICKS;
  const instant =
    !animateOnMount || Boolean(prefersReducedMotion) || geometryScrubbing;
  const sweep = useMotionValue(instant ? sweepEnd : 0);
  const transition =
    enterTransitionProp ??
    pieEnterTransition ??
    DEFAULT_PIE_TICKS_SWEEP_TRANSITION;
  const transitionKey = JSON.stringify(transition);
  const transitionRef = useRef(transition);
  transitionRef.current = transition;

  useEffect(() => {
    if (instant) {
      sweep.jump(sweepEnd);
      return;
    }
    sweep.jump(0);
    const controls = animate(sweep, sweepEnd, {
      ...transitionRef.current,
      delay: 0.1 * enterStaggerScale,
    });
    return () => controls.stop();
  }, [
    instant,
    sweep,
    sweepEnd,
    transitionKey,
    enterStaggerScale,
    animationKey,
  ]);

  const activeIndex = geometryScrubbing ? null : hoveredIndex;

  return (
    <g className={className}>
      {slices.map((slice) => (
        <PieTickSlice
          color={getColor(slice.index)}
          hoverEffect={hoverEffect}
          hoverOffset={hoverOffset}
          innerRadius={innerRadius}
          isHovered={activeIndex === slice.index}
          key={data[slice.index]?.label ?? slice.index}
          lineCap={lineCap}
          onHover={setHoveredIndex}
          opacity={
            activeIndex === null || activeIndex === slice.index
              ? 1
              : fadedOpacity
          }
          outerRadius={outerRadius}
          slice={slice}
          strokeWidth={strokeWidth}
          sweep={sweep}
          tickReach={tickHoverOffset ?? hoverOffset * 2.2}
        />
      ))}
    </g>
  );
}

PieTicks.displayName = "PieTicks";

export default PieTicks;
