"use client";

import type React from "react";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChartBrushHandleOverlay,
  renderChartBrushHandle,
} from "./chart-brush-handle";
import {
  ChartBrushSelectionOverlay,
  type ChartBrushSelectionPattern,
} from "./chart-brush-selection-overlay";
import {
  type BrushDirection,
  type BrushDomainBounds,
  type BrushHandleType,
  type BrushInitialPosition,
  type BrushMoveMode,
  type BrushPoint,
  type BrushState,
  beginBrushDrag,
  beginBrushSelect,
  brushExtentToDomain,
  brushHandleRects,
  brushSelectionRect,
  createBrushState,
  dragBrush,
  endBrush,
  hitTestBrushTrack,
  idleBrushState,
} from "./chart-brush-state";
import {
  ChartBrushTrackOverlay,
  type ChartBrushTrackOverlayStyle,
} from "./chart-brush-track-overlay";
import { chartCssVars, useChartStable } from "./chart-context";
import { localPoint } from "./local-point";

type Bounds = BrushDomainBounds;

interface BrushMargin {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const ZERO_MARGIN: BrushMargin = { top: 0, left: 0, right: 0, bottom: 0 };

const DEFAULT_SELECTED_BOX_STYLE: React.SVGProps<SVGRectElement> = {
  fill: "transparent",
  fillOpacity: 0,
  stroke: chartCssVars.brushBorder,
  strokeWidth: 1,
};

/** `@visx/brush` debounces window move events by 1 ms; kept for parity. */
const WINDOW_MOVE_DEBOUNCE_MS = 1;

interface BrushInteractionProps {
  xScale: unknown;
  width: number;
  height: number;
  brushDirection: BrushDirection;
  handleSize: number;
  initialBrushPosition?: BrushInitialPosition;
  /** Offset subtracted from the SVG pointer position when a selection starts. */
  startMargin: BrushMargin;
  /** Real plot margin, for hit-testing the track in plot coordinates. */
  plotMargin: BrushMargin;
  moveMode: BrushMoveMode;
  selectedBoxStyle: React.SVGProps<SVGRectElement>;
  onChange: (bounds: Bounds | null) => void;
  onBrushEnd: (bounds: Bounds | null) => void;
}

interface ActiveBrushDrag {
  pointerId: number;
  target: Element;
  pageX: number;
  pageY: number;
  /** SVG-space pointer position at pointer down. */
  local: BrushPoint;
}

function scaleInverter(scale: unknown): (value: number) => unknown {
  const invert = (scale as { invert?: (value: number) => unknown } | null)
    ?.invert;
  // Without `invert` visx reports `{ x0: 0, x1: 0 }` (NaN -> `|| 0`).
  return typeof invert === "function"
    ? (value) => invert.call(scale, value)
    : () => Number.NaN;
}

function toDomain(state: BrushState, scale: unknown): Bounds | null {
  return brushExtentToDomain(state.extent, scaleInverter(scale));
}

/** Cursor on the captured track rect while dragging. */
function trackDragCursor(state: BrushState, direction: BrushDirection): string {
  if (state.brushingType === "move") {
    return "move";
  }
  // visx: once a new selection has an extent the pointer sits on its moving
  // edge, where the handle hit rect shows `ew-resize`.
  if (direction !== "vertical" && state.extent.x0 >= 0) {
    return "ew-resize";
  }
  return "crosshair";
}

/**
 * Hand-written replacement for `@visx/brush` `Brush`: one transparent hit rect
 * for the track (draw a new selection, or move the current one), the visible
 * selection rect, and the two edge handles. Pointer capture replaces visx's
 * window listeners; `chart-brush-state.ts` holds the parity rules.
 */
const ChartBrushInteraction = memo(function ChartBrushInteraction({
  xScale,
  width,
  height,
  brushDirection,
  handleSize,
  initialBrushPosition,
  startMargin,
  plotMargin,
  moveMode,
  selectedBoxStyle,
  onChange,
  onBrushEnd,
}: BrushInteractionProps) {
  const stage = useMemo(
    () => ({ width, height, direction: brushDirection }),
    [width, height, brushDirection]
  );
  const [state, setState] = useState(() =>
    createBrushState(stage, initialBrushPosition)
  );
  const stateRef = useRef(state);
  const dragRef = useRef<ActiveBrushDrag | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMoveRef = useRef<{ pageX: number; pageY: number } | null>(null);

  // Latest props for the debounced window-move timer.
  const latestRef = useRef({ stage, xScale, onChange });
  useLayoutEffect(() => {
    latestRef.current = { stage, xScale, onChange };
  });

  useEffect(
    () => () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
    },
    []
  );

  const strokePad =
    typeof selectedBoxStyle.strokeWidth === "number"
      ? selectedBoxStyle.strokeWidth / 2
      : 0;

  const hitTestTrack = useCallback(
    (point: BrushPoint) =>
      hitTestBrushTrack(
        { x: point.x - plotMargin.left, y: point.y - plotMargin.top },
        stateRef.current.extent,
        strokePad
      ),
    [plotMargin.left, plotMargin.top, strokePad]
  );

  const commitState = useCallback((next: BrushState) => {
    stateRef.current = next;
    setState(next);
    const drag = dragRef.current;
    if (
      drag &&
      drag.target instanceof SVGRectElement &&
      drag.target.classList.contains("visx-brush-overlay")
    ) {
      drag.target.style.cursor = next.isBrushing
        ? trackDragCursor(next, latestRef.current.stage.direction)
        : "crosshair";
    }
  }, []);

  const startDrag = useCallback(
    (
      event: React.PointerEvent<Element>,
      next: BrushState,
      local: BrushPoint
    ) => {
      const target = event.target as Element;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer already gone (synthetic event); moves still bubble here.
      }
      dragRef.current = {
        pointerId: event.pointerId,
        target,
        pageX: event.pageX,
        pageY: event.pageY,
        local,
      };
      commitState(next);
      onChange(toDomain(next, xScale));
    },
    [commitState, onChange, xScale]
  );

