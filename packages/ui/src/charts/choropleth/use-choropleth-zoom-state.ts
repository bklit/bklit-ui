"use client";

import type { WheelEvent as ReactWheelEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
 * Hand-written replacement for `@visx/zoom` 4.0.0 `<Zoom>` and the
 * `@use-gesture/react` recognisers it binds.
 *
 * The zoom API below is a transcription of visx's Zoom.js: the same React
 * state (`transformMatrix`, `isDragging`, `startPoint`, `startTranslate`),
 * the same matrix ref updated inside the `setTransformMatrix` updater, and
 * the same render-time closures. That matters beyond style: on the first
 * ctrl+wheel of a trackpad pinch, use-gesture calls the wheel handler and
 * then the pinch handler in one event, and whether the pinch step sees the
 * wheel step depends on whether React computed the first update eagerly.
 * Mirroring visx's state lets React make that call exactly as it did.
 *
 * The gesture layer reproduces use-gesture:
 * - Drag-pan with the primary button / one finger: pointer capture on the hit
 *   element, starts once the pointer moved 3 px on an axis (the first 3 px
 *   are not applied), the pointer-up position is applied once more, and a
 *   click after a real drag (> 3 px) is swallowed in the capture phase.
 * - Wheel (non-passive): one `wheelDelta` step per event around the cursor,
 *   skipped while pinching.
 * - Pinch: two pointers, ctrl+wheel (trackpads) or WebKit gesture events
 *   (desktop Safari). Each pinch event applies one `pinchDelta` step (default
 *   0.9 / 1.1) around the pinch centre minus the container's client rect,
 *   including one step when the pinch starts and one when it ends (a
 *   ctrl+wheel pinch ends 140 ms after its last event). A pinch cancels a
 *   drag.
 * - Scale steps that would leave `scaleXMin..scaleXMax` /
 *   `scaleYMin..scaleYMax` are rejected (not clamped). Pan is unconstrained.
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
}

export interface ZoomState {
  initialTransformMatrix: TransformMatrix;
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
/** use-gesture `TimeoutStore` default: a ctrl+wheel pinch ends 140 ms after its last event. */
const WHEEL_END_MS = 140;

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
  /** Last event handed to the handlers (re-sent after a cancel). */
  event: PointerEvent | null;
}

interface PinchGesture {
  active: boolean;
  source: "pointer" | "wheel" | "gesture" | null;
  /** Persistent scale offset (use-gesture pinch `offset[0]`, starts at 1). */
  offset: number;
  lastOffset: number;
  /** ctrl+wheel: accumulated movement. */
  movement: number;
  initialDistance: number;
  origin: [number, number];
  memo: { top: number; left: number } | undefined;
  pointers: Map<number, { clientX: number; clientY: number }>;
}

/** What visx `handlePinch` read from the use-gesture pinch state. */
interface PinchHandlerState extends PinchDeltaState {
  memo: { top: number; left: number } | undefined;
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
    event: null,
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
  // --- visx Zoom.js -------------------------------------------------------

  const containerRef = useRef<E | null>(null);
  const matrixStateRef = useRef<TransformMatrix>(initialTransformMatrix);
  const [transformMatrix, setTransformMatrixState] = useState(
    initialTransformMatrix
  );
  const [isDragging, setIsDragging] = useState(false);
  const [startTranslate, setStartTranslate] = useState<Translate | undefined>(
    undefined
  );
  const [startPoint, setStartPoint] = useState<Point | undefined>(undefined);

  const defaultConstrain = useCallback(
    (next: TransformMatrix, prev: TransformMatrix) =>
      constrain
        ? constrain(next, prev)
        : constrainScale(next, prev, {
            scaleXMin,
            scaleXMax,
            scaleYMin,
            scaleYMax,
          }),
    [constrain, scaleXMin, scaleXMax, scaleYMin, scaleYMax]
  );

  const setTransformMatrix = useCallback(
    (next: TransformMatrix) => {
      setTransformMatrixState((prev) => {
        const updated = defaultConstrain(next, prev);
        matrixStateRef.current = updated;
        return updated;
      });
    },
    [defaultConstrain]
  );

  const applyToPoint = useCallback(
    ({ x, y }: Point) => applyMatrixToPoint(transformMatrix, { x, y }),
    [transformMatrix]
  );
  const applyInverseToPoint = useCallback(
    ({ x, y }: Point) => applyInverseMatrixToPoint(transformMatrix, { x, y }),
    [transformMatrix]
  );
  const reset = useCallback(() => {
    setTransformMatrix(initialTransformMatrix);
  }, [initialTransformMatrix, setTransformMatrix]);

