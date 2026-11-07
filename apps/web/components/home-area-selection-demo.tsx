"use client";

import {
  profitLossColor,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  useChart,
  useChartStable,
} from "@bklitui/ui/charts";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Homepage demo: a multiplayer-style cursor fades in over the area chart,
 * hovers (tooltip + crosshair), then presses and drags a segment selection.
 *
 * Each frame sends a synthetic mouse event to the chart's interaction layer
 * at the cursor's tip, so the tooltip and selection on screen are the chart's
 * real behaviour, not a mock-up. The cursor itself is an HTML layer in the
 * chart container, above the tooltip and date pill (both `z-50`).
 *
 * Loops while the chart is in view. Pauses while the pointer is over the
 * showcase card, so visitors can interact cleanly, and resumes when it leaves.
 * Skipped for reduced motion and for touch-first devices (there, selection is
 * a two-finger gesture).
 */

/** Cursor position as a fraction of the plot area (0–1, may overshoot). */
interface Point {
  x: number;
  y: number;
}

type Step =
  | {
      kind: "move";
      to: Point;
      ms: number;
      bend?: number;
      /** Fade in over the first `fadeMs` (1) or out over the last `fadeMs` (0). */
      fade?: { to: 0 | 1; ms: number };
    }
  | { kind: "wait"; ms: number }
  | { kind: "enter" | "press" | "release" | "leave" };

const START: Point = { x: 0.97, y: 0.9 };

/**
 * Glide in to the "Pricing change" marker (index 24 of 30, x ≈ 0.83), sweep
 * left so the tooltip tracks, then drag-select Jan 8 → Jan 18 (index 7 → 17
 * of 30, so x = 7/29 → 17/29) and drift off the bottom.
 */
const SCRIPT: Step[] = [
  { kind: "enter" },
  {
    kind: "move",
    to: { x: 0.83, y: 0.62 },
    ms: 900,
    bend: -0.05,
    fade: { to: 1, ms: 380 },
  },
  { kind: "wait", ms: 900 },
  { kind: "move", to: { x: 7 / 29, y: 0.66 }, ms: 1500, bend: 0.03 },
  { kind: "wait", ms: 350 },
  { kind: "press" },
  { kind: "wait", ms: 180 },
  { kind: "move", to: { x: 17 / 29, y: 0.56 }, ms: 1400, bend: -0.04 },
  { kind: "wait", ms: 1400 },
  { kind: "release" },
  { kind: "wait", ms: 350 },
  {
    kind: "move",
    to: { x: 0.63, y: 1.1 },
    ms: 700,
    fade: { to: 0, ms: 450 },
  },
  { kind: "leave" },
];

const START_DELAY_MS = 700;
/** Pause between loops. */
const LOOP_GAP_MS = 1600;
/** Fade-out when the demo is interrupted (card hover, scrolled away). */
const INTERRUPT_FADE_MS = 200;

/** Multiplayer-style cursor: arrowhead + name tag. */
const CURSOR_NAME = "Alex";
const CURSOR_COLOR = "#facc15";
const CURSOR_TEXT = "#1c1917";
/** Keeps the yellow readable on white: soft shadow + a hairline edge. */
const CURSOR_SHADOW =
  "drop-shadow(0 0 0.5px rgb(0 0 0 / 0.45)) drop-shadow(0 1px 2px rgb(0 0 0 / 0.3))";
const PRESS_SCALE = 0.86;
const PRESS_MS = 110;
const RING_MS = 420;
/** Longest frame step; a backgrounded tab pauses the script instead of skipping it. */
const MAX_FRAME_MS = 50;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 * 0.5;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

/** Quadratic curve from `a` to `b`, bowed sideways by `bend` (plot fraction). */
function curvePoint(a: Point, b: Point, bend: number, t: number): Point {
  const cx = (a.x + b.x) * 0.5 - (b.y - a.y) * bend * 4;
  const cy = (a.y + b.y) * 0.5 + (b.x - a.x) * bend * 4;
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
    y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
  };
}

// --- Timeline ---------------------------------------------------------------

/** One timed step, with the state it starts from. */
interface Segment {
  start: number;
  ms: number;
  step: Step;
  from: Point;
  opacity: number;
  pressed: boolean;
  inside: boolean;
}

interface Timeline {
  segments: Segment[];
  duration: number;
  pressAt: number;
  pressPoint: Point;
  releaseAt: number;
}

