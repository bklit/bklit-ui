// Parity guard for the @visx/brush -> hand-written brush migration. The visx
// half drives the real `Brush` / `BaseBrush` / `BrushSelection` /
// `BrushHandle` class methods (setState stubbed to apply synchronously), the
// other half the `chart-brush-state` reducer, and both must emit the same
// `onChange` / `onBrushEnd` payloads and pixel extents step for step.
// Delete the visx half together with the @visx/brush dependency.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Brush } from "@visx/brush";
import { scaleLinear, scaleTime } from "d3-scale";
import { type ComponentType, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChartBrushInteraction } from "../chart-brush";
import { renderChartBrushHandle } from "../chart-brush-handle";
import {
  type BrushExtent,
  type BrushInitialPosition,
  type BrushMoveMode,
  type BrushStage,
  type BrushState,
  beginBrushDrag,
  beginBrushSelect,
  brushExtentToDomain,
  brushHandleRects,
  createBrushState,
  dragBrush,
  endBrush,
  idleBrushState,
} from "../chart-brush-state";

const WIDTH = 400;
const HEIGHT = 60;
const MARGIN = { top: 4, right: 40, bottom: 4, left: 40 };
const ZERO = { top: 0, right: 0, bottom: 0, left: 0 };
/** Page offset of the SVG origin (fractional on purpose). */
const PAGE = { x: 113.5, y: 287.25 };

const xScale = scaleTime()
  .domain([new Date(2024, 0, 1), new Date(2024, 2, 1)])
  .range([0, WIDTH]);
const yScale = scaleLinear().domain([0, 100]).range([HEIGHT, 0]);
const STAGE: BrushStage = {
  width: WIDTH,
  height: HEIGHT,
  direction: "horizontal",
};

type Step =
  | { down: "select" | "move" | "left" | "right"; x: number; y: number }
  | { move: [number, number] }
  | { up: true }
  | { reset: true };

type LogEntry = [string, { x0: number; x1: number } | null, BrushExtent];

// --- visx -------------------------------------------------------------------

interface ClassInstance {
  props: Record<string, unknown>;
  state: Record<string, unknown>;
  setState: (updater: unknown, callback?: () => void) => void;
  render: () => { type: unknown; props: Record<string, unknown> };
  [key: string]: unknown;
}
type ClassCtor = (new (
  props: Record<string, unknown>
) => ClassInstance) & {
  defaultProps?: Record<string, unknown>;
};

function instantiate(Ctor: ClassCtor, props: Record<string, unknown>) {
  const instance = new Ctor({ ...Ctor.defaultProps, ...props });
  instance.setState = (updater, callback) => {
    const partial =
      typeof updater === "function"
        ? (updater as (s: unknown, p: unknown) => object)(
            instance.state,
            instance.props
          )
        : updater;
    instance.state = { ...instance.state, ...(partial as object) };
    callback?.();
  };
  return instance;
}

