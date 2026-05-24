"use client";

import type { RefObject } from "react";
import { useCallback, useMemo } from "react";
import type { TooltipData } from "./chart-context";
import { findPathLengthAtX } from "./path-stroke-utils";
import type { ChartSelection } from "./use-chart-interaction";

interface UseLineSegmentHighlightOptions {
  pathRef: RefObject<SVGPathElement | null>;
  pathLength: number;
  data: Record<string, unknown>[];
  tooltipData: TooltipData | null;
  selection: ChartSelection | null;
  xScale: (value: Date | number) => number | undefined;
  xAccessor: (datum: Record<string, unknown>) => Date | number;
}

export function useLineSegmentHighlight({
  pathRef,
  pathLength,
  data,
  tooltipData,
  selection,
  xScale,
  xAccessor,
}: UseLineSegmentHighlightOptions) {
  const findLengthAtX = useCallback(
    (targetX: number) =>
      findPathLengthAtX(pathRef.current, pathLength, targetX),
    [pathLength, pathRef]
  );

  return useMemo(() => {
    if (!pathRef.current || pathLength === 0) {
      return { startLength: 0, segmentLength: 0, isActive: false };
    }

    if (selection?.active) {
      const startLength = findLengthAtX(selection.startX);
      const endLength = findLengthAtX(selection.endX);
      return {
        startLength,
        segmentLength: endLength - startLength,
        isActive: true,
      };
    }

    if (!tooltipData) {
      return { startLength: 0, segmentLength: 0, isActive: false };
    }

    const idx = tooltipData.index;
    const startIdx = Math.max(0, idx - 1);
    const endIdx = Math.min(data.length - 1, idx + 1);
    const startPoint = data[startIdx];
    const endPoint = data[endIdx];
    if (!(startPoint && endPoint)) {
      return { startLength: 0, segmentLength: 0, isActive: false };
    }

    const startX = xScale(xAccessor(startPoint)) ?? 0;
    const endX = xScale(xAccessor(endPoint)) ?? 0;
    const startLength = findLengthAtX(startX);
    const endLength = findLengthAtX(endX);

    return {
      startLength,
      segmentLength: endLength - startLength,
      isActive: true,
    };
  }, [
    tooltipData,
    selection,
    data,
    xScale,
    pathLength,
    xAccessor,
    findLengthAtX,
    pathRef,
  ]);
}
