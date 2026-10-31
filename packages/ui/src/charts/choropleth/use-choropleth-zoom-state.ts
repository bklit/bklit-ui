"use client";

import type { WheelEvent as ReactWheelEvent, RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type LocalPointEvent, localPoint } from "../local-point";
import {
  applyInverseMatrixToPoint,
  applyMatrixToPoint,
  composeMatrices,
  constrainScale,
  DRAG_THRESHOLD_PX,
  defaultPinchDelta,
  defaultWheelDelta,
  identityMatrix,
  inverseMatrix,
  matrixToString,
  PINCH_WHEEL_RATIO,
  type PinchDeltaState,
  type Point,
  type Scale,
  type ScaleSignature,
  scaleMatrixAroundPoint,
  type TransformMatrix,
  type Translate,
  translateMatrix,
  wheelDeltaYPixels,
} from "./choropleth-zoom-matrix";

/**
 * Hand-written replacement for `@visx/zoom` 4.0.0 `<Zoom>` (and the
 * `@use-gesture/react` recognisers it binds), reproducing what bklit relies
 * on:
 *
 * - Drag-pan with the primary button / one finger: pointer capture on the hit
 *   element, starts once the pointer moved 3 px on an axis, and pans by the
 *   SVG-space distance from *that* point (the first 3 px are not applied).
 *   The pointer-up position is applied once more, then `isDragging` clears.
 *   A click after a real drag (> 3 px) is swallowed in the capture phase.
 * - Wheel (non-passive, `preventDefault`): one `wheelDelta` step per event
 *   around the cursor (`localPoint`), skipped while pinching.
 * - Pinch: two pointers (touch screens), ctrl+wheel (trackpads) or WebKit
 *   gesture events (desktop Safari). Each pinch event applies one
 *   `pinchDelta` step (default 0.9 / 1.1, picked by whether the pinch scale
 *   is below its start) around the pinch centre minus the container's
 *   client rect, including one step when the pinch starts and one when it
 *   ends, exactly as visx's `handlePinch` did. A pinch cancels a drag.
 * - Scale steps that would leave `scaleXMin..scaleXMax` /
 *   `scaleYMin..scaleYMax` are rejected (not clamped). Pan is unconstrained.
 *
 * Gesture updates write the `<g transform>` directly (`transformRef`) and
 * commit React state only when the gesture ends, so the map does not
 * re-render per pointer move; `toString()` always reads the live matrix.
 */

export interface ProvidedZoom<ElementType> {
  /** Sets translateX/Y to the center defined by width and height. */
  center: () => void;
  /** Sets the transform matrix to the identity matrix. */
  clear: () => void;
  /** Scales around `point` (or the centre of the canvas). */
  scale: (scale: ScaleSignature) => void;
  /** Multiplies the current transform matrix by the specified translation. */
  translate: (translate: Translate) => void;
  /** Translates to a specific x,y point. */
  translateTo: (point: Point) => void;
  /** Sets the translation of the current transform matrix. */
  setTranslate: (translate: Translate) => void;
  /** Sets the transform matrix, constraining its scale. */
  setTransformMatrix: (matrix: TransformMatrix) => void;
  /** Resets the transform to the initial transform. */
  reset: () => void;
  /** Wheel handler: one `wheelDelta` step around the pointer. */
  handleWheel: (event: ReactWheelEvent | WheelEvent) => void;
  /** Sets isDragging to false. */
  dragEnd: () => void;
  /** Pans by the pointer's distance from the drag start. */
  dragMove: (
    event: LocalPointEvent,
    options?: { offsetX?: number; offsetY?: number }
  ) => void;
  /** Records the drag start point and sets isDragging to true. */
  dragStart: (event: LocalPointEvent) => void;
  /** `matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)` */
  toString: () => string;
  /** Inverse of the current transform matrix. */
  invert: () => TransformMatrix;
  /** String form of the inverse matrix. */
  toStringInvert: () => string;
  applyToPoint: (point: Point) => Point;
  applyInverseToPoint: (point: Point) => Point;
  /** Ref for the element that receives the gestures. */
  containerRef: RefObject<ElementType | null>;
  /** Ref for the transformed `<g>` (bklit: written directly during gestures). */
  transformRef: RefObject<SVGGElement | null>;
}

