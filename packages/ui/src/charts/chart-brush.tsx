"use client";

import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartBrushHandleOverlay,
  renderChartBrushHandle,
} from "./chart-brush-handle";
import {
  ChartBrushSelectionOverlay,
  type ChartBrushSelectionPattern,
} from "./chart-brush-selection-overlay";
import {
  ChartBrushTrackOverlay,
  type ChartBrushTrackOverlayStyle,
} from "./chart-brush-track-overlay";
import { chartCssVars, useChartStable } from "./chart-context";

interface BrushProps {
  xScale: unknown;
  yScale: unknown;
  width: number;
  height: number;
  onBrushEnd?: (bounds: Bounds | null) => void;
  onChange?: (bounds: Bounds | null) => void;
  brushDirection?: "horizontal" | "vertical" | "both";
  margin?: { top: number; left: number; right: number; bottom: number };
  selectedBoxStyle?: React.SVGProps<SVGRectElement>;
  handleSize?: number;
  renderBrushHandle?: (props: {
    x: number;
    y: number;
    width: number;
    height: number;
    className: string;
    isBrushActive: boolean;
  }) => React.ReactNode;
  useWindowMoveEvents?: boolean;
  initialBrushPosition?: {
    start?: { x?: number; y?: number };
    end?: { x?: number; y?: number };
  };
}

const BrushComponent = (() =>
  Brush)() as unknown as React.ComponentType<BrushProps>;

export interface ChartBrushSelection {
  start: Date;
  end: Date;
}

export interface ChartBrushProps {
  /** Callback when brush selection ends. Domain is the selected time range. */
  onSelectionChange?: (domain: ChartBrushSelection | null) => void;
  /** Brush direction. Default: "horizontal" for time range selection. */
  brushDirection?: "horizontal" | "vertical" | "both";
  /** Fill style for the selected region. Default: chart segment style. */
  selectedBoxStyle?: React.SVGProps<SVGRectElement>;
  /** Initial selection so the brush overlay is visible on load (e.g. first 50% of range). */
  initialSelection?: ChartBrushSelection | null;
  /** Current selection (e.g. from parent state). When set, a visible selection rect is drawn. */
  selection?: ChartBrushSelection | null;
  /** Use window move events for brush (can fix coordinate offset when SVG is in transformed container). Default: true for brush-in-strip. */
  useWindowMoveEvents?: boolean;
  /** Backdrop blur on dimmed track (0–5 px). Default: 1.5 */
  blurPx?: number;
  /** Fade dimmed regions at the outer track edges. Default: true */
  fadeOuterEdges?: boolean;
  /** Optional pattern overlay inside the brush selection window. */
  selectionPattern?: ChartBrushSelectionPattern;
}

interface ChartBrushInnerProps extends ChartBrushTrackOverlayStyle {
  brushDirection?: ChartBrushProps["brushDirection"];
  selectedBoxStyle?: ChartBrushProps["selectedBoxStyle"];
  initialSelection?: ChartBrushProps["initialSelection"];
  useWindowMoveEvents?: ChartBrushProps["useWindowMoveEvents"];
  xScale: ReturnType<typeof useChartStable>["xScale"];
  yScale: ReturnType<typeof useChartStable>["yScale"];
  innerWidth: number;
  innerHeight: number;
  margin: ReturnType<typeof useChartStable>["margin"];
  onBrushPreview?: (bounds: Bounds | null) => void;
  onBrushCommit: (bounds: Bounds | null) => void;
  selectionPattern?: ChartBrushSelectionPattern;
}

function toDate(value: number | Date | unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return new Date(Number(value));
}

function boundsToPixelExtent(
  bounds: Bounds | null,
  xScale: ReturnType<typeof useChartStable>["xScale"],
  innerWidth: number
): { x0: number; x1: number } | null {
  if (
    !bounds ||
    typeof bounds.x0 === "undefined" ||
    typeof bounds.x1 === "undefined"
  ) {
    return null;
  }

  const start = toDate(bounds.x0);
  const end = toDate(bounds.x1);
  const xScaleFn = xScale as (d: Date) => number;
  const x0 = Math.max(0, xScaleFn(start < end ? start : end) ?? 0);
  const x1 = Math.min(
    innerWidth,
    xScaleFn(end > start ? end : start) ?? innerWidth
  );

  if (x1 <= x0) {
    return null;
  }

  return { x0, x1 };
}

