"use client";

import type React from "react";
import {
  Fragment,
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
  type BrushInitialPosition,
  type BrushingType,
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

  const commitState = useCallback((next: BrushState) => {
    stateRef.current = next;
    setState(next);
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

  // Which drag starts is decided by DOM hit-testing, as in visx: the overlay
  // draws a new selection, the selection rect moves it, a handle resizes.
  const handleOverlayPointerDown = useCallback(
    (event: React.PointerEvent<SVGRectElement>) => {
      if (dragRef.current) {
        return;
      }
      const point = localPoint(event) ?? { x: 0, y: 0 };
      const next = beginBrushSelect(stateRef.current, {
        x: point.x - startMargin.left,
        y: point.y - startMargin.top,
      });
      startDrag(event, next, point);
    },
    [startDrag, startMargin.left, startMargin.top]
  );

  const handleDragPointerDown = useCallback(
    (
      type: Exclude<BrushingType, "select">,
      event: React.PointerEvent<Element>
    ) => {
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
      if (!drag || event.pointerId !== drag.pointerId) {
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
    [applyOffset, moveMode]
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

  // visx resets on a double-click of the overlay (not the selection).
  const handleOverlayDoubleClick = useCallback(() => {
    const next = idleBrushState();
    commitState(next);
    onChange(toDomain(next, xScale));
  }, [commitState, onChange, xScale]);

  const selection = brushSelectionRect(state.extent);
  const isBrushActive = state.extent.x0 !== -1 && state.extent.x1 !== -1;
  const { brushingType } = state;
  const selectionLocked = state.isBrushing || state.activeHandle !== null;
  const fill = "transparent";

  // Same tree as visx 4.0.0 BaseBrush (Group > overlay Drag, BrushSelection,
  // right / left BrushHandle), including the transparent "dragging" rects
  // each @visx/drag <Drag> adds while its drag is in progress. Moves and
  // pointer-up reach the group through pointer capture on the pressed target.
  return (
    <g
      className="visx-group visx-brush"
      onLostPointerCapture={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      transform="translate(0, 0)"
    >
      {/* Attribute objects keep visx's attribute order in the DOM. */}
      {brushingType === "select" ? <rect {...{ width, height, fill }} /> : null}
      <rect
        {...{
          className: "visx-bar visx-brush-overlay",
          fill,
          x: 0,
          y: 0,
          width,
          height,
          onDoubleClick: handleOverlayDoubleClick,
          onPointerDown: handleOverlayPointerDown,
          style: { cursor: "crosshair" },
        }}
      />
      {brushingType === "move" ? (
        <rect {...{ width: selection.width, height: selection.height, fill }} />
      ) : null}
      <g>
        {brushingType === "move" ? (
          <rect {...{ width, height, fill, style: { cursor: "move" } }} />
        ) : null}
        <rect
          {...{
            ...selection,
            className: "visx-brush-selection",
            onPointerDown: (event: React.PointerEvent<SVGRectElement>) =>
              handleDragPointerDown("move", event),
            style: {
              pointerEvents: selectionLocked ? "none" : "all",
              cursor: "move",
            },
            ...selectedBoxStyle,
          }}
        />
      </g>
      {brushHandleRects(state.extent, handleSize, height).map((handle) => (
        <Fragment key={`handle-${handle.type}`}>
          {brushingType === handle.type ? (
            <rect {...{ width, height, fill }} />
          ) : null}
          <g>
            {brushingType === handle.type ? (
              <rect
                {...{ fill, width, height, style: { cursor: "ew-resize" } }}
              />
            ) : null}
            <g
              onPointerDown={(event) =>
                handleDragPointerDown(handle.type, event)
              }
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
          </g>
        </Fragment>
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