function runVisx(
  steps: Step[],
  mode: BrushMoveMode,
  initial?: BrushInitialPosition
): LogEntry[] {
  const log: LogEntry[] = [];
  let base: ClassInstance | null = null;
  const extent = () => ({ ...(base?.state.extent as BrushExtent) });
  const record =
    (kind: string) => (domain: { x0: number; x1: number } | null) => {
      log.push([kind, domain && { x0: domain.x0, x1: domain.x1 }, extent()]);
    };
  const brush = instantiate(Brush as unknown as ClassCtor, {
    xScale,
    yScale,
    width: WIDTH,
    height: HEIGHT,
    margin: mode === "window" ? MARGIN : ZERO,
    brushDirection: "horizontal",
    handleSize: 8,
    initialBrushPosition: initial,
    useWindowMoveEvents: mode === "window",
    onChange: record("change"),
    onBrushEnd: record("end"),
  });
  const baseElement = brush.render();
  base = instantiate(baseElement.type as ClassCtor, baseElement.props);
  const tree = base.render().props.children as unknown[];
  const child = (index: number) => {
    const node = tree[index] as unknown;
    const element = (Array.isArray(node) ? node[0] : node) as {
      type: ClassCtor;
      props: Record<string, unknown>;
    };
    return element;
  };
  const selectionEl = child(1);
  const handleEl = child(2);
  const call = (target: ClassInstance, name: string, ...args: unknown[]) =>
    (target[name] as (...a: unknown[]) => void)(...args);

  let origin = { x: 0, y: 0 };
  let active: Step | null = null;
  let selection: ClassInstance | null = null;
  let handle: ClassInstance | null = null;

  for (const step of steps) {
    if ("down" in step) {
      active = step;
      origin = { x: step.x, y: step.y };
      const event = { pageX: step.x + PAGE.x, pageY: step.y + PAGE.y };
      if (step.down === "select") {
        call(base, "handleDragStart", {
          x: step.x,
          y: step.y,
          dx: 0,
          dy: 0,
          event,
        });
      } else if (mode === "window") {
        call(base, "handleBrushingTypeChange", step.down, event);
      } else if (step.down === "move") {
        selection = instantiate(selectionEl.type, {
          ...selectionEl.props,
          updateBrush: base.updateBrush,
          onMoveSelectionChange: base.handleBrushingTypeChange,
          isControlled: false,
        });
        call(selection, "selectionDragStart", { event });
      } else {
        handle = instantiate(handleEl.type, {
          ...handleEl.props,
          type: step.down,
          updateBrush: base.updateBrush,
          onBrushHandleChange: base.handleBrushingTypeChange,
          isControlled: false,
        });
        call(handle, "handleDragStart", { event });
      }
    } else if ("move" in step) {
      const [x, y] = step.move;
      const dx = x - origin.x;
      const dy = y - origin.y;
      if (mode === "window") {
        call(base, "handleWindowPointerMove", {
          pageX: x + PAGE.x,
          pageY: y + PAGE.y,
        });
      } else if (active && "down" in active && active.down === "select") {
        call(base, "handleDragMove", {
          isDragging: true,
          x: origin.x,
          y: origin.y,
          dx,
          dy,
        });
      } else if (selection) {
        call(selection, "selectionDragMove", { isDragging: true, dx, dy });
      } else if (handle) {
        call(handle, "handleDragMove", { isDragging: true, dx, dy });
      }
    } else if ("up" in step) {
      if (mode === "window") {
        call(base, "handleWindowPointerUp");
      } else if (selection) {
        call(selection, "selectionDragEnd");
      } else if (handle) {
        call(handle, "handleDragEnd");
      } else {
        call(base, "handleDragEnd");
      }
      active = null;
      selection = null;
      handle = null;
    } else {
      call(base, "reset");
    }
  }
  return log;
}

// --- hand-written -----------------------------------------------------------

function runBklit(
  steps: Step[],
  mode: BrushMoveMode,
  initial?: BrushInitialPosition
): LogEntry[] {
  const log: LogEntry[] = [];
  const invert = (value: number) => xScale.invert(value);
  let state: BrushState = createBrushState(STAGE, initial);
  const emit = (kind: string) =>
    log.push([
      kind,
      brushExtentToDomain(state.extent, invert),
      { ...state.extent },
    ]);
  const startMargin = mode === "window" ? MARGIN : ZERO;
  let origin = { x: 0, y: 0 };

  for (const step of steps) {
    if ("down" in step) {
      origin = { x: step.x, y: step.y };
      state =
        step.down === "select"
          ? beginBrushSelect(state, {
              x: step.x - startMargin.left,
              y: step.y - startMargin.top,
            })
          : beginBrushDrag(state, step.down);
      emit("change");
    } else if ("move" in step) {
      const [x, y] = step.move;
      state = dragBrush(
        state,
        { x: x - origin.x, y: y - origin.y },
        STAGE,
        mode
      );
      emit("change");
    } else if ("up" in step) {
      const result = endBrush(state, mode);
      if (result) {
        state = result.state;
        emit("end");
        for (let i = 0; i < result.changeCount; i++) {
          emit("change");
        }
      }
    } else {
      state = idleBrushState();
      emit("change");
    }
  }
  return log;
}

const INITIAL: BrushInitialPosition = {
  start: { x: 100, y: 0 },
  end: { x: 300, y: HEIGHT },
};

