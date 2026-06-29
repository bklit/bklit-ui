"use client";

import { AxisRuler } from "@grida/ruler/react";
import type { RefObject } from "react";
import { useEffect, useState } from "react";
import type { EditorCamera } from "@/editor/editor-camera";
import { cn } from "@/lib/utils";

export function EditorGridaRuler({
  axis,
  camera,
  viewportRef,
  className,
}: {
  axis: "x" | "y";
  camera: EditorCamera;
  viewportRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewportRef]);

  const width = axis === "x" ? size.width : 32;
  const height = axis === "y" ? size.height : 32;

  if (!(width && height)) {
    return (
      <div
        className={cn("shrink-0 bg-muted/30", className)}
        style={{
          width: axis === "x" ? "100%" : 32,
          height: axis === "y" ? "100%" : 32,
        }}
      />
    );
  }

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden bg-muted/30", className)}
    >
      <AxisRuler
        axis={axis}
        font="500 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        height={height}
        offset={axis === "x" ? camera.x : camera.y}
        subticks="auto"
        width={width}
        zoom={camera.zoom}
      />
    </div>
  );
}

export function EditorGridaRulerCorner() {
  return (
    <div className="h-8 w-8 shrink-0 border-border/60 border-b bg-muted/30" />
  );
}
