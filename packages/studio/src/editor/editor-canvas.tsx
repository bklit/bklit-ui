"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect } from "react";
import type { EditorCamera } from "@/editor/editor-camera";
import { EditorCanvasWorldGrid } from "@/editor/editor-canvas-world-grid";
import { cn } from "@/lib/utils";

export function EditorCanvas({
  viewportRef,
  camera,
  enabled,
  spacePressed,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick,
  registerPinchHandlers,
  children,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  camera: EditorCamera;
  enabled: boolean;
  spacePressed: boolean;
  className?: string;
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
        "relative min-h-0 touch-none overflow-hidden overscroll-none bg-background outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
        enabled && (spacePressed ? "cursor-grab" : "cursor-default"),
        enabled && spacePressed && "cursor-grabbing",
        className
      )}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={viewportRef}
      role="application"
      tabIndex={-1}
    >
      <div
        className="absolute top-0 left-0 z-1"
        style={{
          transform: enabled
            ? `translate(${camera.x}px, ${camera.y}px)`
            : undefined,
        }}
      >
        <div
          style={{
            zoom: enabled ? camera.zoom : undefined,
          }}
        >
          {enabled ? <EditorCanvasWorldGrid /> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
