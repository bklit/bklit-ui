"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect } from "react";
import type { EditorCanvasView } from "@/editor/editor-canvas-view";
import { cn } from "@/lib/utils";

export function EditorCanvas({
  viewportRef,
  view,
  enabled,
  spacePressed,
  className,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick,
  registerPinchHandlers,
  children,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  view: EditorCanvasView;
  enabled: boolean;
  spacePressed: boolean;
  className?: string;
  onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  registerPinchHandlers: (element: HTMLElement | null) => () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const cleanup = registerPinchHandlers(viewportRef.current);
    return cleanup;
  }, [registerPinchHandlers, viewportRef]);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Design canvas pan/zoom surface
    <div
      aria-label="Chart canvas"
      className={cn(
        "relative min-h-0 overflow-hidden overscroll-none bg-background",
        enabled && (spacePressed ? "cursor-grab" : "cursor-default"),
        enabled && spacePressed && "cursor-grabbing",
        className
      )}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      ref={viewportRef}
      role="application"
      tabIndex={-1}
    >
      <div
        className="absolute top-0 left-0 will-change-transform"
        style={{
          transform: enabled
            ? `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})`
            : undefined,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
}