export interface ZoomState {
  initialTransformMatrix: TransformMatrix;
  /** Committed transform (updated when a gesture ends). */
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

export type ZoomInstance<E extends Element> = ProvidedZoom<E> & ZoomState;

export interface ChoroplethZoomOptions {
  width: number;
  height: number;
  initialTransformMatrix?: TransformMatrix;
  scaleXMin?: number;
  scaleXMax?: number;
  scaleYMin?: number;
  scaleYMax?: number;
  wheelDelta?: (event: ReactWheelEvent | WheelEvent) => Scale;
  pinchDelta?: (state: PinchDeltaState) => Scale;
  constrain?: (
    transform: TransformMatrix,
    prevTransform: TransformMatrix
  ) => TransformMatrix;
}

const DEFAULT_INITIAL: TransformMatrix = identityMatrix();
/** use-gesture `TimeoutStore` default: a wheel pinch ends 140 ms after its last event. */
const WHEEL_END_MS = 140;
const DRAG_TRANSITION = "none";

export interface DragGesture {
  pointerId: number;
  /** Pointer is down and tracked (use-gesture `_pointerActive`). */
  pointerActive: boolean;
  /** Gesture not ended / cancelled (use-gesture `_active`). */
  active: boolean;
  /** Past the threshold at least once (use-gesture `state.active`). */
  started: boolean;
  last: [number, number];
  movement: [number, number];
  distance: [number, number];
  intentional: boolean;
}

interface PinchGesture {
  active: boolean;
  source: "pointer" | "wheel" | "gesture" | null;
  /** Persistent scale offset (use-gesture pinch `offset[0]`, starts at 1). */
  offset: number;
  lastOffset: number;
  /** wheel: accumulated movement; pointer: initial distance. */
  movement: number;
  initialDistance: number;
  origin: [number, number];
  memo: { top: number; left: number } | undefined;
  pointers: Map<number, { clientX: number; clientY: number }>;
}

export function createDragGesture(
  event: Pick<PointerEvent, "pointerId" | "clientX" | "clientY">
): DragGesture {
  return {
    pointerId: event.pointerId,
    pointerActive: true,
    active: true,
    started: false,
    last: [event.clientX, event.clientY],
    movement: [0, 0],
    distance: [0, 0],
    intentional: false,
  };
}

/**
 * Feed one pointer move into the drag (use-gesture `pointerMove` +
 * `compute`): `none` below the 3 px threshold, `first` on the move that
 * crosses it, `move` afterwards.
 */
export function advanceDragGesture(
  drag: DragGesture,
  clientX: number,
  clientY: number
): "none" | "first" | "move" {
  const dx = clientX - drag.last[0];
  const dy = clientY - drag.last[1];
  drag.last = [clientX, clientY];
  drag.movement[0] += dx;
  drag.movement[1] += dy;
  if (drag.active) {
    drag.distance[0] += Math.abs(dx);
    drag.distance[1] += Math.abs(dy);
  }
  if (
    !drag.intentional &&
    (Math.abs(drag.movement[0]) >= DRAG_THRESHOLD_PX ||
      Math.abs(drag.movement[1]) >= DRAG_THRESHOLD_PX)
  ) {
    drag.intentional = true;
  }
  if (!(drag.intentional && drag.active)) {
    return "none";
  }
  const first = !drag.started;
  drag.started = true;
  return first ? "first" : "move";
}

/** Distance and midpoint (client px) of the first two pinch pointers. */
function pinchPayload(
  pointers: PinchGesture["pointers"]
): { distance: number; origin: [number, number] } | null {
  const [a, b] = Array.from(pointers.values());
  if (!(a && b)) {
    return null;
  }
  return {
    distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
    origin: [(b.clientX + a.clientX) / 2, (b.clientY + a.clientY) / 2],
  };
}

function supportsGestureEvents(): boolean {
  return (
    typeof window !== "undefined" &&
    !("ontouchstart" in window) &&
    "GestureEvent" in window
  );
}

export function useChoroplethZoomState<E extends Element>({
  width,
  height,
  initialTransformMatrix = DEFAULT_INITIAL,
  scaleXMin = 0,
  scaleXMax = Number.POSITIVE_INFINITY,
  scaleYMin = 0,
  scaleYMax = Number.POSITIVE_INFINITY,
  wheelDelta = defaultWheelDelta,
  pinchDelta = defaultPinchDelta,
  constrain,
}: ChoroplethZoomOptions): ZoomInstance<E> {
  const containerRef = useRef<E | null>(null);
  const transformRef = useRef<SVGGElement | null>(null);
  const matrixRef = useRef<TransformMatrix>(initialTransformMatrix);
  const [transformMatrix, setTransformMatrixState] = useState(
    initialTransformMatrix
  );
  const [isDragging, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const startPointRef = useRef<Point | undefined>(undefined);
  const startTranslateRef = useRef<Translate | undefined>(undefined);

  const options = {
    width,
    height,
    initialTransformMatrix,
    limits: { scaleXMin, scaleXMax, scaleYMin, scaleYMax },
    wheelDelta,
    pinchDelta,
    constrain,
  };
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  // --- matrix -------------------------------------------------------------

  const writeTransform = useCallback(() => {
    transformRef.current?.setAttribute(
      "transform",
      matrixToString(matrixRef.current)
    );
  }, []);

  /** visx `setTransformMatrix` (constrained). `commit: false` = gesture. */
  const applyMatrix = useCallback(
    (next: TransformMatrix, commit: boolean) => {
      const { constrain: custom, limits } = optionsRef.current;
      const prev = matrixRef.current;
      const result = custom
        ? custom(next, prev)
        : constrainScale(next, prev, limits);
      matrixRef.current = result;
      writeTransform();
      if (commit) {
        setTransformMatrixState(result);
      }
    },
    [writeTransform]
  );

  const commitMatrix = useCallback(() => {
    setTransformMatrixState(matrixRef.current);
  }, []);

  const setDragging = useCallback((next: boolean) => {
    isDraggingRef.current = next;
    // Mirror the render-time styles right away so the first pan frame is not
    // eased (and the drop is), whatever React's render timing.
    const container = containerRef.current;
    if (container instanceof SVGElement || container instanceof HTMLElement) {
      container.style.cursor = next ? "grabbing" : "grab";
    }
    const group = transformRef.current;
    if (group) {
      group.style.transition = next
        ? DRAG_TRANSITION
        : "transform 0.18s ease-out";
    }
    setIsDraggingState(next);
  }, []);

  const scaleInternal = useCallback(
    (
      { scaleX, scaleY, point }: ScaleSignature,
      commit: boolean,
      /** Matrix to scale from (default: the live one). See handleWheelEvent. */
      from?: TransformMatrix
    ) => {
      const { width: w, height: h } = optionsRef.current;
      applyMatrix(
        scaleMatrixAroundPoint(
          from ?? matrixRef.current,
          { scaleX, scaleY, point },
          w,
          h
        ),
        commit
      );
      if (isDraggingRef.current) {
        const { translateX, translateY } = matrixRef.current;
        startPointRef.current = point;
        startTranslateRef.current = { translateX, translateY };
      }
    },
    [applyMatrix]
  );

  const setTranslateInternal = useCallback(
    ({ translateX, translateY }: Translate, commit: boolean) => {
      applyMatrix({ ...matrixRef.current, translateX, translateY }, commit);
    },
    [applyMatrix]
  );

  const dragStartInternal = useCallback(
    (event: LocalPointEvent) => {
      const { translateX, translateY } = matrixRef.current;
      startPointRef.current = localPoint(event) || undefined;
      startTranslateRef.current = { translateX, translateY };
      setDragging(true);
    },
    [setDragging]
  );

  const dragMoveInternal = useCallback(
    (
      event: LocalPointEvent,
      commit: boolean,
      offsets?: { offsetX?: number; offsetY?: number }
    ) => {
      const startPoint = startPointRef.current;
      const startTranslate = startTranslateRef.current;
      if (!(isDraggingRef.current && startPoint && startTranslate)) {
        return;
      }
      const currentPoint = localPoint(event);
      const dx = currentPoint
        ? -(startPoint.x - currentPoint.x)
        : -startPoint.x;
      const dy = currentPoint
        ? -(startPoint.y - currentPoint.y)
        : -startPoint.y;
      let translateX = startTranslate.translateX + dx;
      if (offsets?.offsetX) {
        translateX += offsets.offsetX ?? 0;
      }
      let translateY = startTranslate.translateY + dy;
      if (offsets?.offsetY) {
        translateY += offsets.offsetY ?? 0;
      }
      setTranslateInternal({ translateX, translateY }, commit);
    },
    [setTranslateInternal]
  );

  const dragEnd = useCallback(() => {
    startPointRef.current = undefined;
    startTranslateRef.current = undefined;
    if (isDraggingRef.current) {
      setDragging(false);
    } else {
      setIsDraggingState(false);
    }
  }, [setDragging]);

  const handleWheelInternal = useCallback(
    (event: ReactWheelEvent | WheelEvent, commit: boolean) => {
      event.preventDefault();
      const point = localPoint(event as LocalPointEvent) || undefined;
      const { scaleX, scaleY } = optionsRef.current.wheelDelta(event);
      scaleInternal({ scaleX, scaleY, point }, commit);
    },
    [scaleInternal]
  );

  // --- gestures -----------------------------------------------------------

  const pointerIdsRef = useRef(new Set<number>());
  const dragRef = useRef<DragGesture | null>(null);
  const tapRef = useRef(false);
  const pinchRef = useRef<PinchGesture>({
    active: false,
    source: null,
    offset: 1,
    lastOffset: 1,
    movement: 0,
    initialDistance: 0,
    origin: [0, 0],
    memo: undefined,
    pointers: new Map(),
  });
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelPinchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** visx `handlePinch`: one `pinchDelta` step around the pinch centre. */
  const emitPinch = useCallback(
    (from?: TransformMatrix) => {
      const pinch = pinchRef.current;
      const container = containerRef.current;
      if (!container) {
        return;
      }
      if (!pinch.memo) {
        const { top, left } = container.getBoundingClientRect();
        pinch.memo = { top, left };
      }
      const { scaleX, scaleY } = optionsRef.current.pinchDelta({
        offset: [pinch.offset, 0],
        lastOffset: [pinch.lastOffset, 0],
        origin: pinch.origin,
      });
      scaleInternal(
        {
          scaleX,
          scaleY,
          point: {
            x: pinch.origin[0] - pinch.memo.left,
            y: pinch.origin[1] - pinch.memo.top,
          },
        },
        false,
        from
      );
    },
    [scaleInternal]
  );

  const startPinch = useCallback((source: PinchGesture["source"]) => {
    const pinch = pinchRef.current;
    pinch.active = true;
    pinch.source = source;
    pinch.lastOffset = pinch.offset;
    pinch.movement = 0;
    pinch.memo = undefined;
  }, []);

  const endPinch = useCallback(() => {
    const pinch = pinchRef.current;
    pinch.active = false;
    pinch.source = null;
    emitPinch();
    commitMatrix();
  }, [commitMatrix, emitPinch]);

  const cancelDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    drag.active = false;
    drag.pointerActive = false;
    dragEnd();
  }, [dragEnd]);

