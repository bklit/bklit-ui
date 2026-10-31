import { delay, nextFrame } from "./settle";

/**
 * Scripted interactions for the baselines: an ordered list of steps (drag,
 * click, double-click, wheel, trackpad pinch, button by accessible name,
 * frame resize, settle). After every step the capture waits for the chart to
 * settle and snapshots geometry + HTML text + callback output.
 *
 * Events are synthetic but follow a real mouse: hover moves go to the
 * element under the pointer (`elementFromPoint`, so overlays and handles get
 * them exactly as they would), with over/out pairs when that element
 * changes. Every `pointer*` event (pointerId 1, isPrimary, buttons,
 * clientX/Y) is followed by the matching `mouse*` event on the same element;
 * both bubble to `window`. A press goes to the element under the point and
 * that element receives every later move and the up (implicit capture), one
 * move per animation frame (the visx brush debounces window moves by 1 ms). Coordinates are resolved from layout, never from
 * implementation details: a target element (an SVG inset by the chart's
 * margins, a button, the frame) plus a fraction of its box and/or a px offset.
 *
 * Pinch: two-finger touch pinch is NOT scripted. `@use-gesture` (behind
 * `@visx/zoom`) only binds pointer pinch on touch screens, decided once at
 * module load, so synthetic touch pointers on a desktop Chromium are never
 * seen. `pinch` here is the trackpad pinch (`wheel` + `ctrlKey`), which is
 * what desktop browsers send; test touch pinch by hand on a device.
 */

/** Resolves the element whose box a point is relative to (`null`: frame). */
export type InteractionTarget = (root: Element) => Element | null;

export interface InteractionPoint {
  /** Default: the frame. */
  target?: InteractionTarget;
  /** Fraction of the target box (default 0.5). */
  fx?: number;
  fy?: number;
  /** Extra px offset. */
  dx?: number;
  dy?: number;
}

interface StepBase {
  /** Unique within the script; stored as `ix-<id>`. */
  id: string;
  label: string;
}

export type InteractionStep = StepBase &
  (
    | {
        /** Pointer down at `from`, `moves` moves (one per frame), up at `to`. */
        kind: "drag";
        from: InteractionPoint;
        to: InteractionPoint;
        moves?: number;
      }
    | { kind: "click" | "dblclick"; at: InteractionPoint }
    | {
        /** One wheel event (`deltaY` < 0 zooms in). `ctrlKey` → pinch. */
        kind: "wheel";
        at: InteractionPoint;
        deltaY: number;
      }
    | {
        /** Trackpad pinch: a `wheel` with `ctrlKey`. */
        kind: "pinch";
        at: InteractionPoint;
        direction: "in" | "out";
      }
    | {
        /** Clicks the button whose accessible name is `name`. */
        kind: "button";
        name: string;
      }
    | {
        /**
         * Resizes the frame (window-resize stand-in: the charts measure their
         * parent). Omit both to restore the original size.
         */
        kind: "resize";
        width?: number;
        height?: number;
      }
    | {
        /** Nothing: just settle (and snapshot) again, after `ms`. */
        kind: "settle";
        ms?: number;
      }
  );

export type InteractionScript = readonly InteractionStep[];

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

/** The frame itself. */
export const frameTarget: InteractionTarget = (root) => root;

/** Top-level `<svg>`s at least this big (skips icons in legends / buttons). */
function chartSvgs(root: Element): SVGSVGElement[] {
  return [...root.querySelectorAll("svg")].filter((svg) => {
    if (svg.parentElement?.closest("svg")) {
      return false;
    }
    const rect = svg.getBoundingClientRect();
    return rect.width >= 64 && rect.height >= 32;
  });
}

/**
 * Chart svgs ordered top to bottom (stable for equal tops), so "the strip
 * below the chart" is `-1` whatever overlay svgs the chart draws on top of
 * itself (those share the chart's box anyway).
 */
