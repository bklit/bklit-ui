"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clampCanvasScale,
  computeCenterView,
  computeFitView,
  type EditorCanvasView,
  persistCanvasView,
  readPersistedCanvasView,
  zoomAtPoint,
} from "@/editor/editor-canvas-view";

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

export function useEditorCanvasView({
  enabled,
  viewportRef,
  artboardWidth,
  artboardHeight,
  persist = true,
}: {
  enabled: boolean;
  viewportRef: RefObject<HTMLElement | null>;
  artboardWidth: number;
  artboardHeight: number;
  persist?: boolean;
}) {
  const [view, setView] = useState<EditorCanvasView>(() => ({
    scale: 1,
    panX: 0,
    panY: 0,
  }));
  const [spacePressed, setSpacePressed] = useState(false);
  const panSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);
  const pinchSessionRef = useRef<{
    pointerIds: [number, number];
    startDistance: number;
    startScale: number;
    startPanX: number;
    startPanY: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

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

  const applyView = useCallback(
    (next: EditorCanvasView) => {
      setView(next);
      if (persist) {
        persistCanvasView(next);
      }
    },
    [persist]
  );

  const fitToView = useCallback(() => {
    const { width, height } = getViewportSize();
    if (!(width && height)) {
      return;
    }
    applyView(
      computeFitView({
        viewportWidth: width,
        viewportHeight: height,
        artboardWidth,
        artboardHeight,
      })
    );
  }, [applyView, artboardHeight, artboardWidth, getViewportSize]);

  const resetTo100 = useCallback(() => {
    const { width, height } = getViewportSize();
    if (!(width && height)) {
      return;
    }
    applyView({
      scale: 1,
      ...computeCenterView({
        viewportWidth: width,
        viewportHeight: height,
        artboardWidth,
        artboardHeight,
        scale: 1,
      }),
    });
  }, [applyView, artboardHeight, artboardWidth, getViewportSize]);

  const centerArtboard = useCallback(() => {
    const { width, height } = getViewportSize();
    if (!(width && height)) {
      return;
    }
    applyView({
      ...viewRef.current,
      ...computeCenterView({
        viewportWidth: width,
        viewportHeight: height,
        artboardWidth,
        artboardHeight,
        scale: viewRef.current.scale,
      }),
    });
  }, [applyView, artboardHeight, artboardWidth, getViewportSize]);

  const zoomBy = useCallback(
    (factor: number, anchor?: { x: number; y: number }) => {
      const { width, height } = getViewportSize();
      if (!(width && height)) {
        return;
      }

      const point = anchor ?? { x: width / 2, y: height / 2 };
      applyView(
        zoomAtPoint({
          view: viewRef.current,
          pointX: point.x,
          pointY: point.y,
          nextScale: viewRef.current.scale * factor,
        })
      );
    },
    [applyView, getViewportSize]
  );

  const panBy = useCallback(
    (deltaX: number, deltaY: number) => {
      applyView({
        ...viewRef.current,
        panX: viewRef.current.panX + deltaX,
        panY: viewRef.current.panY + deltaY,
      });
    },
    [applyView]
  );

  const setPan = useCallback(
    (panX: number, panY: number) => {
      applyView({
        ...viewRef.current,
        panX,
        panY,
      });
    },
    [applyView]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = viewportRef.current;
    if (!element) {
      return;
    }

    let initialized = false;

    const initializeView = () => {
      if (initialized) {
        return;
      }

      const { width, height } = getViewportSize();
      if (!(width && height)) {
        return;
      }

      initialized = true;

      const persisted = persist ? readPersistedCanvasView() : null;
      if (persisted) {
        setView(persisted);
        return;
      }

      applyView(
        computeFitView({
          viewportWidth: width,
          viewportHeight: height,
          artboardWidth,
          artboardHeight,
        })
      );
    };

    initializeView();
    const observer = new ResizeObserver(initializeView);
    observer.observe(element);
    return () => observer.disconnect();
  }, [
    enabled,
    persist,
    applyView,
    artboardHeight,
    artboardWidth,
    getViewportSize,
    viewportRef,
  ]);

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

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
        applyView(
          zoomAtPoint({
            view: viewRef.current,
            pointX: event.clientX - rect.left,
            pointY: event.clientY - rect.top,
            nextScale: viewRef.current.scale * factor,
          })
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
    },
    [applyView, enabled, panBy, viewportRef]
  );

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
        originPanX: viewRef.current.panX,
        originPanY: viewRef.current.panY,
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

      applyView({
        ...viewRef.current,
        panX: session.originPanX + (event.clientX - session.startX),
        panY: session.originPanY + (event.clientY - session.startY),
      });
    },
    [applyView]
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
      fitToView();
    },
    [enabled, fitToView]
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
            startScale: viewRef.current.scale,
            startPanX: viewRef.current.panX,
            startPanY: viewRef.current.panY,
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
        const nextScale = clampCanvasScale(
          session.startScale * (distance / session.startDistance)
        );
        const worldX =
          (session.centerX - session.startPanX) / session.startScale;
        const worldY =
          (session.centerY - session.startPanY) / session.startScale;

        applyView({
          scale: nextScale,
          panX: session.centerX - worldX * nextScale,
          panY: session.centerY - worldY * nextScale,
        });
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
    [applyView, enabled]
  );

  return {
    view,
    spacePressed,
    fitToView,
    resetTo100,
    centerArtboard,
    zoomBy,
    panBy,
    setPan,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    registerPinchHandlers,
  };
}