  // Drag recogniser (use-gesture `DragEngine` with filterTaps).

  const dragPointerDown = useCallback((event: PointerEvent) => {
    // Primary button only, one pointer at a time.
    const drag = dragRef.current;
    if (
      !(event.buttons == null || event.buttons === 1) ||
      (pointerIdsRef.current.size > 1 && drag?.pointerActive)
    ) {
      return;
    }
    // use-gesture resets `tap` when a drag starts.
    tapRef.current = false;
    dragRef.current = createDragGesture(event);
  }, []);

  const dragPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!(drag?.pointerActive && event.pointerId === drag.pointerId)) {
        return;
      }
      const step = advanceDragGesture(drag, event.clientX, event.clientY);
      if (step === "none") {
        return;
      }
      if (pinchRef.current.active) {
        cancelDrag();
      } else if (step === "first") {
        // visx: dragStart here; the same event's dragMove is a no-op.
        dragStartInternal(event);
      } else {
        dragMoveInternal(event, false);
      }
    },
    [cancelDrag, dragMoveInternal, dragStartInternal]
  );

  const dragPointerEnd = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (
        !(
          drag?.active &&
          drag.pointerActive &&
          event.pointerId === drag.pointerId
        )
      ) {
        return;
      }
      drag.pointerActive = false;
      drag.active = false;
      tapRef.current =
        drag.distance[0] <= DRAG_THRESHOLD_PX &&
        drag.distance[1] <= DRAG_THRESHOLD_PX;
      if (!(drag.intentional && drag.started)) {
        return;
      }
      if (pinchRef.current.active) {
        dragEnd();
        return;
      }
      // visx applies the pointer-up position, then ends the drag in the same
      // render, so the transition is already back on for that last step.
      if (isDraggingRef.current && transformRef.current) {
        transformRef.current.style.transition = "transform 0.18s ease-out";
      }
      dragMoveInternal(event, false);
      dragEnd();
      commitMatrix();
    },
    [commitMatrix, dragEnd, dragMoveInternal]
  );

  // Pinch recogniser, two pointers (use-gesture `PinchEngine`, pointer device).

  const pinchPointerDown = useCallback(
    (event: PointerEvent) => {
      // Desktop Safari pinches through gesture events instead.
      if (supportsGestureEvents()) {
        return;
      }
      const pinch = pinchRef.current;
      const ids = pointerIdsRef.current;
      if (
        pinch.active &&
        Array.from(pinch.pointers.keys()).every((id) => ids.has(id))
      ) {
        return;
      }
      if (pinch.pointers.size < 2) {
        pinch.pointers.set(event.pointerId, {
          clientX: event.clientX,
          clientY: event.clientY,
        });
      }
      const payload = pinchPayload(pinch.pointers);
      if (!payload) {
        return;
      }
      if (!pinch.active) {
        startPinch("pointer");
      }
      pinch.initialDistance = payload.distance;
      pinch.origin = payload.origin;
      // Movement is 0 at the start, so offset === lastOffset (a 1.1 step).
      pinch.offset = pinch.lastOffset;
      emitPinch();
    },
    [emitPinch, startPinch]
  );

  const pinchPointerMove = useCallback(
    (event: PointerEvent) => {
      const pinch = pinchRef.current;
      if (!pinch.pointers.has(event.pointerId)) {
        return;
      }
      pinch.pointers.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
      const payload = pinchPayload(pinch.pointers);
      if (!(pinch.active && pinch.source === "pointer" && payload)) {
        return;
      }
      pinch.origin = payload.origin;
      const movement = payload.distance / pinch.initialDistance - 1;
      pinch.offset = (1 + movement) * pinch.lastOffset;
      emitPinch();
    },
    [emitPinch]
  );

  const pinchPointerEnd = useCallback(
    (event: PointerEvent) => {
      const pinch = pinchRef.current;
      if (!pinch.pointers.delete(event.pointerId)) {
        return;
      }
      if (
        pinch.active &&
        pinch.source === "pointer" &&
        pinch.pointers.size < 2
      ) {
        endPinch();
      }
    },
    [endPinch]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!(event.buttons == null || event.buttons % 2 === 1)) {
        return;
      }
      pointerIdsRef.current.add(event.pointerId);
      try {
        (event.target as Element).setPointerCapture(event.pointerId);
      } catch {
        // Not capturable (synthetic event).
      }
      dragPointerDown(event);
      pinchPointerDown(event);
    },
    [dragPointerDown, pinchPointerDown]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      dragPointerMove(event);
      pinchPointerMove(event);
    },
    [dragPointerMove, pinchPointerMove]
  );

  const handlePointerEnd = useCallback(
    (event: PointerEvent) => {
      if (event.type === "pointerup" || event.type === "pointercancel") {
        pointerIdsRef.current.delete(event.pointerId);
      }
      const target = event.target as Element;
      try {
        if (target.hasPointerCapture?.(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Detached.
      }
      dragPointerEnd(event);
      pinchPointerEnd(event);
    },
    [dragPointerEnd, pinchPointerEnd]
  );

  const handleWheelEvent = useCallback(
    (event: WheelEvent) => {
      // use-gesture runs the wheel recogniser before the pinch one, so the
      // first ctrl+wheel of a trackpad pinch calls visx `scale()` twice in
      // one event. Both read visx's matrix ref before React applied either
      // update, and the queued updaters each replace the whole matrix, so
      // the pinch step (computed from the pre-wheel matrix) overwrites the
      // wheel step unless the pinch step is rejected by the scale limits.
      const before = matrixRef.current;
      const startsWheelPinch = event.ctrlKey && !pinchRef.current.active;
      if (!pinchRef.current.active) {
        handleWheelInternal(event, false);
        if (wheelTimerRef.current) {
          clearTimeout(wheelTimerRef.current);
        }
        wheelTimerRef.current = setTimeout(() => {
          wheelTimerRef.current = null;
          commitMatrix();
        }, WHEEL_END_MS);
      }

      if (!event.ctrlKey) {
        return;
      }
      const pinch = pinchRef.current;
      if (!pinch.active) {
        startPinch("wheel");
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      pinch.movement +=
        (-wheelDeltaYPixels(event) / PINCH_WHEEL_RATIO) * pinch.offset;
      pinch.origin = [event.clientX, event.clientY];
      pinch.offset = pinch.movement + pinch.lastOffset;
      emitPinch(startsWheelPinch ? before : undefined);
      if (wheelPinchTimerRef.current) {
        clearTimeout(wheelPinchTimerRef.current);
      }
      wheelPinchTimerRef.current = setTimeout(() => {
        wheelPinchTimerRef.current = null;
        if (pinchRef.current.active) {
          endPinch();
        }
      }, WHEEL_END_MS);
    },
    [commitMatrix, emitPinch, endPinch, handleWheelInternal, startPinch]
  );

  const handleGesture = useCallback(
    (event: Event) => {
      const gesture = event as Event & {
        scale: number;
        clientX: number;
        clientY: number;
      };
      const pinch = pinchRef.current;
      if (event.type === "gesturestart") {
        if (event.cancelable) {
          event.preventDefault();
        }
        if (pinch.active) {
          return;
        }
        startPinch("gesture");
        pinch.origin = [gesture.clientX, gesture.clientY];
        pinch.offset = pinch.lastOffset;
        emitPinch();
        return;
      }
      if (event.type === "gesturechange") {
        if (event.cancelable) {
          event.preventDefault();
        }
        if (!pinch.active) {
          return;
        }
        pinch.origin = [gesture.clientX, gesture.clientY];
        pinch.offset = (1 + (gesture.scale - 1)) * pinch.lastOffset;
        emitPinch();
        return;
      }
      if (pinch.active) {
        endPinch();
      }
    },
    [emitPinch, endPinch, startPinch]
  );

  const handleClickCapture = useCallback((event: MouseEvent) => {
    if (!tapRef.current && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  // Bind native listeners (non-passive) to the container; rebind if the
  // element is replaced.
  const boundRef = useRef<{ element: E; cleanup: () => void } | null>(null);
  const handlersRef = useRef({
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handleWheelEvent,
    handleGesture,
    handleClickCapture,
  });
  useLayoutEffect(() => {
    handlersRef.current = {
      handlePointerDown,
      handlePointerMove,
      handlePointerEnd,
      handleWheelEvent,
      handleGesture,
      handleClickCapture,
    };
  });
  useEffect(() => {
    const element = containerRef.current;
    if (boundRef.current?.element === element) {
      return;
    }
    boundRef.current?.cleanup();
    boundRef.current = null;
    if (!element) {
      return;
    }
    const types = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "lostpointercapture",
      "wheel",
      ...(supportsGestureEvents()
        ? ["gesturestart", "gesturechange", "gestureend"]
        : []),
    ];
    const listener = (event: Event) => {
      const handlers = handlersRef.current;
      if (event.type === "pointerdown") {
        handlers.handlePointerDown(event as PointerEvent);
      } else if (event.type === "pointermove") {
        handlers.handlePointerMove(event as PointerEvent);
      } else if (event.type === "wheel") {
        handlers.handleWheelEvent(event as WheelEvent);
      } else if (event.type.startsWith("gesture")) {
        handlers.handleGesture(event);
      } else {
        handlers.handlePointerEnd(event as PointerEvent);
      }
    };
    const clickListener = (event: Event) =>
      handlersRef.current.handleClickCapture(event as MouseEvent);
    const options = { passive: false };
    const clickOptions = { capture: true, passive: false };
    for (const type of types) {
      element.addEventListener(type, listener, options);
    }
    element.addEventListener("click", clickListener, clickOptions);
    boundRef.current = {
      element,
      cleanup: () => {
        for (const type of types) {
          element.removeEventListener(type, listener);
        }
        element.removeEventListener("click", clickListener, true);
      },
    };
  });
  useEffect(
    () => () => {
      boundRef.current?.cleanup();
      boundRef.current = null;
      for (const timer of [wheelTimerRef, wheelPinchTimerRef]) {
        if (timer.current) {
          clearTimeout(timer.current);
        }
      }
    },
    []
  );

  // --- public API (commits immediately) -----------------------------------

  const scale = useCallback(
    (signature: ScaleSignature) => scaleInternal(signature, true),
    [scaleInternal]
  );
  const setTransformMatrix = useCallback(
    (matrix: TransformMatrix) => applyMatrix(matrix, true),
    [applyMatrix]
  );
  const setTranslate = useCallback(
    (translate: Translate) => setTranslateInternal(translate, true),
    [setTranslateInternal]
  );
  const translate = useCallback(
    ({ translateX, translateY }: Translate) =>
      applyMatrix(
        composeMatrices(
          matrixRef.current,
          translateMatrix(translateX, translateY)
        ),
        true
      ),
    [applyMatrix]
  );
  const translateTo = useCallback(
    ({ x, y }: Point) => {
      const point = applyInverseMatrixToPoint(matrixRef.current, { x, y });
      setTranslateInternal({ translateX: point.x, translateY: point.y }, true);
    },
    [setTranslateInternal]
  );
  const applyToPoint = useCallback(
    ({ x, y }: Point) => applyMatrixToPoint(matrixRef.current, { x, y }),
    []
  );
  const applyInverseToPoint = useCallback(
    ({ x, y }: Point) => applyInverseMatrixToPoint(matrixRef.current, { x, y }),
    []
  );
  const center = useCallback(() => {
    const { width: w, height: h } = optionsRef.current;
    const centerPoint = { x: w / 2, y: h / 2 };
    const inverseCentroid = applyInverseToPoint(centerPoint);
    translate({
      translateX: inverseCentroid.x - centerPoint.x,
      translateY: inverseCentroid.y - centerPoint.y,
    });
  }, [applyInverseToPoint, translate]);
  const clear = useCallback(
    () => applyMatrix(identityMatrix(), true),
    [applyMatrix]
  );
  const reset = useCallback(
    () => applyMatrix(optionsRef.current.initialTransformMatrix, true),
    [applyMatrix]
  );
  const invert = useCallback(() => inverseMatrix(matrixRef.current), []);
  const toStringInvert = useCallback(
    () => matrixToString(inverseMatrix(matrixRef.current)),
    []
  );
  const toMatrixString = useCallback(
    () => matrixToString(matrixRef.current),
    []
  );
  const handleWheel = useCallback(
    (event: ReactWheelEvent | WheelEvent) => handleWheelInternal(event, true),
    [handleWheelInternal]
  );
  const dragStart = useCallback(
    (event: LocalPointEvent) => dragStartInternal(event),
    [dragStartInternal]
  );
  const dragMove = useCallback(
    (
      event: LocalPointEvent,
      offsets?: { offsetX?: number; offsetY?: number }
    ) => dragMoveInternal(event, true, offsets),
    [dragMoveInternal]
  );

  return useMemo(
    () => ({
      initialTransformMatrix,
      transformMatrix,
      isDragging,
      center,
      clear,
      scale,
      translate,
      translateTo,
      setTranslate,
      setTransformMatrix,
      reset,
      handleWheel,
      dragEnd,
      dragMove,
      dragStart,
      toString: toMatrixString,
      invert,
      toStringInvert,
      applyToPoint,
      applyInverseToPoint,
      containerRef,
      transformRef,
    }),
    [
      applyInverseToPoint,
      applyToPoint,
      center,
      clear,
      dragEnd,
      dragMove,
      dragStart,
      handleWheel,
      initialTransformMatrix,
      invert,
      isDragging,
      reset,
      scale,
      setTransformMatrix,
      setTranslate,
      toMatrixString,
      toStringInvert,
      transformMatrix,
      translate,
      translateTo,
    ]
  );
}
