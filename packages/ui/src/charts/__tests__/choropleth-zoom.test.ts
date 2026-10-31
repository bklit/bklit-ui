import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matrixToString } from "../choropleth/choropleth-zoom-matrix";
import {
  advanceDragGesture,
  createDragGesture,
} from "../choropleth/use-choropleth-zoom-state";

describe("matrixToString", () => {
  it("writes an SVG matrix() transform", () => {
    assert.equal(
      matrixToString({
        scaleX: 1.05,
        scaleY: 1.05,
        translateX: -20.3,
        translateY: 0,
        skewX: 0,
        skewY: 0,
      }),
      "matrix(1.05, 0, 0, 1.05, -20.3, 0)"
    );
  });
});

describe("drag gesture threshold", () => {
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
