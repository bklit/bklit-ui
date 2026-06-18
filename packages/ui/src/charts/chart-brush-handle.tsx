"use client";

import type { BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ChartBrushOverlayHost } from "./chart-brush-track-overlay";
import { useChartStable } from "./chart-context";

/** Matches shadcn `ResizableHandle` withHandle pill (`h-6 w-1 rounded-lg`). */
const HANDLE_HEIGHT_PX = 24;
const HANDLE_WIDTH_PX = 4;

/**
 * Invisible hit target for visx `BrushHandle` drag interaction.
 * Visible pills render in `ChartBrushHandleOverlay` above the blur layer.
 */
function brushHandleCursor(className: string) {
  return className.includes("left") || className.includes("right")
    ? "ew-resize"
    : "ns-resize";
}

export function renderChartBrushHandle({
  x,
  y,
  width,
  height,
  className,
}: BrushHandleRenderProps) {
  return (
    <rect
      className={className}
      fill="transparent"
      height={height}
      style={{ cursor: brushHandleCursor(className) }}
      width={width}
      x={x}
      y={y}
    />
  );
}

export interface ChartBrushHandleOverlayProps {
  innerWidth: number;
  innerHeight: number;
  /** Pixel x of the selection start within the plot area. */
  selectionX0: number;
  /** Pixel x of the selection end within the plot area. */
  selectionX1: number;
}

/** Renders brush resize pills above the outside blur portal (`z-[2]`). */
export function ChartBrushHandleOverlayContent({
  containerRef,
  margin,
  innerWidth,
  innerHeight,
  selectionX0,
  selectionX1,
}: ChartBrushHandleOverlayProps & ChartBrushOverlayHost) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  const x0 = Math.max(0, Math.min(selectionX0, selectionX1, innerWidth));
  const x1 = Math.max(
    x0,
    Math.min(Math.max(selectionX0, selectionX1), innerWidth)
  );
  const edges = x0 === x1 ? [x0] : [x0, x1];

  const plotLeft = margin.left;
  const plotTop = margin.top;
  const handleTop = plotTop + (innerHeight - HANDLE_HEIGHT_PX) / 2;

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2]"
    >
      {edges.map((edgeX) => (
        <div
          className="absolute shrink-0 rounded-lg"
          key={edgeX}
          style={{
            top: handleTop,
            left: plotLeft + edgeX - HANDLE_WIDTH_PX / 2,
            width: HANDLE_WIDTH_PX,
            height: HANDLE_HEIGHT_PX,
            backgroundColor: "var(--chart-brush-border)",
          }}
        />
      ))}
    </div>,
    container
  );
}

export function ChartBrushHandleOverlay(props: ChartBrushHandleOverlayProps) {
  const { containerRef, margin } = useChartStable();

  return (
    <ChartBrushHandleOverlayContent
      {...props}
      containerRef={containerRef}
      margin={margin}
    />
  );
}
