// Parity guard for the @visx/zoom -> hand-written choropleth zoom. The visx
// side transcribes Zoom.js (`scale`, `setTranslate`, `dragMove`, `center`,
// default `constrain`) on top of @visx/zoom's own exported matrix helpers, so
// each wheel / drag / button step must produce a bit-identical matrix.
// Delete this file together with the @visx/zoom dependency.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type TransformMatrix,
  applyInverseMatrixToPoint as visxApplyInverse,
  composeMatrices as visxCompose,
  inverseMatrix as visxInverse,
  scaleMatrix as visxScaleMatrix,
  translateMatrix as visxTranslateMatrix,
} from "@visx/zoom";
import {
  applyInverseMatrixToPoint,
  choroplethWheelDelta,
  composeMatrices,
  constrainScale,
  inverseMatrix,
  matrixToString,
  type Point,
  scaleMatrixAroundPoint,
  translateMatrix,
} from "../choropleth/choropleth-zoom-matrix";
import {
  advanceDragGesture,
  createDragGesture,
} from "../choropleth/use-choropleth-zoom-state";

const WIDTH = 812;
const HEIGHT = 456.75;
const LIMITS = { scaleXMin: 0.5, scaleXMax: 4, scaleYMin: 0.5, scaleYMax: 4 };

function visxConstrain(next: TransformMatrix, prev: TransformMatrix) {
  const { scaleX, scaleY } = next;
  if (
    scaleX > LIMITS.scaleXMax ||
    scaleX < LIMITS.scaleXMin ||
    scaleY > LIMITS.scaleYMax ||
    scaleY < LIMITS.scaleYMin
  ) {
    return prev;
  }
  return next;
}

/** Zoom.js `scale()` with visx's helpers. */
function visxScale(
  m: TransformMatrix,
  scaleX: number,
  point?: Point
): TransformMatrix {
  const cleanPoint = point || { x: WIDTH / 2, y: HEIGHT / 2 };
  const t = visxApplyInverse(m, cleanPoint);
  return visxConstrain(
    visxCompose(
      m,
      visxTranslateMatrix(t.x, t.y),
      visxScaleMatrix(scaleX, scaleX),
      visxTranslateMatrix(-t.x, -t.y)
    ),
    m
  );
}

type Step =
  | { wheel: number; at?: Point }
  | { button: number }
  | { drag: [Point, Point] }
  | { center: true };

function runVisx(steps: Step[], initial: TransformMatrix) {
  let m = initial;
  const out: string[] = [];
  for (const step of steps) {
    if ("wheel" in step) {
      const { scaleX } = choroplethWheelDelta({ deltaY: step.wheel });
      m = visxScale(m, scaleX, step.at);
    } else if ("button" in step) {
      m = visxScale(m, step.button);
    } else if ("drag" in step) {
      const [start, end] = step.drag;
      m = visxConstrain(
        {
          ...m,
          translateX: m.translateX + -(start.x - end.x),
          translateY: m.translateY + -(start.y - end.y),
        },
        m
      );
    } else {
      const c = { x: WIDTH / 2, y: HEIGHT / 2 };
      const inv = visxApplyInverse(m, c);
      m = visxConstrain(
        visxCompose(m, visxTranslateMatrix(inv.x - c.x, inv.y - c.y)),
        m
      );
    }
    out.push(matrixToString(m));
  }
  return out;
}

function runBklit(steps: Step[], initial: TransformMatrix) {
  let m = initial;
  const out: string[] = [];
  for (const step of steps) {
    if ("wheel" in step) {
      const { scaleX, scaleY } = choroplethWheelDelta({ deltaY: step.wheel });
      m = constrainScale(
        scaleMatrixAroundPoint(
          m,
          { scaleX, scaleY, point: step.at },
          WIDTH,
          HEIGHT
        ),
        m,
        LIMITS
      );
    } else if ("button" in step) {
      m = constrainScale(
        scaleMatrixAroundPoint(
          m,
          { scaleX: step.button, scaleY: step.button },
          WIDTH,
          HEIGHT
        ),
        m,
        LIMITS
      );
    } else if ("drag" in step) {
      const [start, end] = step.drag;
      m = constrainScale(
        {
          ...m,
          translateX: m.translateX + -(start.x - end.x),
          translateY: m.translateY + -(start.y - end.y),
        },
        m,
        LIMITS
      );
    } else {
      const c = { x: WIDTH / 2, y: HEIGHT / 2 };
      const inv = applyInverseMatrixToPoint(m, c);
      m = constrainScale(
        composeMatrices(m, translateMatrix(inv.x - c.x, inv.y - c.y)),
        m,
        LIMITS
      );
    }
    out.push(matrixToString(m));
  }
  return out;
}

const IDENTITY: TransformMatrix = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
};

