"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clampCameraZoom,
  compute100PercentCamera,
  computeCenterCamera,
  computeFitCamera,
  type EditorCamera,
  type EditorCameraViewInsets,
  persistCamera,
  zoomCameraAtPoint,
} from "@/editor/editor-camera";

export interface EditorContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** WebKit trackpad pinch (Safari, Tauri/WKWebView on macOS). */
interface WebKitGestureEvent extends Event {
  clientX: number;
  clientY: number;
  scale: number;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    tag === "BUTTON"
  );
}

function isChartFrameResizeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }
  const control = target.closest("button");
  if (!control) {
    return false;
  }
  const label = control.getAttribute("aria-label");
  return (
    label === "Resize width" ||
    label === "Resize height" ||
    label === "Resize width and height"
  );
}

export function useEditorCamera({
  enabled,
  viewportRef,
  getContentBounds,
  persist = true,
  defaultZoom = 1,
  viewInsets,
}: {
  enabled: boolean;
  viewportRef: RefObject<HTMLElement | null>;
  getContentBounds: () => EditorContentBounds;
  persist?: boolean;
  defaultZoom?: number;
  viewInsets?: EditorCameraViewInsets;
}) {
  const [camera, setCamera] = useState<EditorCamera>(() => ({
    zoom: 1,
    x: 0,
    y: 0,
  }));
  const [spacePressed, setSpacePressed] = useState(false);
  const panSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const pinchSessionRef = useRef<{
    pointerIds: [number, number];
    startDistance: number;
    startZoom: number;
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const getContentBoundsRef = useRef(getContentBounds);
  getContentBoundsRef.current = getContentBounds;
  const viewInsetsRef = useRef(viewInsets);
  viewInsetsRef.current = viewInsets;
  const prevContentBoundsRef = useRef<EditorContentBounds | null>(null);
  const userAdjustedCameraRef = useRef(false);

  const getViewportSize = useCallback(() => {
    const element = viewportRef.current;
    if (!element) {
      return { width: 0, height: 0 };
    }
    return {
      width: element.clientWidth,
      height: element.clientHeight,
    };
  }, [viewportRef]);

  const applyCamera = useCallback(
    (next: EditorCamera, options?: { userInitiated?: boolean }) => {
      if (options?.userInitiated) {
        userAdjustedCameraRef.current = true;
      }

      setCamera((prev) => {
        if (prev.zoom === next.zoom && prev.x === next.x && prev.y === next.y) {
          return prev;
        }
        return next;
      });

      if (persist && userAdjustedCameraRef.current) {
        persistCamera(next);
      }
    },
    [persist]
  );

  const fitToContent = useCallback(() => {
    const { width, height } = getViewportSize();
    const bounds = getContentBoundsRef.current();
    if (!(width && height && bounds.width && bounds.height)) {
      return;
    }
    applyCamera(
      computeFitCamera({
        viewportWidth: width,
        viewportHeight: height,
        worldX: bounds.x,
        worldY: bounds.y,
        worldWidth: bounds.width,
        worldHeight: bounds.height,
        viewInsets: viewInsetsRef.current,
      }),
      { userInitiated: true }
    );
  }, [applyCamera, getViewportSize]);

  const resetTo100 = useCallback(() => {
    const { width, height } = getViewportSize();
    const bounds = getContentBoundsRef.current();
    if (!(width && height && bounds.width && bounds.height)) {
      return;
    }
    applyCamera(
      compute100PercentCamera({
        viewportWidth: width,
        viewportHeight: height,
        worldX: bounds.x,
        worldY: bounds.y,
        worldWidth: bounds.width,
        worldHeight: bounds.height,
        viewInsets: viewInsetsRef.current,
      }),
      { userInitiated: true }
    );
  }, [applyCamera, getViewportSize]);

  const centerOnContent = useCallback(() => {
    const { width, height } = getViewportSize();
    const bounds = getContentBoundsRef.current();
    const currentZoom = cameraRef.current.zoom;
    if (!(width && height && bounds.width && bounds.height)) {
      return;
    }

    applyCamera(
      {
        zoom: currentZoom,
        ...computeCenterCamera({
          viewportWidth: width,
          viewportHeight: height,
          worldX: bounds.x,
          worldY: bounds.y,
          worldWidth: bounds.width,
          worldHeight: bounds.height,
          zoom: currentZoom,
          viewInsets: viewInsetsRef.current,
        }),
      },
      { userInitiated: true }
    );
  }, [applyCamera, getViewportSize]);

  const applyDefaultCamera = useCallback(() => {
    if (userAdjustedCameraRef.current) {
      return;
    }

    const { width, height } = getViewportSize();
    const bounds = getContentBoundsRef.current();
    if (!(width && height && bounds.width && bounds.height)) {
      return;
    }

    setCamera(
      compute100PercentCamera({
        viewportWidth: width,
        viewportHeight: height,
        worldX: bounds.x,
        worldY: bounds.y,
        worldWidth: bounds.width,
        worldHeight: bounds.height,
        zoom: defaultZoom,
        viewInsets: viewInsetsRef.current,
      })
    );
  }, [defaultZoom, getViewportSize]);

  const zoomBy = useCallback(
    (factor: number, anchor?: { x: number; y: number }) => {
      const { width, height } = getViewportSize();
      if (!(width && height)) {
        return;
      }

      const point = anchor ?? { x: width / 2, y: height / 2 };
      applyCamera(
        zoomCameraAtPoint({
          camera: cameraRef.current,
          pointX: point.x,
          pointY: point.y,
          nextZoom: cameraRef.current.zoom * factor,
        }),
        { userInitiated: true }
      );
    },
    [applyCamera, getViewportSize]
  );

  const panBy = useCallback(
    (deltaX: number, deltaY: number) => {
      applyCamera(
        {
          ...cameraRef.current,
          x: cameraRef.current.x + deltaX,
          y: cameraRef.current.y + deltaY,
        },
        { userInitiated: true }
      );
    },
    [applyCamera]
  );

  const setPan = useCallback(
    (x: number, y: number) => {
      applyCamera(
        {
          ...cameraRef.current,
          x,
          y,
        },
        { userInitiated: true }
      );
    },
    [applyCamera]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    userAdjustedCameraRef.current = false;
  }, [enabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial center only — artboard move/resize keeps camera fixed
  useEffect(() => {
    const bounds = getContentBoundsRef.current();
    const prev = prevContentBoundsRef.current;
    prevContentBoundsRef.current = bounds;

    if (prev) {
      return;
    }

    applyDefaultCamera();
  }, [applyDefaultCamera, getContentBounds]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = viewportRef.current;
    if (!element) {
      return;
    }

    applyDefaultCamera();
    const observer = new ResizeObserver(applyDefaultCamera);
    observer.observe(element);
    return () => observer.disconnect();
  }, [applyDefaultCamera, enabled, viewportRef]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setSpacePressed(true);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePressed(false);
        panSessionRef.current = null;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const rect = element.getBoundingClientRect();
        const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
        applyCamera(
          zoomCameraAtPoint({
            camera: cameraRef.current,
            pointX: event.clientX - rect.left,
            pointY: event.clientY - rect.top,
            nextZoom: cameraRef.current.zoom * factor,
          }),
          { userInitiated: true }
        );
        return;
      }

      if (event.shiftKey) {
        event.preventDefault();
        panBy(-event.deltaY, 0);
        return;
      }

      event.preventDefault();
      panBy(-event.deltaX, -event.deltaY);
    };

    let gestureSession: {
      startZoom: number;
      startX: number;
      startY: number;
      centerX: number;
      centerY: number;
    } | null = null;

    const onGestureStart = (event: Event) => {
      event.preventDefault();
      const gesture = event as WebKitGestureEvent;
      const rect = element.getBoundingClientRect();
      gestureSession = {
        startZoom: cameraRef.current.zoom,
        startX: cameraRef.current.x,
        startY: cameraRef.current.y,
        centerX: gesture.clientX - rect.left,
        centerY: gesture.clientY - rect.top,
      };
    };

    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as WebKitGestureEvent;
      if (!gestureSession) {
        return;
      }

      applyCamera(
        zoomCameraAtPoint({
          camera: {
            zoom: gestureSession.startZoom,
            x: gestureSession.startX,
            y: gestureSession.startY,
          },
          pointX: gestureSession.centerX,
          pointY: gestureSession.centerY,
          nextZoom: gestureSession.startZoom * gesture.scale,
        }),
        { userInitiated: true }
      );
    };

    const onGestureEnd = (event: Event) => {
      event.preventDefault();
      gestureSession = null;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("gesturestart", onGestureStart);
    element.addEventListener("gesturechange", onGestureChange);
    element.addEventListener("gestureend", onGestureEnd);

    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("gesturestart", onGestureStart);
      element.removeEventListener("gesturechange", onGestureChange);
      element.removeEventListener("gestureend", onGestureEnd);
    };
  }, [applyCamera, enabled, panBy, viewportRef]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const onLostPointerCapture = () => {
      panSessionRef.current = null;
    };

    element.addEventListener("lostpointercapture", onLostPointerCapture);
    return () => {
      element.removeEventListener("lostpointercapture", onLostPointerCapture);
    };
  }, [enabled, viewportRef]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      if (viewport.dataset.pinchActive === "true") {
        return;
      }

      if (isChartFrameResizeTarget(event.target)) {
        return;
      }

      const isPanButton =
        event.button === 1 || (event.button === 0 && spacePressed);
      if (!isPanButton) {
        return;
      }

      event.preventDefault();
      viewport.setPointerCapture(event.pointerId);
      panSessionRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: cameraRef.current.x,
        originY: cameraRef.current.y,
      };
    },
    [enabled, spacePressed, viewportRef]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const session = panSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      applyCamera(
        {
          ...cameraRef.current,
          x: session.originX + (event.clientX - session.startX),
          y: session.originY + (event.clientY - session.startY),
        },
        { userInitiated: true }
      );
    },
    [applyCamera]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const session = panSessionRef.current;
      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      viewportRef.current?.releasePointerCapture(event.pointerId);
      panSessionRef.current = null;
    },
    [viewportRef]
  );

  const onDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || isEditableTarget(event.target)) {
        return;
      }
      fitToContent();
    },
    [enabled, fitToContent]
  );

  const registerPinchHandlers = useCallback(
    (element: HTMLElement | null) => {
      if (!(enabled && element)) {
        return () => undefined;
      }

      const pointers = new Map<number, { x: number; y: number }>();

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "touch") {
          return;
        }

        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        element.setPointerCapture(event.pointerId);

        if (pointers.size === 2) {
          const entries = [...pointers.entries()];
          const first = entries[0];
          const second = entries[1];
          if (!(first && second)) {
            return;
          }
          const dx = second[1].x - first[1].x;
          const dy = second[1].y - first[1].y;
          const rect = element.getBoundingClientRect();
          const centerX = (first[1].x + second[1].x) / 2 - rect.left;
          const centerY = (first[1].y + second[1].y) / 2 - rect.top;

          pinchSessionRef.current = {
            pointerIds: [first[0], second[0]],
            startDistance: Math.hypot(dx, dy),
            startZoom: cameraRef.current.zoom,
            startX: cameraRef.current.x,
            startY: cameraRef.current.y,
            centerX,
            centerY,
          };
          element.dataset.pinchActive = "true";
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!pointers.has(event.pointerId)) {
          return;
        }

        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const session = pinchSessionRef.current;
        if (!session || pointers.size < 2) {
          return;
        }

        const first = pointers.get(session.pointerIds[0]);
        const second = pointers.get(session.pointerIds[1]);
        if (!(first && second)) {
          return;
        }

        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const nextZoom = clampCameraZoom(
          session.startZoom * (distance / session.startDistance)
        );
        const worldX = (session.centerX - session.startX) / session.startZoom;
        const worldY = (session.centerY - session.startY) / session.startZoom;

        applyCamera(
          {
            zoom: nextZoom,
            x: session.centerX - worldX * nextZoom,
            y: session.centerY - worldY * nextZoom,
          },
          { userInitiated: true }
        );
      };

      const onPointerUp = (event: PointerEvent) => {
        pointers.delete(event.pointerId);
        if (pointers.size < 2) {
          pinchSessionRef.current = null;
          delete element.dataset.pinchActive;
        }
        if (pointers.size === 0) {
          delete element.dataset.pinchActive;
        }
      };

      element.addEventListener("pointerdown", onPointerDown);
      element.addEventListener("pointermove", onPointerMove);
      element.addEventListener("pointerup", onPointerUp);
      element.addEventListener("pointercancel", onPointerUp);

      return () => {
        element.removeEventListener("pointerdown", onPointerDown);
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerup", onPointerUp);
        element.removeEventListener("pointercancel", onPointerUp);
      };
    },
    [applyCamera, enabled]
  );

  return {
    camera,
    /** @deprecated Use camera */
    view: camera,
    spacePressed,
    fitToContent,
    /** @deprecated Use fitToContent */
    fitToView: fitToContent,
    centerOnContent,
    resetTo100,
    zoomBy,
    panBy,
    setPan,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    registerPinchHandlers,
  };
}

/** @deprecated Use useEditorCamera */
export const useEditorCanvasView = useEditorCamera;