// SVG coordinates (plot x + MARGIN.left in window mode).
const scenarios: {
  name: string;
  steps: Step[];
  initial?: BrushInitialPosition;
}[] = [
  {
    name: "drag to create, left to right",
    steps: [
      { down: "select", x: 120, y: 30 },
      { move: [180.5, 31] },
      { move: [260, 40] },
      { up: true },
    ],
  },
  {
    name: "drag to create past the track start (clamped)",
    steps: [
      { down: "select", x: 200, y: 30 },
      { move: [90, 30] },
      { move: [-50, 10] },
      { up: true },
    ],
  },
  {
    name: "click without drag on the track",
    steps: [{ down: "select", x: 150, y: 30 }, { up: true }],
    initial: INITIAL,
  },
  {
    name: "zero-width drag",
    steps: [
      { down: "select", x: 150, y: 30 },
      { move: [150, 50] },
      { up: true },
    ],
  },
  {
    name: "move the selection past the right edge",
    steps: [
      { down: "move", x: 250, y: 30 },
      { move: [300, 30] },
      { move: [900, 30] },
      { move: [-900, 30] },
      { up: true },
    ],
    initial: INITIAL,
  },
  {
    name: "resize from the left handle across the right edge",
    steps: [
      { down: "left", x: 140, y: 30 },
      { move: [200, 30] },
      { move: [400, 30] },
      { up: true },
      { down: "right", x: 380, y: 30 },
      { move: [1000, 30] },
      { up: true },
    ],
    initial: INITIAL,
  },
  {
    name: "resize from the left handle past the track start",
    steps: [
      { down: "left", x: 140, y: 30 },
      { move: [-200, 30] },
      { up: true },
    ],
    initial: INITIAL,
  },
  {
    name: "double-click reset, then handles on an empty brush",
    steps: [
      { reset: true },
      { down: "right", x: 39, y: 30 },
      { move: [120, 30] },
      { up: true },
    ],
    initial: INITIAL,
  },
];

describe("chart brush matches @visx/brush", () => {
  for (const mode of ["window", "local"] as const) {
    for (const { name, steps, initial } of scenarios) {
      it(`${mode}: ${name}`, () => {
        assert.deepStrictEqual(
          runBklit(steps, mode, initial),
          runVisx(steps, mode, initial)
        );
      });
    }
  }
});

describe("brushHandleRects", () => {
  it("centres handle-size rects on each edge, left drawn last", () => {
    assert.deepStrictEqual(
      brushHandleRects({ x0: 100, x1: 300, y0: 0, y1: HEIGHT }, 8, HEIGHT),
      [
        { type: "right", x: 296, y: -4, width: 8, height: HEIGHT },
        { type: "left", x: 96, y: -4, width: 8, height: HEIGHT },
      ]
    );
  });
});

describe("brush markup matches @visx/brush BaseBrush", () => {
  const style = {
    fill: "transparent",
    fillOpacity: 0,
    stroke: "var(--chart-brush-border)",
    strokeWidth: 1,
  };
  for (const initial of [undefined, INITIAL]) {
    it(initial ? "with an initial selection" : "empty", () => {
      const visx = renderToStaticMarkup(
        createElement(
          Brush as unknown as ComponentType<Record<string, unknown>>,
          {
            xScale,
            yScale,
            width: WIDTH,
            height: HEIGHT,
            margin: MARGIN,
            brushDirection: "horizontal",
            handleSize: 8,
            initialBrushPosition: initial,
            renderBrushHandle: renderChartBrushHandle,
            selectedBoxStyle: style,
            useWindowMoveEvents: true,
          }
        )
      );
      const bklit = renderToStaticMarkup(
        createElement(ChartBrushInteraction, {
          xScale,
          width: WIDTH,
          height: HEIGHT,
          brushDirection: "horizontal",
          handleSize: 8,
          initialBrushPosition: initial,
          startMargin: MARGIN,
          moveMode: "window",
          selectedBoxStyle: style,
          onChange: () => undefined,
          onBrushEnd: () => undefined,
        })
      );
      assert.equal(bklit, visx);
    });
  }
});