function svgsTopToBottom(root: Element): SVGSVGElement[] {
  return chartSvgs(root)
    .map((svg, order) => ({ svg, order, top: svg.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top || a.order - b.order)
    .map((entry) => entry.svg);
}

/**
 * The plot area of chart svg #`index` (top to bottom; negative counts from
 * the bottom, `-1`: a brush strip), i.e. the svg box inset by the chart's
 * `margin`. Returns a stand-in whose `getBoundingClientRect` is that box.
 */
export function plotArea(
  index: number,
  margin: { top: number; right: number; bottom: number; left: number }
): InteractionTarget {
  return (root) => {
    const svg = svgsTopToBottom(root).at(index);
    return svg ? insetBox(svg, margin) : null;
  };
}

/** Chart svg #`index` (top to bottom), whole box. */
export function chartSvg(index: number): InteractionTarget {
  return (root) => svgsTopToBottom(root).at(index) ?? null;
}

function insetBox(
  element: Element,
  inset: { top: number; right: number; bottom: number; left: number }
): Element {
  const proxy = {
    getBoundingClientRect: () => {
      const rect = element.getBoundingClientRect();
      return new DOMRect(
        rect.left + inset.left,
        rect.top + inset.top,
        rect.width - inset.left - inset.right,
        rect.height - inset.top - inset.bottom
      );
    },
  };
  return proxy as unknown as Element;
}

/** Accessible name, simplified: aria-label, labelledby, text, title. */
export function accessibleName(element: Element): string {
  const label = element.getAttribute("aria-label");
  if (label) {
    return label.trim();
  }
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
  }
  const text = element.textContent?.trim();
  if (text) {
    return text;
  }
  return element.getAttribute("title")?.trim() ?? "";
}

export function findButton(root: Element, name: string): Element | null {
  return (
    [...root.querySelectorAll('button, [role="button"]')].find(
      (button) => accessibleName(button) === name
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Pointer
// ---------------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

/**
 * Whole pixels relative to the frame, like a real mouse. Fractional client
 * coordinates go through `getScreenCTM()` inverses whose float error depends
 * on where the frame sits on screen (sweep stage vs per-variant panel), which
 * showed up as ms-level differences in brush dates.
 */
function snap(root: Element, point: Point): Point {
  const frame = root.getBoundingClientRect();
  return {
    x: frame.left + Math.round(point.x - frame.left),
    y: frame.top + Math.round(point.y - frame.top),
  };
}

function resolvePoint(root: Element, point: InteractionPoint): Point {
  const target = point.target?.(root) ?? root;
  const rect = target.getBoundingClientRect();
  return snap(root, {
    x: rect.left + rect.width * (point.fx ?? 0.5) + (point.dx ?? 0),
    y: rect.top + rect.height * (point.fy ?? 0.5) + (point.dy ?? 0),
  });
}

function hit(root: Element, point: Point): Element {
  const element = document.elementFromPoint(point.x, point.y);
  return element && root.contains(element) ? element : root;
}

type Init = MouseEventInit & PointerEventInit & WheelEventInit;

function dispatch(
  target: Element,
  type: string,
  point: Point,
  extra: Init = {}
) {
  const init: Init = {
    bubbles: !(type.endsWith("enter") || type.endsWith("leave")),
    cancelable: true,
    composed: true,
    clientX: point.x,
    clientY: point.y,
    screenX: point.x,
    screenY: point.y,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    view: window,
    ...extra,
  };
  let event: Event;
  if (type === "wheel") {
    event = new WheelEvent(type, init);
  } else if (type.startsWith("pointer")) {
    event = new PointerEvent(type, init);
  } else {
    event = new MouseEvent(type, init);
  }
  target.dispatchEvent(event);
}

/** Time for one input event to be handled before the next one is sent. */
const EVENT_GAP_MS = 24;

/**
 * Lets an event be fully processed: a frame (rAF-driven handlers, Motion)
 * then a macrotask gap long enough for React's scheduled commits and the
 * visx brush's 1 ms debounced window move.
 */
async function processed() {
  await nextFrame();
  await delay(EVENT_GAP_MS);
  await nextFrame();
}

/**
 * One synthetic mouse for a whole script: remembers which element it is
 * over, where it is, and which element captured it.
 */
export class SyntheticPointer {
  private over: Element | null = null;
  private position: Point | null = null;
  private captured: Element | null = null;
  private readonly root: Element;

  constructor(root: Element) {
    this.root = root;
  }

  private target(point: Point): Element {
    return this.captured ?? hit(this.root, point);
  }

  /** Moves to `point` with the given buttons held (over/out + move). */
  move(point: Point, buttons = 0) {
    const element = this.target(point);
    if (element !== this.over) {
      const previous = this.over ?? this.root;
      dispatch(previous, "pointerout", point, { relatedTarget: element });
      dispatch(previous, "mouseout", point, { relatedTarget: element });
      dispatch(element, "pointerover", point, { relatedTarget: previous });
      dispatch(element, "mouseover", point, { relatedTarget: previous });
      this.over = element;
    }
    dispatch(element, "pointermove", point, { buttons });
    dispatch(element, "mousemove", point, { buttons });
    this.position = point;
  }

  /**
   * Pointer + mouse down on the element under the point, which then gets
   * every move and the up until release (implicit capture: what both the
   * visx window-mode brush and capture-based rewrites see). `mouse*` events
   * bubble to `window`, where the visx brush listens. A synthetic pointer is
   * not "active", so the browser's `setPointerCapture` would throw: it is
   * made a no-op during the down so capture-based handlers keep running.
   */
  down(point: Point): Element {
    const element = this.target(point);
    const proto = Element.prototype;
    const original = proto.setPointerCapture;
    proto.setPointerCapture = function capture(this: Element, id: number) {
      try {
        original.call(this, id);
      } catch {
        // Not an active pointer: nothing to capture, events are routed below.
      }
    };
    try {
      dispatch(element, "pointerdown", point, { button: 0, buttons: 1 });
    } finally {
      proto.setPointerCapture = original;
    }
    dispatch(element, "mousedown", point, { button: 0, buttons: 1, detail: 1 });
    this.captured = element;
    this.over = element;
    return element;
  }

  up(point: Point, detail = 1): Element {
    const element = this.target(point);
    dispatch(element, "pointerup", point, { button: 0, buttons: 0 });
    dispatch(element, "mouseup", point, { button: 0, buttons: 0, detail });
    const captured = this.captured;
    this.captured = null;
    if (captured) {
      dispatch(captured, "lostpointercapture", point);
    }
    return element;
  }

  /**
   * Arrive, let the hover render, press, hold a frame, release. A real
   * pointer always has frames between arriving and pressing; pressing in the
   * same task as the hover move breaks `@use-gesture` drags.
   */
  async click(point: Point, detail = 1) {
    await this.arrive(point);
    const down = this.down(point);
    await processed();
    const up = this.up(point, detail);
    if (down === up) {
      dispatch(up, "click", point, { button: 0, detail });
    }
  }

  private async arrive(point: Point) {
    this.move(point);
    await processed();
  }

  /**
   * Down, `moves` moves, up. After every event the drag waits until it has
   * been fully processed ({@link processed}): which move a handler sees
   * first (drag thresholds, debounced window moves, state set on pointerdown)
   * must not depend on frame timing, or the result flakes.
   */
  async drag(from: Point, to: Point, moves: number) {
    await this.arrive(from);
    const down = this.down(from);
    for (let i = 1; i <= moves; i++) {
      await processed();
      const t = i / moves;
      this.move(
        snap(this.root, {
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
        }),
        1
      );
    }
    await processed();
    const up = this.up(to);
    if (down === up) {
      dispatch(up, "click", to, { button: 0, detail: 1 });
    }
  }

  wheel(point: Point, deltaY: number, ctrlKey = false) {
    this.move(point);
    dispatch(hit(this.root, point), "wheel", point, {
      deltaY,
      deltaX: 0,
      deltaMode: 0,
      ctrlKey,
    });
  }

  get at(): Point | null {
    return this.position;
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const DEFAULT_MOVES = 8;
const PINCH_DELTA = 10;

/** Frame size to restore after a script. */
export interface FrameSize {
  width: string;
  height: string;
}

export function frameSize(root: HTMLElement): FrameSize {
  return { width: root.style.width, height: root.style.height };
}

export function restoreFrame(root: HTMLElement, size: FrameSize) {
  root.style.width = size.width;
  root.style.height = size.height;
}

/** Performs one step (does not wait for settle). */
export async function performStep(
  root: HTMLElement,
  pointer: SyntheticPointer,
  step: InteractionStep,
  original: FrameSize
): Promise<string | undefined> {
  switch (step.kind) {
    case "drag":
      await pointer.drag(
        resolvePoint(root, step.from),
        resolvePoint(root, step.to),
        step.moves ?? DEFAULT_MOVES
      );
      return;
    case "click":
      await pointer.click(resolvePoint(root, step.at));
      return;
    case "dblclick": {
      const point = resolvePoint(root, step.at);
      await pointer.click(point, 1);
      await pointer.click(point, 2);
      dispatch(hit(root, point), "dblclick", point, {
        button: 0,
        detail: 2,
      });
      return;
    }
    case "wheel":
      pointer.wheel(resolvePoint(root, step.at), step.deltaY);
      return;
    case "pinch":
      pointer.wheel(
        resolvePoint(root, step.at),
        step.direction === "in" ? -PINCH_DELTA : PINCH_DELTA,
        true
      );
      return;
    case "button": {
      const button = findButton(root, step.name);
      if (!button) {
        return `No button named "${step.name}"`;
      }
      const rect = button.getBoundingClientRect();
      const point = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const under = document.elementFromPoint(point.x, point.y);
      if (under && button.contains(under)) {
        await pointer.click(point);
      } else {
        button.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true })
        );
      }
      return;
    }
    case "resize":
      root.style.width =
        step.width === undefined ? original.width : `${step.width}px`;
      root.style.height =
        step.height === undefined ? original.height : `${step.height}px`;
      return;
    case "settle":
      if (step.ms) {
        await delay(step.ms);
      }
      return;
    default:
      return;
  }
}