describe("choropleth zoom matrix matches @visx/zoom", () => {
  const wheelIn = Array.from({ length: 40 }, (_, i) => ({
    wheel: -100,
    at: { x: 133.37 + i * 7.1, y: 301.9 - i * 3.3 },
  }));

  it("wheel in around the cursor up to zoomMax (later steps rejected)", () => {
    assert.deepStrictEqual(
      runBklit(wheelIn, IDENTITY),
      runVisx(wheelIn, IDENTITY)
    );
  });

  it("wheel out, deltaY 0 zooms in, then drag pans and buttons", () => {
    const steps: Step[] = [
      ...Array.from({ length: 20 }, () => ({
        wheel: 53,
        at: { x: 640.5, y: 12.25 },
      })),
      { wheel: 0, at: { x: 10, y: 10 } },
      {
        drag: [
          { x: 300.5, y: 200 },
          { x: 512.25, y: 87.75 },
        ],
      },
      { button: 1.2 },
      { button: 1.2 },
      { button: 0.8 },
      {
        drag: [
          { x: 10, y: 10 },
          { x: -400, y: 900 },
        ],
      },
      { center: true },
      ...Array.from({ length: 10 }, () => ({ button: 1.2 })),
    ];
    assert.deepStrictEqual(runBklit(steps, IDENTITY), runVisx(steps, IDENTITY));
  });

  it("starts from a custom initialZoom", () => {
    const initial = {
      ...IDENTITY,
      scaleX: 2,
      scaleY: 2,
      translateX: -480,
      translateY: -120,
    };
    const steps: Step[] = [
      { wheel: -1, at: { x: 222, y: 111 } },
      { button: 0.8 },
      {
        drag: [
          { x: 0, y: 0 },
          { x: 33.3, y: -66.6 },
        ],
      },
    ];
    assert.deepStrictEqual(runBklit(steps, initial), runVisx(steps, initial));
  });

  it("inverts like visx", () => {
    const m = {
      scaleX: 2.5,
      scaleY: 1.75,
      translateX: -33.3,
      translateY: 81,
      skewX: 0.1,
      skewY: -0.2,
    };
    assert.deepStrictEqual(inverseMatrix(m), visxInverse(m));
  });

  it("writes the transform like visx toString()", () => {
    assert.equal(
      matrixToString({
        ...IDENTITY,
        scaleX: 1.05,
        scaleY: 1.05,
        translateX: -20.3,
      }),
      "matrix(1.05, 0, 0, 1.05, -20.3, 0)"
    );
  });
});

describe("trackpad pinch (ctrl + wheel) matches visx + use-gesture", () => {
  // The lab's `pinch` step: one ctrl+wheel (deltaY -10 in, +10 out), then a
  // settle longer than use-gesture's 140 ms wheel-pinch end timeout.
  interface Call {
    scale: number;
    at: Point;
  }
  type Event = Call[];

  /**
   * visx: `scale()` reads `matrixStateRef` and queues
   * `setTransformMatrixState(prev => constrain(next, prev))`, whose updater
   * also writes the ref. If React runs the first update eagerly (no pending
   * work on the Zoom fiber), the second call in the same event sees it;
   * otherwise both calls start from the pre-event matrix and the later
   * updater replaces the earlier one. The hook mirrors visx's state so React
   * makes the same call; this models both outcomes the lab recorded.
   */
  function visxEvent(
    m: TransformMatrix,
    calls: Event,
    eager: boolean
  ): TransformMatrix {
    let ref = m;
    const nexts: TransformMatrix[] = [];
    calls.forEach(({ scale, at }, i) => {
      const t = visxApplyInverse(ref, at);
      const next = visxCompose(
        ref,
        visxTranslateMatrix(t.x, t.y),
        visxScaleMatrix(scale, scale),
        visxTranslateMatrix(-t.x, -t.y)
      );
      // The hook builds the same matrix with its own helpers.
      const ours = scaleMatrixAroundPoint(
        ref,
        { scaleX: scale, scaleY: scale, point: at },
        WIDTH,
        HEIGHT
      );
      if (matrixToString(ours) !== matrixToString(next)) {
        throw new Error(`scale mismatch: ${matrixToString(ours)}`);
      }
      nexts.push(next);
      if (i === 0 && eager) {
        ref = constrainScale(next, ref, LIMITS);
      }
    });
    return nexts.reduce((prev, next) => visxConstrain(next, prev), m);
  }

  const at = { x: 406.5, y: 228.25 };
  const wheel = (deltaY: number): Call => ({
    scale: choroplethWheelDelta({ deltaY }).scaleX,
    at,
  });
  // Pinch steps (visx default pinchDelta) at the pinch origin.
  const pinch = (scale: number): Call => ({ scale, at });

  it("reproduces the lab baselines for pinch in and pinch out", () => {
    let m = IDENTITY;
    for (const deltaY of [-100, -100, -100, 100, 100]) {
      m = visxEvent(m, [wheel(deltaY)], true);
    }
    // Pinch in: the wheel update was not eager, so the pinch step replaced it.
    m = visxEvent(m, [wheel(-10), pinch(1.1)], false);
    m = visxEvent(m, [pinch(1.1)], true); // wheel-pinch end, 140 ms later
    assert.equal(m.scaleX, 1.264_155_440_625);
    // Pinch out: eager, so the wheel step and both pinch steps apply.
    m = visxEvent(m, [wheel(10), pinch(0.9)], true);
    m = visxEvent(m, [pinch(0.9)], true);
    assert.equal(m.scaleX, 0.972_767_611_560_937_4);
  });
});

describe("drag gesture threshold (use-gesture filterTaps)", () => {
  it("starts on the move that crosses 3 px on an axis", () => {
    const drag = createDragGesture({
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    assert.equal(advanceDragGesture(drag, 101, 101), "none");
    assert.equal(advanceDragGesture(drag, 102.9, 98), "none");
    assert.equal(advanceDragGesture(drag, 103, 98), "first");
    assert.equal(advanceDragGesture(drag, 110, 98), "move");
    // Back-and-forth movement still counts as distance (not a tap).
    assert.ok(drag.distance[0] > 3);
  });
});
