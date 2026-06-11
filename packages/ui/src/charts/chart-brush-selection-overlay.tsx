"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { ChartBrushOverlayHost } from "./chart-brush-track-overlay";
import { useChartStable } from "./chart-context";
import {
  type PatternPresetId,
  type PatternPresetOptions,
  renderPatternPreset,
} from "./pattern-preset";

export type ChartBrushPatternPreset = PatternPresetId;

export interface ChartBrushSelectionPattern extends PatternPresetOptions {
  preset: ChartBrushPatternPreset;
  color: string;
  opacity?: number;
}

export interface ChartBrushSelectionOverlayProps {
  innerWidth: number;
  innerHeight: number;
  selectionX0: number;
  selectionX1: number;
  pattern?: ChartBrushSelectionPattern;
}

/** Pattern fill between brush handles (`z-[1]`, above blur panes). */
export function ChartBrushSelectionOverlayContent({
  containerRef,
  margin,
  innerWidth,
  innerHeight,
  selectionX0,
  selectionX1,
  pattern,
}: ChartBrushSelectionOverlayProps & ChartBrushOverlayHost) {
  const [mounted, setMounted] = useState(false);
  const patternId = useId().replace(/:/g, "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container && pattern && pattern.preset !== "none")) {
    return null;
  }

  const x0 = Math.max(0, Math.min(selectionX0, selectionX1, innerWidth));
  const x1 = Math.max(
    x0,
    Math.min(Math.max(selectionX0, selectionX1), innerWidth)
  );
  const selectionWidth = x1 - x0;
  if (selectionWidth <= 0) {
    return null;
  }

  const plotLeft = margin.left;
  const plotTop = margin.top;
  const patternNode = renderPatternPreset(pattern.preset, patternId, {
    color: pattern.color,
    scale: pattern.scale,
    strokeWidth: pattern.strokeWidth,
    radius: pattern.radius,
    complement: pattern.complement,
    fill: pattern.fill,
    tileBackground: pattern.tileBackground,
  });
  if (!patternNode) {
    return null;
  }

  return createPortal(
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1]"
      height="100%"
      width="100%"
    >
      <defs>{patternNode}</defs>
      <rect
        fill={`url(#${patternId})`}
        fillOpacity={pattern.opacity ?? 1}
        height={innerHeight}
        width={selectionWidth}
        x={plotLeft + x0}
        y={plotTop}
      />
    </svg>,
    container
  );
}

export function ChartBrushSelectionOverlay(
  props: ChartBrushSelectionOverlayProps
) {
  const { containerRef, margin } = useChartStable();

  return (
    <ChartBrushSelectionOverlayContent
      {...props}
      containerRef={containerRef}
      margin={margin}
    />
  );
}