/** What the cursor and the chart should look like at one moment. */
interface Frame {
  pos: Point;
  opacity: number;
  pressed: boolean;
  /** The chart believes the pointer is over it. */
  inside: boolean;
  scale: number;
  /** Click ring progress 0–1, or null when hidden. */
  ring: number | null;
}

function compile(script: Step[]): Timeline {
  const segments: Segment[] = [];
  let t = 0;
  let pos = START;
  let opacity = 0;
  let pressed = false;
  let inside = false;
  let pressAt = Number.POSITIVE_INFINITY;
  let pressPoint = START;
  let releaseAt = Number.POSITIVE_INFINITY;

  for (const step of script) {
    if (!("ms" in step)) {
      if (step.kind === "press") {
        pressed = true;
        pressAt = t;
        pressPoint = pos;
      } else if (step.kind === "release") {
        pressed = false;
        releaseAt = t;
      } else {
        inside = step.kind === "enter";
      }
      continue;
    }
    segments.push({
      start: t,
      ms: step.ms,
      step,
      from: pos,
      opacity,
      pressed,
      inside,
    });
    t += step.ms;
    if (step.kind === "move") {
      pos = step.to;
      opacity = step.fade?.to ?? opacity;
    }
  }
  return { segments, duration: t, pressAt, pressPoint, releaseAt };
}

function pressScale(timeline: Timeline, t: number): number {
  if (t >= timeline.releaseAt) {
    const k = easeOutCubic(clamp01((t - timeline.releaseAt) / PRESS_MS));
    return PRESS_SCALE + (1 - PRESS_SCALE) * k;
  }
  if (t >= timeline.pressAt) {
    const k = easeOutCubic(clamp01((t - timeline.pressAt) / PRESS_MS));
    return 1 + (PRESS_SCALE - 1) * k;
  }
  return 1;
}

/** Opacity during a move that fades in at its start or out at its end. */
function fadeOpacity(segment: Segment, elapsed: number): number {
  const { step } = segment;
  if (step.kind !== "move" || !step.fade) {
    return segment.opacity;
  }
  const { to, ms } = step.fade;
  const k =
    to === 1
      ? easeOutCubic(clamp01(elapsed / ms))
      : easeInOutCubic(clamp01((elapsed - (step.ms - ms)) / ms));
  return segment.opacity + (to - segment.opacity) * k;
}

function sample(timeline: Timeline, t: number): Frame {
  const { segments } = timeline;
  const segment =
    segments.find((s) => t < s.start + s.ms) ?? (segments.at(-1) as Segment);
  const { step } = segment;
  const elapsed = Math.min(t - segment.start, segment.ms);
  const pos =
    step.kind === "move"
      ? curvePoint(
          segment.from,
          step.to,
          step.bend ?? 0,
          easeInOutCubic(elapsed / segment.ms)
        )
      : segment.from;

  const ringT = (t - timeline.pressAt) / RING_MS;
  return {
    pos,
    opacity: fadeOpacity(segment, elapsed),
    pressed: segment.pressed,
    inside: segment.inside,
    scale: pressScale(timeline, t),
    ring: ringT >= 0 && ringT < 1 ? ringT : null,
  };
}

const TIMELINE = compile(SCRIPT);

const IDLE: Frame = {
  pos: START,
  opacity: 0,
  pressed: false,
  inside: false,
  scale: 1,
  ring: null,
};

// --- Chart bridge -----------------------------------------------------------

interface Geometry {
  innerWidth: number;
  innerHeight: number;
  margin: { left: number; top: number };
}

/** Plot fraction → px in the chart container (= the svg's user space). */
function toContainer(g: Geometry, p: Point) {
  return {
    x: g.margin.left + p.x * g.innerWidth,
    y: g.margin.top + p.y * g.innerHeight,
  };
}

/** Sends mouse events to the chart's interaction layer, like a real pointer. */
function createPointerBridge(
  svg: SVGSVGElement,
  target: Element,
  geometry: () => Geometry
) {
  const fire = (type: string, init: MouseEventInit = {}) => {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
    );
  };

  const at = (type: string, p: Point) => {
    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return;
    }
    const local = toContainer(geometry(), p);
    const client = new DOMPoint(local.x, local.y).matrixTransform(ctm);
    fire(type, { clientX: client.x, clientY: client.y, view: window });
  };

  /** Fire the events that take the chart from `prev` to `next`. */
  const sync = (prev: Frame, next: Frame) => {
    if (next.pressed !== prev.pressed) {
      at(next.pressed ? "mousedown" : "mouseup", next.pos);
    }
    if (next.inside) {
      const moved =
        !prev.inside || next.pos.x !== prev.pos.x || next.pos.y !== prev.pos.y;
      if (moved) {
        at("mousemove", next.pos);
      }
    } else if (prev.inside) {
      // React derives onMouseLeave from mouseout; no relatedTarget = left the page.
      fire("mouseout", { relatedTarget: null });
    }
  };

  /** End any drag. With `leave`, also clear hover (the cursor walked away). */
  const reset = (state: Frame, leave: boolean) => {
    if (state.pressed) {
      fire("mouseup");
    }
    if (leave && state.inside) {
      fire("mouseout", { relatedTarget: null });
    }
  };

  return { sync, reset };
}

