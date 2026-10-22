"use client";

import type { ScaleLinear, ScaleTime } from "d3-scale";
import { useCallback, useMemo, useRef, useState } from "react";
import type { LineConfig, Margin, TooltipData } from "./chart-context";
import {
  type ScatterJitterOffsets,
  scatterJitterOffset,
} from "./scatter-jitter";
import { localPointFromSvg } from "./scatter-svg";
import type { ChartSelection } from "./use-chart-interaction";
import { useScheduledTooltip } from "./use-scheduled-tooltip";
import { normalizeYAxisId } from "./y-axis-scales";

type XScale = ScaleTime<number, number>;
type YScale = ScaleLinear<number, number>;

interface UseScatterChartInteractionParams {
  xScale: XScale;
  yScale: YScale;
  yScales: Record<string, YScale>;
  data: Record<string, unknown>[];
  lines: LineConfig[];
  margin: Margin;
  xAccessor: (d: Record<string, unknown>) => Date;
  bisectDate: (
    data: Record<string, unknown>[],
    date: Date,
    lo: number
  ) => number;
  canInteract: boolean;
  /** When set, hover resolves to the nearest jittered point (2D hit test). */
  jitter?: ScatterJitterOffsets | null;
}

interface JitteredPoint {
  index: number;
  dataKey: string;
  x: number;
  y: number;
}

interface ScatterChartInteractionResult {
  tooltipData: TooltipData | null;
  setTooltipData: React.Dispatch<React.SetStateAction<TooltipData | null>>;
  selection: ChartSelection | null;
  clearSelection: () => void;
  interactionHandlers: {
    onMouseMove?: (event: React.MouseEvent<SVGGElement>) => void;
    onMouseLeave?: () => void;
    onMouseDown?: (event: React.MouseEvent<SVGGElement>) => void;
    onMouseUp?: () => void;
    onTouchStart?: (event: React.TouchEvent<SVGGElement>) => void;
    onTouchMove?: (event: React.TouchEvent<SVGGElement>) => void;
    onTouchEnd?: () => void;
  };
  interactionStyle: React.CSSProperties;
}

