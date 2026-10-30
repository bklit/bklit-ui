import { nextFrame } from "./settle";

const MAX_HOVER_POINTS = 64;
const HOVER_SELECTOR = "path, circle, rect, line, polygon";

export function center(element: Element): { x: number; y: number } | null {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Evenly samples at most `max` items, keeping order. */
function sample<T>(items: T[], max: number): T[] {
  if (items.length <= max) {
    return items;
  }
  const step = items.length / max;
  return Array.from(
    { length: max },
    (_, i) => items[Math.floor(i * step)] as T
  );
}

export function fire(
  target: Element,
  type: string,
  point: { x: number; y: number },
  relatedTarget: Element | null
) {
  const init: PointerEventInit = {
    bubbles: type !== "pointerenter" && type !== "pointerleave",
    cancelable: true,
    clientX: point.x,
    clientY: point.y,
    composed: true,
    pointerId: 1,
    pointerType: "mouse",
    relatedTarget,
    view: window,
  };
  const event = type.startsWith("pointer")
    ? new PointerEvent(type, init)
    : new MouseEvent(type, init);
  target.dispatchEvent(event);
}

/**
 * Moves a synthetic mouse across every geometry element under `root` (sampled
 * to at most 64 points), one point per frame, then leaves. Fires the
 * over/out + move sequence React derives `onMouseEnter` / `onMouseLeave` /
 * `onMouseMove` from. `root` must be on screen: hit testing uses
 * `elementFromPoint` so overlays (e.g. the sankey hit rect) get the events.
 */
export async function runHoverPass(
  root: Element,
  signal?: AbortSignal
): Promise<number> {
  const points = sample(
    [...root.querySelectorAll(HOVER_SELECTOR)]
      .map(center)
      .filter((p): p is { x: number; y: number } => p !== null),
    MAX_HOVER_POINTS
  );
  let previous: Element | null = null;
  let last = { x: 0, y: 0 };
  for (const point of points) {
    if (signal?.aborted) {
      break;
    }
    const target = document.elementFromPoint(point.x, point.y);
    if (!(target && root.contains(target))) {
      continue;
    }
    if (target !== previous) {
      if (previous) {
        fire(previous, "pointerout", point, target);
        fire(previous, "mouseout", point, target);
      }
      fire(target, "pointerover", point, previous);
      fire(target, "mouseover", point, previous);
      previous = target;
    }
    fire(target, "pointermove", point, null);
    fire(target, "mousemove", point, null);
    last = point;
    await nextFrame();
  }
  if (previous) {
    fire(previous, "pointerout", last, null);
    fire(previous, "mouseout", last, null);
    fire(previous, "pointerleave", last, null);
    fire(previous, "mouseleave", last, null);
  }
  return points.length;
}
