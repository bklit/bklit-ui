"use client";

import type {
  CSSProperties,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 400;

type ResizeEdge = "right" | "bottom" | "corner";

interface FrameSize {
  width: number;
  height: number;
}

function clampSize(
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
        "absolute z-20 touch-none select-none border-0 bg-transparent p-0",
        edge === "right" &&
          "top-0 right-0 h-full w-3 translate-x-1/2 cursor-ew-resize",
        edge === "bottom" &&
          "bottom-0 left-0 h-3 w-full translate-y-1/2 cursor-ns-resize",
        edge === "corner" &&
          "right-0 bottom-0 size-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
      )}
      onPointerDown={onPointerDown}
      type="button"
    />
  );
}

export function ResizablePreview({
  children,
  className,
  defaultWidth = DEFAULT_WIDTH,
  defaultHeight = DEFAULT_HEIGHT,
  onSizeChange,
}: {
  children: ReactNode;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  onSizeChange?: (size: FrameSize) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [maxSize, setMaxSize] = useState({ width: 1200, height: 800 });
  const [size, setSize] = useState<FrameSize>(() =>
    clampSize(defaultWidth, defaultHeight, 1200, 800)
  );

  useEffect(() => {
    const bounds = wrapRef.current?.parentElement;
    if (!bounds) {
      return;
    }
    const update = () => {
      setMaxSize({
        width: Math.max(bounds.clientWidth, MIN_WIDTH),
        height: Math.max(bounds.clientHeight, MIN_HEIGHT),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bounds);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }
    setSize(
      clampSize(defaultWidth, defaultHeight, maxSize.width, maxSize.height)
    );
  }, [defaultWidth, defaultHeight, maxSize.width, maxSize.height]);

  const startDrag = useCallback(
    (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      draggingRef.current = true;

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      document.body.style.cursor = resizeCursor(edge);
      document.body.style.userSelect = "none";

      let latest = clampSize(
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

        latest = clampSize(
          nextWidth,
          nextHeight,
          maxSize.width,
          maxSize.height
        );
        setSize(latest);
        onSizeChange?.(latest);
      };

      const onPointerUp = (upEvent: globalThis.PointerEvent) => {
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        draggingRef.current = false;
        onSizeChange?.(latest);
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
    },
    [maxSize.height, maxSize.width, onSizeChange, size.height, size.width]
  );

  const frameStyle: CSSProperties = {
    width: size.width,
    height: size.height,
  };

  return (
    <div
      className={cn("relative flex min-h-0 w-full justify-center", className)}
      ref={wrapRef}
    >
      <div
        className="relative overflow-visible rounded-xl border border-border bg-card shadow-sm"
        style={frameStyle}
      >
        <div className="size-full min-h-0 min-w-0 p-4">{children}</div>
        <ResizeHandle edge="right" onPointerDown={startDrag("right")} />
        <ResizeHandle edge="bottom" onPointerDown={startDrag("bottom")} />
        <ResizeHandle edge="corner" onPointerDown={startDrag("corner")} />
      </div>
    </div>
  );
}

export type ViewportPreset = "mobile" | "tablet" | "desktop";

export const VIEWPORT_PRESETS: Record<
  ViewportPreset,
  { label: string; width: number | null; height: number }
> = {
  mobile: { label: "Mobile", width: 375, height: 320 },
  tablet: { label: "Tablet", width: 768, height: 400 },
  desktop: { label: "Desktop", width: null, height: 400 },
};