  const scale = useCallback(
    ({ scaleX, scaleY, point }: ScaleSignature) => {
      // visx reads the ref, not state: the wheel listener has no fresh state.
      setTransformMatrix(
        scaleMatrixAroundPoint(
          matrixStateRef.current,
          { scaleX, scaleY, point },
          width,
          height
        )
      );
      if (isDragging) {
        const { translateX, translateY } = matrixStateRef.current;
        setStartPoint(point);
        setStartTranslate({ translateX, translateY });
      }
    },
    [height, width, isDragging, setTransformMatrix]
  );

  const translate = useCallback(
    ({ translateX, translateY }: Translate) => {
      setTransformMatrix(
        composeMatrices(
          transformMatrix,
          translateMatrix(translateX, translateY)
        )
      );
    },
    [setTransformMatrix, transformMatrix]
  );
  const setTranslate = useCallback(
    ({ translateX, translateY }: Translate) => {
      setTransformMatrix({ ...transformMatrix, translateX, translateY });
    },
    [setTransformMatrix, transformMatrix]
  );
  const translateTo = useCallback(
    ({ x, y }: Point) => {
      const point = applyInverseMatrixToPoint(transformMatrix, { x, y });
      setTranslate({ translateX: point.x, translateY: point.y });
    },
    [setTranslate, transformMatrix]
  );
  const invert = useCallback(
    () => inverseMatrix(transformMatrix),
    [transformMatrix]
  );
  const toStringInvert = useCallback(() => matrixToString(invert()), [invert]);

  const dragStart = useCallback(
    (event: LocalPointEvent) => {
      const { translateX, translateY } = transformMatrix;
      setStartPoint(localPoint(event) || undefined);
      setStartTranslate({ translateX, translateY });
      setIsDragging(true);
    },
    [transformMatrix]
  );
  const dragMove = useCallback(
    (
      event: LocalPointEvent,
      options?: { offsetX?: number; offsetY?: number }
    ) => {
      if (!(isDragging && startPoint && startTranslate)) {
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
      if (options?.offsetX) {
        translateX += options.offsetX ?? 0;
      }
      let translateY = startTranslate.translateY + dy;
      if (options?.offsetY) {
        translateY += options.offsetY ?? 0;
      }
      setTranslate({ translateX, translateY });
    },
    [isDragging, setTranslate, startPoint, startTranslate]
  );
  const dragEnd = useCallback(() => {
    setStartPoint(undefined);
    setStartTranslate(undefined);
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (event: ReactWheelEvent | WheelEvent) => {
      event.preventDefault();
      const point = localPoint(event as LocalPointEvent) || undefined;
      const { scaleX, scaleY } = wheelDelta(event);
      scale({ scaleX, scaleY, point });
    },
    [scale, wheelDelta]
  );

  const handlePinch = useCallback(
    (state: PinchHandlerState) => {
      const {
        origin: [ox, oy],
        memo,
      } = state;
      let currentMemo = memo;
      if (containerRef.current) {
        const { top, left } =
          currentMemo ?? containerRef.current.getBoundingClientRect();
        if (!currentMemo) {
          currentMemo = { top, left };
        }
        const { scaleX, scaleY } = pinchDelta(state);
        scale({ scaleX, scaleY, point: { x: ox - left, y: oy - top } });
      }
      return currentMemo;
    },
    [scale, pinchDelta]
  );

  const toMatrixString = useCallback(
    () => matrixToString(transformMatrix),
    [transformMatrix]
  );
  const center = useCallback(() => {
    const centerPoint = { x: width / 2, y: height / 2 };
    const inverseCentroid = applyInverseToPoint(centerPoint);
    translate({
      translateX: inverseCentroid.x - centerPoint.x,
      translateY: inverseCentroid.y - centerPoint.y,
    });
  }, [height, width, applyInverseToPoint, translate]);
  const clear = useCallback(() => {
    setTransformMatrix(identityMatrix());
  }, [setTransformMatrix]);

  // use-gesture applies the latest render's handlers during render.
  const api = { dragStart, dragMove, dragEnd, handleWheel, handlePinch };
  const apiRef = useRef(api);
  apiRef.current = api;

  // --- gestures (use-gesture drag / wheel / pinch engines) ----------------

  const pointerIdsRef = useRef(new Set<number>());
  const dragRef = useRef<DragGesture | null>(null);
  const tapRef = useRef(false);
  /** use-gesture drag `state.last`: survives into the next gesture. */
  const dragLastRef = useRef(false);
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
  const wheelPinchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** One pinch handler call (visx `handlePinch`); keeps its memo. */
  const emitPinch = useCallback(() => {
    const pinch = pinchRef.current;
    pinch.memo = apiRef.current.handlePinch({
      offset: [pinch.offset, 0],
      lastOffset: [pinch.lastOffset, 0],
      origin: pinch.origin,
      memo: pinch.memo,
    });
  }, []);

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
  }, [emitPinch]);

