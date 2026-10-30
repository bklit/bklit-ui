/**
 * Drop-in replacement for `@visx/event` `localPoint` (v4.0.0), reproducing its
 * semantics exactly:
 *
 * - `localPoint(event)` measures relative to `event.target` (NOT
 *   `currentTarget`). For an SVG child the point is mapped into the root
 *   `<svg>` user space via `ownerSVGElement.getScreenCTM().inverse()`; group
 *   transforms are ignored (callers subtract margins themselves).
 * - `localPoint(node, event)` measures relative to `node` the same way. Pass
 *   the `<svg>` itself for touches; `event` may be a `Touch` (anything with
 *   `clientX` / `clientY`).
 * - When there is no owner SVG with a CTM (outermost `<svg>` as target, HTML
 *   nodes), falls back to `getBoundingClientRect()` minus `clientLeft/Top`.
 * - Touch events read `changedTouches[0]` (0,0 when empty). Events without
 *   client coords (focus) use the centre of the target's bounding rect.
 *
 * Returns a plain `{ x, y }` (visx returned a `Point` instance; bklit only reads
 * `x` / `y`).
 */

export interface LocalPoint {
  x: number;
  y: number;
}

interface ClientPointLike {
  clientX: number;
  clientY: number;
}

interface TouchEventLike {
  changedTouches: ArrayLike<ClientPointLike>;
}

/** Native/React mouse, pointer, touch or focus event, or a `Touch`. */
export type LocalPointEvent =
  | Event
  | ClientPointLike
  | TouchEventLike
  | { nativeEvent: Event; target: EventTarget | null };

function isElement(value: unknown): value is Element {
  return typeof Element !== "undefined" && value instanceof Element;
}

function isEvent(
  value: unknown
): value is Event | { nativeEvent: Event; target: EventTarget | null } {
  if (typeof Event === "undefined" || !value) {
    return false;
  }
  return (
    value instanceof Event ||
    ("nativeEvent" in (value as object) &&
      (value as { nativeEvent: unknown }).nativeEvent instanceof Event)
  );
}

function clientCoords(event: LocalPointEvent): LocalPoint {
  if ("changedTouches" in event) {
    const touch = event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 };
  }
  if ("clientX" in event) {
    return { x: event.clientX, y: event.clientY };
  }
  // Focus (and other coordinate-less) events: centre of the target.
  const target = (event as { target?: unknown }).target;
  if (
    target &&
    typeof target === "object" &&
    "getBoundingClientRect" in target
  ) {
    const rect = (target as Element).getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }
  return { x: 0, y: 0 };
}

function localPointFromNode(node: Element, event: LocalPointEvent): LocalPoint {
  const coords = clientCoords(event);

  // Top-most SVG (null for the outermost <svg> itself -> rect fallback).
  const svg: Element | null =
    (typeof SVGElement !== "undefined" && node instanceof SVGElement) ||
    "ownerSVGElement" in node
      ? (node as SVGElement).ownerSVGElement
      : node;
  const screenCTM =
    svg && "getScreenCTM" in svg
      ? (svg as SVGGraphicsElement).getScreenCTM()
      : null;

  if (svg && "createSVGPoint" in svg && screenCTM) {
    const point = (svg as SVGSVGElement).createSVGPoint();
    point.x = coords.x;
    point.y = coords.y;
    const local = point.matrixTransform(screenCTM.inverse());
    return { x: local.x, y: local.y };
  }

  const rect = node.getBoundingClientRect();
  return {
    x: coords.x - rect.left - node.clientLeft,
    y: coords.y - rect.top - node.clientTop,
  };
}

export function localPoint(event: LocalPointEvent): LocalPoint | null;
export function localPoint(
  node: Element | null | undefined,
  event: LocalPointEvent
): LocalPoint | null;
export function localPoint(
  nodeOrEvent: Element | LocalPointEvent | null | undefined,
  maybeEvent?: LocalPointEvent
): LocalPoint | null {
  if (isElement(nodeOrEvent) && maybeEvent) {
    return localPointFromNode(nodeOrEvent, maybeEvent);
  }
  if (isEvent(nodeOrEvent)) {
    const node = nodeOrEvent.target;
    if (isElement(node)) {
      return localPointFromNode(node, nodeOrEvent);
    }
  }
  return null;
}
