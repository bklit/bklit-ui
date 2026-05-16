"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const STUDIO_CHART_FRAME_HEIGHT = 400;
export const STUDIO_CHART_FRAME_WIDTH = 720;

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

const frameSpring = { type: "spring" as const, stiffness: 420, damping: 36 };

type ResizeEdge = "right" | "bottom" | "corner";

interface FrameSize {
  width: number;
  height: number;
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

function resizeCursor(edge: ResizeEdge) {
  if (edge === "right") {
    return "ew-resize";
  }
  if (edge === "bottom") {
    return "ns-resize";
  }
  return "nwse-resize";
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clampFrameSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): FrameSize {
  const safeW = finiteOr(width, STUDIO_CHART_FRAME_WIDTH);
  const safeH = finiteOr(height, STUDIO_CHART_FRAME_HEIGHT);
  const maxW = Math.max(
    MIN_WIDTH,
    finiteOr(maxWidth, STUDIO_CHART_FRAME_WIDTH * 2)
  );
  const maxH = Math.max(
    MIN_HEIGHT,
    finiteOr(maxHeight, STUDIO_CHART_FRAME_HEIGHT * 2)
  );

  return {
    width: Math.round(Math.min(maxW, Math.max(MIN_WIDTH, safeW))),
    height: Math.round(Math.min(maxH, Math.max(MIN_HEIGHT, safeH))),
  };
}

function ResizeHandle({
  edge,
  onPointerDown,
}: {
  edge: ResizeEdge;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <motion.button
      aria-label={resizeAriaLabel(edge)}
      className={cn(
        "absolute z-20 flex touch-none select-none items-center justify-center border-0 bg-transparent p-0 transition-transform",
        "group-hover/studio-frame:scale-110",
        edge === "right" &&
          "top-0 right-0 h-full w-4 translate-x-1/2 cursor-ew-resize",
        edge === "bottom" &&
          "bottom-0 left-0 h-4 w-full translate-y-1/2 cursor-ns-resize",
        edge === "corner" &&
          "right-0 bottom-0 size-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
      )}
      onPointerDown={onPointerDown}
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span
        className={cn(
          "pointer-events-none rounded-full bg-border shadow-sm ring-1 ring-background transition-colors group-hover/studio-frame:bg-foreground/70 group-hover/studio-frame:ring-foreground/25",
          edge === "right" && "h-8 w-1.5",
          edge === "bottom" && "h-1.5 w-8",
          edge === "corner" && "size-3 rounded-sm"
        )}
      />
    </motion.button>
  );
}

export function StudioChartFrame({
  width,
  height,
  onResize,
  className,
  style,
  children,
}: {
  width: number;
  height: number;
  onResize: (width: number, height: number) => void;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [maxSize, setMaxSize] = useState({
    width: STUDIO_CHART_FRAME_WIDTH * 2,
    height: STUDIO_CHART_FRAME_HEIGHT * 2,
  });
  const [size, setSize] = useState<FrameSize>(() =>
    clampFrameSize(
      width,
      height,
      STUDIO_CHART_FRAME_WIDTH * 2,
      STUDIO_CHART_FRAME_HEIGHT * 2
    )
  );

  useEffect(() => {
    const parent = wrapRef.current?.parentElement;
    if (!parent) {
      return;
    }
    const update = () => {
      setMaxSize({
        width: Math.max(parent.clientWidth, STUDIO_CHART_FRAME_WIDTH),
        height: Math.max(parent.clientHeight, STUDIO_CHART_FRAME_HEIGHT),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }
    setSize(clampFrameSize(width, height, maxSize.width, maxSize.height));
  }, [width, height, maxSize.width, maxSize.height]);

  const startDrag = useCallback(
    (edge: ResizeEdge) => (event: React.PointerEvent<HTMLButtonElement>) => {
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

      const onPointerMove = (moveEvent: PointerEvent) => {
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

      const onPointerUp = (upEvent: PointerEvent) => {
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
      className={cn("group/studio-frame max-w-full", className)}
      ref={wrapRef}
    >
      <motion.div
        animate={{ width: size.width, height: size.height }}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 bg-card shadow-sm transition-[border-color,border-style]",
          isDragging
            ? "border-foreground/50 border-dotted"
            : "border-border hover:border-foreground/35"
        )}
        layout
        style={style}
        transition={
          isDragging || reducedMotion
            ? { duration: 0 }
            : { ...frameSpring, layout: frameSpring }
        }
      >
        <motion.div
          className="flex size-full min-h-0 min-w-0 items-center justify-center p-4"
          layout
        >
          {children}
        </motion.div>
        <ResizeHandle edge="right" onPointerDown={startDrag("right")} />
        <ResizeHandle edge="bottom" onPointerDown={startDrag("bottom")} />
        <ResizeHandle edge="corner" onPointerDown={startDrag("corner")} />
      </motion.div>
    </div>
  );
}
