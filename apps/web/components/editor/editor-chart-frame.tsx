"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  EditorFrameRulerX,
  EditorFrameRulerY,
  editorFrameRulerFade,
} from "@/components/editor/editor-frame-rulers";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

type ResizeEdge = "right" | "bottom" | "corner";

interface FrameSize {
  width: number;
  height: number;
}

function clampFrameSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): FrameSize {
  return {
    width: Math.round(Math.min(maxWidth, Math.max(MIN_WIDTH, width))),
    height: Math.round(Math.min(maxHeight, Math.max(MIN_HEIGHT, height))),
  };
}

function resizeCursor(edge: ResizeEdge) {
  if (edge === "right") {
    return "ew-resize";
  }
  if (edge === "bottom") {
    return "ns-resize";
  }
  return "nwse-resize";
}

function resizeAriaLabel(edge: ResizeEdge) {
  if (edge === "corner") {
    return "Resize width and height";
  }
  if (edge === "right") {
    return "Resize width";
  }
  return "Resize height";
}

function ResizeHandle({
  edge,
  onPointerDown,
}: {
  edge: ResizeEdge;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-label={resizeAriaLabel(edge)}
      className={cn(
        "absolute z-20 touch-none select-none border-0 bg-transparent p-0 opacity-0",
        edge === "right" &&
          "top-0 right-0 h-full w-4 translate-x-1/2 cursor-ew-resize",
        edge === "bottom" &&
          "bottom-0 left-0 h-4 w-full translate-y-1/2 cursor-ns-resize",
        edge === "corner" &&
          "right-0 bottom-0 size-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
      )}
      onPointerDown={onPointerDown}
      type="button"
    />
  );
}

function CornerHandle({
  className,
  visible,
}: {
  className?: string;
  visible?: boolean;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-30 size-3 bg-accent opacity-0 transition-opacity group-hover/editor-frame:opacity-100",
        visible && "opacity-100",
        className
      )}
    />
  );
}

export function EditorChartFrame({
  width,
  height,
  boundsRef,
  className,
  onResize,
  resizable = true,
  children,
}: {
  width: number;
  height: number;
  boundsRef?: RefObject<HTMLElement | null>;
  className?: string;
  onResize: (width: number, height: number) => void;
  resizable?: boolean;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [maxSize, setMaxSize] = useState({ width: 1200, height: 800 });
  const [size, setSize] = useState<FrameSize>(() =>
    clampFrameSize(width, height, 1200, 800)
  );

  useEffect(() => {
    const bounds = boundsRef?.current ?? wrapRef.current?.parentElement;
    if (!bounds) {
      return;
    }

    const update = () => {
      setMaxSize({
        width: Math.max(bounds.clientWidth - 48, MIN_WIDTH),
        height: Math.max(bounds.clientHeight - 48, MIN_HEIGHT),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(bounds);
    return () => observer.disconnect();
  }, [boundsRef]);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }
    if (!resizable) {
      setSize({ width, height });
      return;
    }
    setSize(clampFrameSize(width, height, maxSize.width, maxSize.height));
  }, [width, height, maxSize.width, maxSize.height, resizable]);

  const startDrag = useCallback(
    (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setIsDragging(true);

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      document.body.style.cursor = resizeCursor(edge);
      document.body.style.userSelect = "none";

      let latest = clampFrameSize(
        startWidth,
        startHeight,
        maxSize.width,
        maxSize.height
      );

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        let nextWidth = startWidth;
        let nextHeight = startHeight;

        if (edge === "right" || edge === "corner") {
          nextWidth = startWidth + (moveEvent.clientX - startX);
        }
        if (edge === "bottom" || edge === "corner") {
          nextHeight = startHeight + (moveEvent.clientY - startY);
        }

        latest = clampFrameSize(
          nextWidth,
          nextHeight,
          maxSize.width,
          maxSize.height
        );
        setSize(latest);
      };

      const onPointerUp = (upEvent: globalThis.PointerEvent) => {
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        draggingRef.current = false;
        setIsDragging(false);
        onResize(latest.width, latest.height);
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
    },
    [maxSize.height, maxSize.width, onResize, size.height, size.width]
  );

  return (
    <div
      className={cn(
        "group/editor-frame relative inline-block max-w-full overflow-visible",
        className
      )}
      ref={wrapRef}
    >
      <div
        className={cn(
          "relative overflow-visible border-2 bg-card shadow-sm transition-[border-color]",
          isDragging ? "border-accent" : "border-border hover:border-accent"
        )}
        style={{ width: size.width, height: size.height }}
      >
        <div className="size-full min-h-0 min-w-0 p-4">{children}</div>

        {resizable ? (
          <>
            <ResizeHandle edge="right" onPointerDown={startDrag("right")} />
            <ResizeHandle edge="bottom" onPointerDown={startDrag("bottom")} />
            <ResizeHandle edge="corner" onPointerDown={startDrag("corner")} />

            <CornerHandle
              className="top-0 left-0 -translate-x-1/2 -translate-y-1/2"
              visible={isDragging}
            />
            <CornerHandle
              className="top-0 right-0 translate-x-1/2 -translate-y-1/2"
              visible={isDragging}
            />
            <CornerHandle
              className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
              visible={isDragging}
            />
            <CornerHandle
              className="right-0 bottom-0 translate-x-1/2 translate-y-1/2"
              visible={isDragging}
            />
          </>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {isDragging ? (
          <>
            <EditorFrameRulerX
              key="editor-ruler-x"
              transition={
                reducedMotion ? { duration: 0 } : editorFrameRulerFade
              }
              width={size.width}
            />
            <EditorFrameRulerY
              height={size.height}
              key="editor-ruler-y"
              transition={
                reducedMotion ? { duration: 0 } : editorFrameRulerFade
              }
            />
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
