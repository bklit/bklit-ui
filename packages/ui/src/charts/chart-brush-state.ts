/**
 * Pure state machine behind `ChartBrush`, reproducing `@visx/brush` 4.0.0
 * (`Brush` + `BaseBrush` + `BrushSelection` + `BrushHandle` + `@visx/drag`)
 * step for step, so the emitted selections stay identical:
 *
 * - Pixel state is `start` / `end` (committed corners) plus `extent` (what is
 *   drawn). An empty brush has `extent` -1 on every side.
 * - Pointer down on the track starts a new selection at the pointer
 *   (`extent` -1, so the brush emits `null`); down on the selection moves it;
 *   down on a handle resizes from that edge. Each start emits `onChange`.
 * - Moves are offsets from the pointer-down position. With window move events
 *   (the bklit default) the offset is in page pixels and every mode is clamped
 *   to the track; without, it is in SVG units and only `move` / the right
 *   handle are clamped (visx behaviour).
 * - Pointer up commits: `onBrushEnd` then `onChange` (local mode emits one
 *   more `onChange` for `move` / handle drags). A click without a drag on the
 *   track commits `null`.
 * - Pixels convert to the domain through `scale.invert`, widened by visx's
 *   `SAFE_PIXEL` (2 px) on each side; a zero-width extent inverts to
 *   start === end, which `ChartBrush` reports as `null`.
 */

export type BrushDirection = "horizontal" | "vertical" | "both";

/** What a pointer drag does: draw a new selection, move it, or resize it. */
export type BrushingType = "select" | "move" | "left" | "right";

export type BrushHandleType = "left" | "right";

export interface BrushPoint {
  x: number;
  y: number;
}