export function useScatterChartInteraction({
  xScale,
  yScale,
  yScales,
  data,
  lines,
  margin,
  xAccessor,
  bisectDate,
  canInteract,
  jitter = null,
}: UseScatterChartInteractionParams): ScatterChartInteractionResult {
  const [selection, setSelection] = useState<ChartSelection | null>(null);
  const {
    tooltipData,
    setTooltipData,
    scheduleTooltip,
    clearTooltip,
    resetTooltipDedupe,
  } = useScheduledTooltip<TooltipData>();

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef<number>(0);

  const resolveTooltipFromX = useCallback(
    (pixelX: number): TooltipData | null => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (!d0) {
        return null;
      }

      let d = d0;
      let finalIndex = index - 1;
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          d = d1;
          finalIndex = index;
        }
      }

      const yPositions: Record<string, number> = {};
      for (const line of lines) {
        const value = d[line.dataKey];
        if (typeof value === "number") {
          const axisScale = yScales[normalizeYAxisId(line.yAxisId)] ?? yScale;
          yPositions[line.dataKey] = axisScale(value) ?? 0;
        }
      }

      return {
        point: d,
        index: finalIndex,
        x: xScale(xAccessor(d)) ?? 0,
        yPositions,
      };
    },
    [xScale, yScale, yScales, data, lines, xAccessor, bisectDate]
  );

  /** Jittered pixel positions for every rendered point (only when jitter is on). */
  const jitteredPoints = useMemo<JitteredPoint[]>(() => {
    if (!jitter) {
      return [];
    }
    const points: JitteredPoint[] = [];
    for (const [seriesIndex, line] of lines.entries()) {
      const axisScale = yScales[normalizeYAxisId(line.yAxisId)] ?? yScale;
      for (const [index, d] of data.entries()) {
        const value = d[line.dataKey];
        if (typeof value !== "number") {
          continue;
        }
        const offset = scatterJitterOffset(jitter, index, seriesIndex);
        points.push({
          index,
          dataKey: line.dataKey,
          x: (xScale(xAccessor(d)) ?? 0) + offset.x,
          y: (axisScale(value) ?? 0) + offset.y,
        });
      }
    }
    return points;
  }, [jitter, lines, data, xScale, xAccessor, yScale, yScales]);

  const resolveTooltipFromPoint = useCallback(
    (pixelX: number, pixelY: number): TooltipData | null => {
      if (!jitter || jitteredPoints.length === 0) {
        return resolveTooltipFromX(pixelX);
      }
      let nearest: JitteredPoint | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const point of jitteredPoints) {
        const dx = point.x - pixelX;
        const dy = point.y - pixelY;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = point;
        }
      }
      if (!nearest) {
        return null;
      }
      const d = data[nearest.index];
      if (!d) {
        return null;
      }
      const xPositions: Record<string, number> = {};
      const yPositions: Record<string, number> = {};
      const baseX = xScale(xAccessor(d)) ?? 0;
      for (const [seriesIndex, line] of lines.entries()) {
        const value = d[line.dataKey];
        if (typeof value !== "number") {
          continue;
        }
        const axisScale = yScales[normalizeYAxisId(line.yAxisId)] ?? yScale;
        const offset = scatterJitterOffset(jitter, nearest.index, seriesIndex);
        xPositions[line.dataKey] = baseX + offset.x;
        yPositions[line.dataKey] = (axisScale(value) ?? 0) + offset.y;
      }
      return {
        point: d,
        index: nearest.index,
        x: baseX,
        xPositions,
        yPositions,
        activeDataKey: nearest.dataKey,
      };
    },
    [
      jitter,
      jitteredPoints,
      resolveTooltipFromX,
      data,
      lines,
      xScale,
      xAccessor,
      yScale,
      yScales,
    ]
  );

  const resolveIndexFromX = useCallback(
    (pixelX: number): number => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d0) {
        return 0;
      }
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          return index;
        }
      }
      return index - 1;
    },
    [xScale, data, xAccessor, bisectDate]
  );

  const getChartPoint = useCallback(
    (
      event: React.MouseEvent<SVGGElement> | React.TouchEvent<SVGGElement>,
      touchIndex = 0
    ): { x: number; y: number } | null => {
      const svg = event.currentTarget.ownerSVGElement;
      let clientX: number;
      let clientY: number;

      if ("touches" in event) {
        const touch = event.touches[touchIndex];
        if (!touch) {
          return null;
        }
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const point = localPointFromSvg(svg, clientX, clientY);
      if (!point) {
        return null;
      }
      return { x: point.x - margin.left, y: point.y - margin.top };
    },
    [margin.left, margin.top]
  );

  const getChartX = useCallback(
    (
      event: React.MouseEvent<SVGGElement> | React.TouchEvent<SVGGElement>,
      touchIndex = 0
    ): number | null => getChartPoint(event, touchIndex)?.x ?? null,
    [getChartPoint]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }

      if (isDraggingRef.current) {
        const startX = Math.min(dragStartXRef.current, chartX);
        const endX = Math.max(dragStartXRef.current, chartX);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
        return;
      }

      const chartPoint = getChartPoint(event);
      const tooltip = chartPoint
        ? resolveTooltipFromPoint(chartPoint.x, chartPoint.y)
        : null;
      if (tooltip) {
        scheduleTooltip(tooltip);
      }
    },
    [
      getChartX,
      getChartPoint,
      resolveTooltipFromPoint,
      resolveIndexFromX,
      scheduleTooltip,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    clearTooltip();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    setSelection(null);
  }, [clearTooltip]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }
      isDraggingRef.current = true;
      dragStartXRef.current = chartX;
      clearTooltip();
      setSelection(null);
    },
    [getChartX, clearTooltip]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    setSelection(null);
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<SVGGElement>) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const chartPoint = getChartPoint(event, 0);
        if (chartPoint === null) {
          return;
        }
        const tooltip = resolveTooltipFromPoint(chartPoint.x, chartPoint.y);
        if (tooltip) {
          scheduleTooltip(tooltip);
        }
      } else if (event.touches.length === 2) {
        event.preventDefault();
        resetTooltipDedupe();
        clearTooltip();
        const x0 = getChartX(event, 0);
        const x1 = getChartX(event, 1);
        if (x0 === null || x1 === null) {
          return;
        }
        const startX = Math.min(x0, x1);
        const endX = Math.max(x0, x1);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
      }
    },
    [
      getChartX,
      getChartPoint,
      resolveTooltipFromPoint,
      resolveIndexFromX,
      scheduleTooltip,
      resetTooltipDedupe,
      clearTooltip,
    ]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<SVGGElement>) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const chartPoint = getChartPoint(event, 0);
        if (chartPoint === null) {
          return;
        }
        const tooltip = resolveTooltipFromPoint(chartPoint.x, chartPoint.y);
        if (tooltip) {
          scheduleTooltip(tooltip);
        }
      } else if (event.touches.length === 2) {
        event.preventDefault();
        const x0 = getChartX(event, 0);
        const x1 = getChartX(event, 1);
        if (x0 === null || x1 === null) {
          return;
        }
        const startX = Math.min(x0, x1);
        const endX = Math.max(x0, x1);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
      }
    },
    [
      getChartX,
      getChartPoint,
      resolveTooltipFromPoint,
      resolveIndexFromX,
      scheduleTooltip,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    clearTooltip();
    setSelection(null);
  }, [clearTooltip]);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const interactionHandlers = canInteract
    ? {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      }
    : {};

  const interactionStyle: React.CSSProperties = {
    cursor: canInteract ? "crosshair" : "default",
    touchAction: "none",
  };

  return {
    tooltipData,
    setTooltipData,
    selection,
    clearSelection,
    interactionHandlers,
    interactionStyle,
  };
}