const ChartBrushInner = memo(function ChartBrushInner({
  brushDirection = "horizontal",
  selectedBoxStyle,
  initialSelection,
  useWindowMoveEvents = true,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  margin,
  onBrushPreview,
  onBrushCommit,
  blurPx,
  fadeOuterEdges,
  selectionPattern,
}: ChartBrushInnerProps) {
  const initialBrushPosition = useMemo(() => {
    if (!initialSelection || innerWidth <= 0 || innerHeight <= 0) {
      return undefined;
    }
    const xScaleFn = xScale as (d: Date) => number;
    const x0 = Math.max(0, xScaleFn(initialSelection.start) ?? 0);
    const x1 = Math.min(
      innerWidth,
      xScaleFn(initialSelection.end) ?? innerWidth
    );
    if (x1 <= x0) {
      return undefined;
    }
    return {
      start: { x: x0, y: 0 },
      end: { x: x1, y: innerHeight },
    };
  }, [initialSelection, xScale, innerWidth, innerHeight]);

  const [pixelExtent, setPixelExtent] = useState(() => ({
    x0: initialBrushPosition?.start.x ?? 0,
    x1: initialBrushPosition?.end.x ?? innerWidth,
  }));

  useEffect(() => {
    setPixelExtent({
      x0: initialBrushPosition?.start.x ?? 0,
      x1: initialBrushPosition?.end.x ?? innerWidth,
    });
  }, [initialBrushPosition, innerWidth]);

  const updatePixelExtent = useCallback(
    (bounds: Bounds | null) => {
      const pixels = boundsToPixelExtent(bounds, xScale, innerWidth);
      if (pixels) {
        setPixelExtent(pixels);
      }
    },
    [innerWidth, xScale]
  );

  const handleBrushPreview = useCallback(
    (bounds: Bounds | null) => {
      updatePixelExtent(bounds);
      onBrushPreview?.(bounds);
    },
    [onBrushPreview, updatePixelExtent]
  );

  const handleBrushCommit = useCallback(
    (bounds: Bounds | null) => {
      updatePixelExtent(bounds);
      onBrushCommit(bounds);
    },
    [onBrushCommit, updatePixelExtent]
  );

  const defaultStyle = {
    fill: "transparent",
    fillOpacity: 0,
    stroke: chartCssVars.brushBorder,
    strokeWidth: 1,
  };

  return (
    <g className="chart-brush">
      <ChartBrushTrackOverlay
        blurPx={blurPx}
        fadeOuterEdges={fadeOuterEdges}
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        selectionX0={pixelExtent.x0}
        selectionX1={pixelExtent.x1}
      />
      <ChartBrushSelectionOverlay
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        pattern={selectionPattern}
        selectionX0={pixelExtent.x0}
        selectionX1={pixelExtent.x1}
      />
      <ChartBrushHandleOverlay
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        selectionX0={pixelExtent.x0}
        selectionX1={pixelExtent.x1}
      />
      <BrushComponent
        brushDirection={brushDirection}
        handleSize={8}
        height={innerHeight}
        initialBrushPosition={initialBrushPosition}
        key={`brush-${innerWidth}-${innerHeight}`}
        margin={
          useWindowMoveEvents
            ? margin
            : { top: 0, left: 0, right: 0, bottom: 0 }
        }
        onBrushEnd={handleBrushCommit}
        onChange={handleBrushPreview}
        renderBrushHandle={renderChartBrushHandle}
        selectedBoxStyle={selectedBoxStyle ?? defaultStyle}
        useWindowMoveEvents={useWindowMoveEvents}
        width={innerWidth}
        xScale={xScale}
        yScale={yScale}
      />
    </g>
  );
});

export function ChartBrush({
  onSelectionChange,
  brushDirection = "horizontal",
  selectedBoxStyle,
  initialSelection,
  selection: _selection,
  useWindowMoveEvents = true,
  blurPx,
  fadeOuterEdges,
  selectionPattern,
}: ChartBrushProps) {
  const { xScale, yScale, innerWidth, innerHeight, margin, isLoaded } =
    useChartStable();

  const boundsToSelection = useCallback(
    (bounds: Bounds | null): ChartBrushSelection | null => {
      if (
        !bounds ||
        typeof bounds.x0 === "undefined" ||
        typeof bounds.x1 === "undefined"
      ) {
        return null;
      }
      const start = toDate(bounds.x0);
      const end = toDate(bounds.x1);
      if (start.getTime() === end.getTime()) {
        return null;
      }
      return {
        start: start < end ? start : end,
        end: end > start ? end : start,
      };
    },
    []
  );

  const notifySelectionChange = useCallback(
    (bounds: Bounds | null) => {
      if (!onSelectionChange) {
        return;
      }
      onSelectionChange(boundsToSelection(bounds));
    },
    [onSelectionChange, boundsToSelection]
  );

  const handleBrushPreview = useCallback(
    (bounds: Bounds | null) => {
      notifySelectionChange(bounds);
    },
    [notifySelectionChange]
  );

  const handleBrushCommit = useCallback(
    (bounds: Bounds | null) => {
      notifySelectionChange(bounds);
    },
    [notifySelectionChange]
  );

  if (!isLoaded || innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  return (
    <ChartBrushInner
      blurPx={blurPx}
      brushDirection={brushDirection}
      fadeOuterEdges={fadeOuterEdges}
      initialSelection={initialSelection}
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      margin={margin}
      onBrushCommit={handleBrushCommit}
      onBrushPreview={handleBrushPreview}
      selectedBoxStyle={selectedBoxStyle}
      selectionPattern={selectionPattern}
      useWindowMoveEvents={useWindowMoveEvents}
      xScale={xScale}
      yScale={yScale}
    />
  );
}

ChartBrush.displayName = "ChartBrush";

export default ChartBrush;
