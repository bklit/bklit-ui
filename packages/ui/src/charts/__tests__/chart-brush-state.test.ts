import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brushHandleRects } from "../chart-brush-state";

const HEIGHT = 60;

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