  /** use-gesture drag handler: onDragStart (first), onDrag, onDragEnd (last). */
  const emitDrag = useCallback(
    (event: PointerEvent, first: boolean, last: boolean) => {
      const handlers = apiRef.current;
      const drag = dragRef.current;
      if (first) {
        handlers.dragStart(event);
      }
      if (pinchRef.current.active) {
        // visx: `cancel(); dragEnd();`. The cancel re-emits on a timeout.
        if (drag?.active) {
          drag.active = false;
          drag.pointerActive = false;
          cancelTimerRef.current = setTimeout(() => {
            cancelTimerRef.current = null;
            dragLastRef.current = true;
            const latest = apiRef.current;
            if (pinchRef.current.active) {
              latest.dragEnd();
            } else if (drag.event) {
              latest.dragMove(drag.event);
            }
            latest.dragEnd();
          }, 0);
        }
        handlers.dragEnd();
      } else {
        handlers.dragMove(event);
      }
      if (last) {
        handlers.dragEnd();
      }
    },
    []
  );

  const dragPointerDown = useCallback((event: PointerEvent) => {
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
      drag.event = event;
      if (step === "first") {
        dragLastRef.current = false;
      }
      emitDrag(event, step === "first", false);
    },
    [emitDrag]
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
      if (drag.started) {
        drag.event = event;
        dragLastRef.current = true;
        emitDrag(event, false, true);
      } else if (tapRef.current) {
        // A tap still reaches the handlers (filterTaps); `last` is whatever
        // the previous drag left, so a tap after a drag calls dragEnd.
        emitDrag(event, false, dragLastRef.current);
      }
    },
    [emitDrag]
  );

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
      // use-gesture's wheel recogniser runs before the pinch one, so the first
      // ctrl+wheel of a pinch reaches both handlers in the same event.
      if (!pinchRef.current.active) {
        apiRef.current.handleWheel(event);
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
      emitPinch();
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
    [emitPinch, endPinch, startPinch]
  );

  const handleGesture = useCallback(
    (event: Event) => {
      const gesture = event as Event & {
        scale: number;
        clientX: number;
        clientY: number;
      };
      const pinch = pinchRef.current;
      if (event.type === "gestureend") {
        if (pinch.active) {
          endPinch();
        }
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      if (event.type === "gesturestart") {
        if (pinch.active) {
          return;
        }
        startPinch("gesture");
        pinch.origin = [gesture.clientX, gesture.clientY];
        pinch.offset = pinch.lastOffset;
        emitPinch();
        return;
      }
      if (!pinch.active) {
        return;
      }
      pinch.origin = [gesture.clientX, gesture.clientY];
      pinch.offset = (1 + (gesture.scale - 1)) * pinch.lastOffset;
      emitPinch();
    },
    [emitPinch, endPinch, startPinch]
  );

  const handleClickCapture = useCallback((event: MouseEvent) => {
    if (!tapRef.current && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  // Bind native (non-passive) listeners to the container; rebind if the
  // element is replaced.
  const handlersRef = useRef({
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handleWheelEvent,
    handleGesture,
    handleClickCapture,
  });
  const boundRef = useRef<{ element: E; cleanup: () => void } | null>(null);
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
    const handlers = handlersRef.current;
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
      handlers.handleClickCapture(event as MouseEvent);
    for (const type of types) {
      element.addEventListener(type, listener, { passive: false });
    }
    element.addEventListener("click", clickListener, {
      capture: true,
      passive: false,
    });
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
      for (const timer of [wheelPinchTimerRef, cancelTimerRef]) {
        if (timer.current) {
          clearTimeout(timer.current);
        }
      }
    },
    []
  );

  // A fresh object every render, like visx's `zoom`.
  return {
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
  };
}