function canPlay() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// --- Component --------------------------------------------------------------

export function HomeAreaSelectionDemo() {
  const { innerWidth, innerHeight, margin, isLoaded, containerRef } =
    useChartStable();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Latest geometry for the running loop, without restarting it on resize.
  const geometryRef = useRef<Geometry>({ innerWidth, innerHeight, margin });
  geometryRef.current = { innerWidth, innerHeight, margin };

  useEffect(() => {
    setContainer(containerRef.current);
  }, [containerRef]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const arrow = arrowRef.current;
    const ring = ringRef.current;
    const svg = container?.querySelector("svg");
    // The chart's interaction <g> (handlers + margin transform) is the svg's
    // only <g> child; its first <rect> is the hit area pointers land on.
    const target = svg?.querySelector(":scope > g > rect");
    // Hovering anywhere on the showcase card pauses the demo.
    const hoverRoot =
      container?.closest<HTMLElement>('[data-slot="frame"]') ?? container;
    if (
      !(
        isLoaded &&
        cursor &&
        arrow &&
        ring &&
        svg &&
        target &&
        hoverRoot &&
        canPlay()
      )
    ) {
      return;
    }

    const bridge = createPointerBridge(svg, target, () => geometryRef.current);
    let frame = 0;
    let startTimer = 0;
    let state = IDLE;
    let shownOpacity = 0;
    let inView = false;
    let paused = hoverRoot.matches(":hover");

    const paint = (f: Frame) => {
      const g = geometryRef.current;
      const tip = toContainer(g, f.pos);
      cursor.style.transform = `translate3d(${tip.x}px, ${tip.y}px, 0)`;
      cursor.style.opacity = String(f.opacity);
      shownOpacity = f.opacity;
      arrow.style.transform = `scale(${f.scale})`;
      if (f.ring === null) {
        ring.style.opacity = "0";
        return;
      }
      const at = toContainer(g, TIMELINE.pressPoint);
      const r = 0.3 + 0.7 * easeOutCubic(f.ring);
      ring.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) translate(-50%, -50%) scale(${r})`;
      ring.style.opacity = String(0.7 * (1 - f.ring));
    };

    /** Fade the cursor out from wherever it is (no chart events). */
    const fadeOut = () => {
      const from = shownOpacity;
      ring.style.opacity = "0";
      if (from === 0) {
        return;
      }
      const begin = performance.now();
      const step = (now: number) => {
        const k = clamp01((now - begin) / INTERRUPT_FADE_MS);
        shownOpacity = from * (1 - easeOutCubic(k));
        cursor.style.opacity = String(shownOpacity);
        if (k < 1) {
          frame = requestAnimationFrame(step);
        }
      };
      frame = requestAnimationFrame(step);
    };

    const stop = (leave: boolean) => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(frame);
      bridge.reset(state, leave);
      state = IDLE;
      fadeOut();
    };

    const schedule = (delay: number) => {
      window.clearTimeout(startTimer);
      if (inView && !paused) {
        startTimer = window.setTimeout(play, delay);
      }
    };

    function play() {
      if (!inView || paused) {
        return;
      }
      cancelAnimationFrame(frame);
      let elapsed = 0;
      let last = performance.now();
      const tick = (now: number) => {
        elapsed += Math.min(now - last, MAX_FRAME_MS);
        last = now;
        const next = sample(TIMELINE, elapsed);
        bridge.sync(state, next);
        state = next;
        paint(next);
        if (elapsed < TIMELINE.duration) {
          frame = requestAnimationFrame(tick);
        } else {
          schedule(LOOP_GAP_MS);
        }
      };
      paint(IDLE);
      frame = requestAnimationFrame(tick);
    }

    // Pointer on the card: hand the chart to the visitor. Keep the chart's
    // hover only if their pointer is already on the plot.
    const onEnter = (event: PointerEvent) => {
      if (!event.isTrusted || event.pointerType === "touch") {
        return;
      }
      paused = true;
      stop(!svg.matches(":hover"));
    };
    const onLeave = (event: PointerEvent) => {
      if (!event.isTrusted) {
        return;
      }
      paused = false;
      schedule(START_DELAY_MS);
    };
    hoverRoot.addEventListener("pointerenter", onEnter);
    hoverRoot.addEventListener("pointerleave", onLeave);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting === true;
        stop(true);
        schedule(START_DELAY_MS);
      },
      { threshold: 0.6 }
    );
    observer.observe(svg);

    return () => {
      observer.disconnect();
      hoverRoot.removeEventListener("pointerenter", onEnter);
      hoverRoot.removeEventListener("pointerleave", onLeave);
      window.clearTimeout(startTimer);
      cancelAnimationFrame(frame);
      bridge.reset(state, true);
    };
  }, [isLoaded, container]);

  if (!container) {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[60] size-7 rounded-full border-2"
        ref={ringRef}
        style={{ borderColor: CURSOR_COLOR, opacity: 0 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[60] select-none"
        ref={cursorRef}
        style={{ opacity: 0, willChange: "transform, opacity" }}
      >
        {/* Arrowhead; its fill tip is the hotspot at (0, 0). */}
        <svg
          aria-hidden
          className="absolute top-0 left-0 overflow-visible"
          height={16}
          ref={arrowRef}
          style={{ filter: CURSOR_SHADOW, transformOrigin: "0 0" }}
          viewBox="0 0 16 16"
          width={16}
        >
          <path
            d="M0 0 L16 6.2 L8.8 8.8 L6.2 16 Z"
            fill={CURSOR_COLOR}
            paintOrder="stroke"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
        </svg>
        <span
          className="absolute top-[18px] left-[13px] whitespace-nowrap rounded-md px-2 py-[3px] font-semibold text-xs leading-4"
          style={{
            backgroundColor: CURSOR_COLOR,
            color: CURSOR_TEXT,
            filter: CURSOR_SHADOW,
          }}
        >
          {CURSOR_NAME}
        </span>
      </div>
    </>,
    container
  );
}

// Keep out of the series reveal clip (the cursor layer itself is a portal).
(HomeAreaSelectionDemo as unknown as Record<string, boolean>).__isPostOverlay =
  true;

const percentFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  signDisplay: "always",
  style: "percent",
});

/**
 * Change in `valueKey` across the dragged segment, or null when nothing is
 * selected. `color` is the theme's positive / negative trend colour.
 */
function useSegmentTrend(valueKey: string) {
  const { selection, data } = useChart();
  if (!selection?.active || selection.endX - selection.startX <= 5) {
    return null;
  }
  const start = data[Math.max(0, selection.startIndex)]?.[valueKey];
  const end = data[Math.min(data.length - 1, selection.endIndex)]?.[valueKey];
  if (typeof start !== "number" || typeof end !== "number" || start === 0) {
    return null;
  }
  const change = (end - start) / start;
  return { change, color: profitLossColor(change), selection };
}

/** Selected-range wash, tinted green (up) or red (down). */
export function TrendSegmentBackground({ valueKey }: { valueKey: string }) {
  const trend = useSegmentTrend(valueKey);
  return trend ? (
    <SegmentBackground
      fill={`color-mix(in oklch, ${trend.color} 14%, transparent)`}
    />
  ) : null;
}

/** Dashed start / end lines in the trend colour. */
export function TrendSegmentLines({ valueKey }: { valueKey: string }) {
  const trend = useSegmentTrend(valueKey);
  return trend ? (
    <>
      <SegmentLineFrom stroke={trend.color} />
      <SegmentLineTo stroke={trend.color} />
    </>
  ) : null;
}

/** % change across the dragged segment, pinned above it. */
export function SegmentChangeBadge({ valueKey }: { valueKey: string }) {
  const trend = useSegmentTrend(valueKey);
  if (!trend) {
    return null;
  }
  const { change, color, selection } = trend;
  const label = percentFormat.format(change);
  const width = label.length * 6.6 + 14;
  const centerX = (selection.startX + selection.endX) * 0.5;

  return (
    <g pointerEvents="none" transform={`translate(${centerX}, 10)`}>
      <rect fill={color} height={20} rx={4} width={width} x={-width * 0.5} />
      <text
        dominantBaseline="central"
        fill="#fff"
        fontSize={11}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
        textAnchor="middle"
        y={10}
      >
        {label}
      </text>
    </g>
  );
}

(SegmentChangeBadge as unknown as Record<string, boolean>).__isPostOverlay =
  true;