export interface BrushExtent {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface BrushStage {
  width: number;
  height: number;
  direction: BrushDirection;
}

export interface BrushState {
  start: BrushPoint;
  end: BrushPoint;
  extent: BrushExtent;
  isBrushing: boolean;
  brushingType: BrushingType | undefined;
  /** Only set by local-mode handle drags (visx `activeHandle`). */
  activeHandle: BrushHandleType | null;
}

/**
 * `true` = window move events (page-pixel offsets, everything clamped to the
 * track); `false` = local pointer events on the brush (SVG-unit offsets).
 */
export type BrushMoveMode = "window" | "local";

/** visx `SAFE_PIXEL`: the selection is widened by this many px before inverting. */
export const BRUSH_SAFE_PIXEL = 2;

const EMPTY_EXTENT: BrushExtent = { x0: -1, x1: -1, y0: -1, y1: -1 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** visx `BaseBrush.getExtent`: normalise two corners for the brush direction. */
export function getBrushExtent(
  start: Partial<BrushPoint>,
  end: Partial<BrushPoint>,
  stage: BrushStage
): BrushExtent {
  const { direction, width, height } = stage;
  return {
    x0: direction === "vertical" ? 0 : Math.min(start.x || 0, end.x || 0),
    x1: direction === "vertical" ? width : Math.max(start.x || 0, end.x || 0),
    y0: direction === "horizontal" ? 0 : Math.min(start.y || 0, end.y || 0),
    y1:
      direction === "horizontal" ? height : Math.max(start.y || 0, end.y || 0),
  };
}

export interface BrushInitialPosition {
  start?: { x?: number; y?: number };
  end?: { x?: number; y?: number };
}

/** visx `BaseBrush` constructor state (`initialBrushPosition` in pixels). */
export function createBrushState(
  stage: BrushStage,
  initial?: BrushInitialPosition | null
): BrushState {
  const extent = initial
    ? getBrushExtent(initial.start ?? {}, initial.end ?? {}, stage)
    : { ...EMPTY_EXTENT };
  return {
    start: { x: Math.max(0, extent.x0), y: Math.max(0, extent.y0) },
    end: { x: Math.max(0, extent.x1), y: Math.max(0, extent.y1) },
    extent,
    isBrushing: false,
    brushingType: undefined,
    activeHandle: null,
  };
}

/** visx `BaseBrush.getIdleState` (double-click on the track). */
export function idleBrushState(): BrushState {
  return {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    extent: { ...EMPTY_EXTENT },
    isBrushing: false,
    brushingType: undefined,
    activeHandle: null,
  };
}

/** Pointer down on the track: start a new selection at `point` (plot px). */
export function beginBrushSelect(
  state: BrushState,
  point: BrushPoint
): BrushState {
  return {
    ...state,
    start: point,
    end: { ...point },
    extent: { ...EMPTY_EXTENT },
    isBrushing: true,
    brushingType: "select",
  };
}

/** Pointer down on the selection (`move`) or a handle. */
export function beginBrushDrag(
  state: BrushState,
  type: Exclude<BrushingType, "select">
): BrushState {
  return { ...state, brushingType: type, isBrushing: true };
}

function moveSelection(
  state: BrushState,
  offset: BrushPoint,
  stage: BrushStage
): BrushState {
  const { start, end } = state;
  const validDx =
    offset.x > 0
      ? Math.min(offset.x, stage.width - end.x)
      : Math.max(offset.x, 0 - start.x);
  const validDy =
    offset.y > 0
      ? Math.min(offset.y, stage.height - end.y)
      : Math.max(offset.y, 0 - start.y);
  return {
    ...state,
    isBrushing: true,
    extent: {
      ...state.extent,
      x0: start.x + validDx,
      x1: end.x + validDx,
      y0: start.y + validDy,
      y1: end.y + validDy,
    },
  };
}

/**
 * Pointer moved by `offset` since pointer down. Returns `state` unchanged when
 * no drag is in progress.
 */
export function dragBrush(
  state: BrushState,
  offset: BrushPoint,
  stage: BrushStage,
  mode: BrushMoveMode
): BrushState {
  const { brushingType } = state;
  if (!(state.isBrushing && brushingType)) {
    return state;
  }
  if (brushingType === "move") {
    return moveSelection(state, offset, stage);
  }
  if (brushingType === "select") {
    const end =
      mode === "window"
        ? {
            x: clamp(state.start.x + offset.x, 0, stage.width),
            y: clamp(state.start.y + offset.y, 0, stage.height),
          }
        : { x: state.start.x + offset.x, y: state.start.y + offset.y };
    return { ...state, end, extent: getBrushExtent(state.start, end, stage) };
  }

  // Resize from the left / right handle.
  if (mode === "window") {
    const { x: x0, y: y0 } = state.start;
    const { x: x1, y: y1 } = state.end;
    return {
      ...state,
      isBrushing: true,
      extent: {
        ...state.extent,
        ...getBrushExtent(
          {
            x:
              brushingType === "left"
                ? clamp(x0 + offset.x, 0, stage.width)
                : x0,
            y: y0,
          },
          {
            x:
              brushingType === "right"
                ? clamp(x1 + offset.x, 0, stage.width)
                : x1,
            y: y1,
          },
          stage
        ),
      },
    };
  }
  const { start, end } = state;
  if (brushingType === "right") {
    const move = Math.max(start.x, end.x) + offset.x;
    return {
      ...state,
      activeHandle: "right",
      extent: {
        ...state.extent,
        x0: Math.max(Math.min(move, start.x), 0),
        x1: Math.min(Math.max(move, start.x), stage.width),
      },
    };
  }
  const move = Math.min(start.x, end.x) + offset.x;
  return {
    ...state,
    activeHandle: "left",
    extent: {
      ...state.extent,
      x0: Math.min(move, end.x),
      x1: Math.max(move, end.x),
    },
  };
}

export interface BrushEndResult {
  state: BrushState;
  /** How many `onChange` calls follow the single `onBrushEnd`. */
  changeCount: 1 | 2;
}

/** Pointer up: commit the drawn extent. `null` when no drag was in progress. */
export function endBrush(
  state: BrushState,
  mode: BrushMoveMode
): BrushEndResult | null {
  const { brushingType, extent } = state;
  if (!brushingType) {
    return null;
  }
  const idle = {
    isBrushing: false,
    brushingType: undefined,
    activeHandle: null,
  } as const;

  if (mode === "window" || brushingType === "move") {
    return {
      state: {
        ...state,
        ...idle,
        start: {
          x: Math.min(extent.x0, extent.x1),
          y: mode === "window" ? extent.y0 : Math.min(extent.y0, extent.y1),
        },
        end: {
          x: Math.max(extent.x0, extent.x1),
          y: Math.max(extent.y0, extent.y1),
        },
      },
      changeCount: mode === "window" ? 1 : 2,
    };
  }
  if (brushingType === "select") {
    return {
      state: {
        ...state,
        ...idle,
        start: { x: extent.x0, y: extent.y0 },
        end: { x: extent.x1, y: extent.y1 },
      },
      changeCount: 1,
    };
  }
  const start = { x: Math.min(extent.x0, extent.x1), y: extent.y0 };
  const end = {
    x: Math.max(extent.x0, extent.x1),
    y: Math.max(extent.y0, extent.y1),
  };
  return {
    state: {
      ...state,
      ...idle,
      start,
      end,
      extent: {
        x0: Math.min(start.x, end.x),
        x1: Math.max(start.x, end.x),
        y0: Math.min(start.y, end.y),
        y1: Math.max(start.y, end.y),
      },
    },
    changeCount: 2,
  };
}

/** visx selection rect geometry (`getBrushWidth` / `getBrushHeight`). */
export function brushSelectionRect(extent: BrushExtent) {
  return {
    x: Math.min(extent.x0, extent.x1),
    y: Math.min(extent.y0, extent.y1),
    width: Math.max(
      Math.max(extent.x0, extent.x1) - Math.min(extent.x0, extent.x1),
      0
    ),
    height: Math.max(
      Math.max(extent.y0, extent.y1) - Math.min(extent.y0, extent.y1),
      0
    ),
  };
}

/**
 * Handle hit rects, in visx DOM order (`right` then `left`, so `left` wins
 * where they overlap). Height is the full stage, as visx passes
 * `height: stageHeight` to `renderBrushHandle`.
 */
export function brushHandleRects(
  extent: BrushExtent,
  handleSize: number,
  stageHeight: number
): {
  type: BrushHandleType;
  x: number;
  y: number;
  width: number;
  height: number;
}[] {
  const offset = handleSize / 2;
  return [
    {
      type: "right",
      x: extent.x1 - offset,
      y: extent.y0 - offset,
      width: handleSize,
      height: stageHeight,
    },
    {
      type: "left",
      x: extent.x0 - offset,
      y: extent.y0 - offset,
      width: handleSize,
      height: stageHeight,
    },
  ];
}

export interface BrushDomainBounds {
  x0: number;
  x1: number;
}

type InvertibleScale = (value: number) => unknown;

function invertToNumber(invert: InvertibleScale, value: number): number {
  return Number((invert(value) as { valueOf(): number }).valueOf());
}

/**
 * visx `Brush.convertRangeToDomain` for the x axis: `null` for an empty brush,
 * otherwise the extent widened by `SAFE_PIXEL` and inverted (numbers, e.g.
 * epoch ms for a time scale; NaN falls back to 0 like visx's `|| 0`).
 */
export function brushExtentToDomain(
  extent: BrushExtent,
  invert: InvertibleScale
): BrushDomainBounds | null {
  const { x0, x1 } = extent;
  if (typeof x0 === "undefined" || x0 < 0) {
    return null;
  }
  const start = x0 || 0;
  const end = x1 || 0;
  const invertedStart = invertToNumber(
    invert,
    start + (start < end ? -BRUSH_SAFE_PIXEL : BRUSH_SAFE_PIXEL)
  );
  const invertedEnd = invertToNumber(
    invert,
    end + (end < start ? -BRUSH_SAFE_PIXEL : BRUSH_SAFE_PIXEL)
  );
  return {
    x0: Math.min(invertedStart, invertedEnd) || 0,
    x1: Math.max(invertedStart, invertedEnd) || 0,
  };
}