  const handleTrackPointerDown = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (dragRef.current) {
        return;
      }
      const point = localPoint(event) ?? { x: 0, y: 0 };
      const current = stateRef.current;
      const next =
        hitTestTrack(point) === "move"
          ? beginBrushDrag(current, "move")
          : beginBrushSelect(current, {
              x: point.x - startMargin.left,
              y: point.y - startMargin.top,
            });
      startDrag(event, next, point);
    },
    [hitTestTrack, startDrag, startMargin.left, startMargin.top]
  );

  const handleHandlePointerDown = useCallback(
    (type: BrushHandleType, event: React.PointerEvent<SVGGElement>) => {
      if (dragRef.current) {
        return;
      }
      const point = localPoint(event) ?? { x: 0, y: 0 };
      startDrag(event, beginBrushDrag(stateRef.current, type), point);
    },
    [startDrag]
  );

  const applyOffset = useCallback(
    (offset: BrushPoint) => {
      const latest = latestRef.current;
      const current = stateRef.current;
      if (!current.isBrushing) {
        return;
      }
      const next = dragBrush(current, offset, latest.stage, moveMode);
      commitState(next);
      latest.onChange(toDomain(next, latest.xScale));
    },
    [commitState, moveMode]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<Element>) => {
      const drag = dragRef.current;
      if (!drag) {
        // Hover cursor on the track: `move` over the selection.
        if (event.currentTarget instanceof SVGRectElement) {
          const point = localPoint(event) ?? { x: 0, y: 0 };
          event.currentTarget.style.cursor =
            hitTestTrack(point) === "move" ? "move" : "crosshair";
        }
        return;
      }
      if (event.pointerId !== drag.pointerId) {
        return;
      }
      if (moveMode === "local") {
        const point = localPoint(event) ?? { x: 0, y: 0 };
        applyOffset({ x: point.x - drag.local.x, y: point.y - drag.local.y });
        return;
      }
      pendingMoveRef.current = { pageX: event.pageX, pageY: event.pageY };
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
      moveTimerRef.current = setTimeout(() => {
        moveTimerRef.current = null;
        const pending = pendingMoveRef.current;
        const active = dragRef.current;
        if (!(pending && active)) {
          return;
        }
        applyOffset({
          x: pending.pageX - active.pageX,
          y: pending.pageY - active.pageY,
        });
      }, WINDOW_MOVE_DEBOUNCE_MS);
    },
    [applyOffset, hitTestTrack, moveMode]
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<Element>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }
      // Like visx, a window move still waiting on its debounce is dropped.
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
        moveTimerRef.current = null;
      }
      const result = endBrush(stateRef.current, moveMode);
      if (result) {
        commitState(result.state);
      }
      dragRef.current = null;
      try {
        if (drag.target.hasPointerCapture(drag.pointerId)) {
          drag.target.releasePointerCapture(drag.pointerId);
        }
      } catch {
        // Element already detached.
      }
      if (!result) {
        return;
      }
      onBrushEnd(toDomain(result.state, xScale));
      for (let i = 0; i < result.changeCount; i++) {
        onChange(toDomain(result.state, xScale));
      }
    },
    [commitState, moveMode, onBrushEnd, onChange, xScale]
  );

  const handleTrackDoubleClick = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      // visx resets on a double-click of the overlay, not of the selection.
      const point = localPoint(event) ?? { x: 0, y: 0 };
      if (hitTestTrack(point) === "move") {
        return;
      }
      const next = idleBrushState();
      commitState(next);
      onChange(toDomain(next, xScale));
    },
    [commitState, hitTestTrack, onChange, xScale]
  );

  const selection = brushSelectionRect(state.extent);
  const isBrushActive = state.extent.x0 !== -1 && state.extent.x1 !== -1;

  return (
    // Class names kept from the visx markup (CSS / test hooks).
    <g className="visx-group visx-brush" transform="translate(0, 0)">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: brush track pointer area */}
      <rect
        className="visx-bar visx-brush-overlay"
        fill="transparent"
        height={height}
        onDoubleClick={handleTrackDoubleClick}
        onLostPointerCapture={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        style={{ cursor: "crosshair", touchAction: "none" }}
        width={width}
        x={0}
        y={0}
      />
      <rect
        className="visx-brush-selection"
        height={selection.height}
        width={selection.width}
        x={selection.x}
        y={selection.y}
        {...selectedBoxStyle}
        pointerEvents="none"
        style={{ ...selectedBoxStyle.style, pointerEvents: "none" }}
      />
      {brushHandleRects(state.extent, handleSize, height).map((handle) => (
        <g
          key={`handle-${handle.type}`}
          onLostPointerCapture={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerDown={(event) => handleHandlePointerDown(handle.type, event)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          style={{ touchAction: "none" }}
        >
          {renderChartBrushHandle({
            x: handle.x,
            y: handle.y,
            width: handle.width,
            height: handle.height,
            className: `visx-brush-handle-${handle.type}`,
            isBrushActive,
          })}
        </g>
      ))}
    </g>
  );
});

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

  // Reset the extent when the initial selection / width change — adjusted
  // during render ("store previous props in state"), not setState in an effect.
  const [extentSource, setExtentSource] = useState({
    initialBrushPosition,
    innerWidth,
  });
  if (
    extentSource.initialBrushPosition !== initialBrushPosition ||
    extentSource.innerWidth !== innerWidth
  ) {
    setExtentSource({ initialBrushPosition, innerWidth });
    setPixelExtent({
      x0: initialBrushPosition?.start.x ?? 0,
      x1: initialBrushPosition?.end.x ?? innerWidth,
    });
  }

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
      <ChartBrushInteraction
        brushDirection={brushDirection}
        handleSize={8}
        height={innerHeight}
        initialBrushPosition={initialBrushPosition}
        key={`brush-${innerWidth}-${innerHeight}`}
        moveMode={useWindowMoveEvents ? "window" : "local"}
        onBrushEnd={handleBrushCommit}
        onChange={handleBrushPreview}
        plotMargin={margin}
        selectedBoxStyle={selectedBoxStyle ?? DEFAULT_SELECTED_BOX_STYLE}
        startMargin={useWindowMoveEvents ? margin : ZERO_MARGIN}
        width={innerWidth}
        xScale={xScale}
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
  const { xScale, innerWidth, innerHeight, margin, isLoaded } =
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
    />
  );
}

ChartBrush.displayName = "ChartBrush";

export default ChartBrush;
