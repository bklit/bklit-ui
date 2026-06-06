"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useChartStable } from "./chart-context";
import { PatternLines } from "./visx-pattern";

export type ChartBrushPatternPreset =
  | "none"
  | "diagonal"
  | "horizontal"
  | "vertical"
  | "cross"
  | "dots"
  | "accent";

export interface ChartBrushSelectionPattern {
  preset: ChartBrushPatternPreset;
  color: string;
}

function brushPatternLines(
  preset: ChartBrushPatternPreset,
  id: string,
  color: string
) {
  const common = {
    id,
    height: 6,
    width: 6,
    strokeWidth: 1,
  };

  switch (preset) {
    case "diagonal":
      return (
        <PatternLines {...common} orientation={["diagonal"]} stroke={color} />
      );
    case "horizontal":
      return (
        <PatternLines {...common} orientation={["horizontal"]} stroke={color} />
      );
    case "vertical":
      return (
        <PatternLines {...common} orientation={["vertical"]} stroke={color} />
      );
    case "cross":
      return (
        <PatternLines
          {...common}
          height={8}
          orientation={["diagonal", "diagonalRightToLeft"]}
          stroke={color}
          width={8}
        />
      );
    case "dots":
      return (
        <PatternLines
          {...common}
          height={4}
          orientation={["diagonal"]}
          stroke={color}
          strokeWidth={2}
          width={4}
        />
      );
    case "accent":
      return (
        <PatternLines {...common} orientation={["diagonal"]} stroke="#e879f9" />
      );
    default:
      return null;
  }
}

export interface ChartBrushSelectionOverlayProps {
  innerWidth: number;
  innerHeight: number;
  selectionX0: number;
  selectionX1: number;
  pattern?: ChartBrushSelectionPattern;
}

/** Pattern fill between brush handles (`z-[1]`, above blur panes). */
export function ChartBrushSelectionOverlay({
  innerWidth,
  innerHeight,
  selectionX0,
  selectionX1,
  pattern,
}: ChartBrushSelectionOverlayProps) {
  const { containerRef, margin } = useChartStable();
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
  const patternNode = brushPatternLines(
    pattern.preset,
    patternId,
    pattern.color
  );
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
        height={innerHeight}
        width={selectionWidth}
        x={plotLeft + x0}
        y={plotTop}
      />
    </svg>,
    container
  );
}
