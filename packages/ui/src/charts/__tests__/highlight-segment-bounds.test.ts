import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeSegmentBounds } from "../highlight-segment-bounds";

// Data points at t = 0,10,20,30 ms; a linear pixel xScale (1px per ms) keeps the
// arithmetic obvious — the band is the pixel x-range one data point either side.
const data = [{ t: 0 }, { t: 10 }, { t: 20 }, { t: 30 }];
const xAccessor = (d: Record<string, unknown>) => new Date(d.t as number);
const xScale = (value: Date) => value.getTime();

describe("computeSegmentBounds", () => {
  it("is inactive for empty data", () => {
    assert.deepEqual(
      computeSegmentBounds([], xScale, xAccessor, { index: 1 }, null),
      { x: 0, width: 0, isActive: false }
    );
  });

  it("is inactive with no hover and no selection", () => {
    assert.equal(
      computeSegmentBounds(data, xScale, xAccessor, null, null).isActive,
      false
    );
  });

  it("spans one data point either side of the hovered index", () => {
    // idx 1 → [t 0, t 20] → x 0, width 20
    assert.deepEqual(
      computeSegmentBounds(data, xScale, xAccessor, { index: 1 }, null),
      { x: 0, width: 20, isActive: true }
    );
  });

  it("clamps the start at the first index", () => {
    // idx 0 → [t 0, t 10] → x 0, width 10
    assert.deepEqual(
      computeSegmentBounds(data, xScale, xAccessor, { index: 0 }, null),
      { x: 0, width: 10, isActive: true }
    );
  });

  it("clamps the end at the last index", () => {
    // idx 3 (last) → [t 20, t 30] → x 20, width 10
    assert.deepEqual(
      computeSegmentBounds(data, xScale, xAccessor, { index: 3 }, null),
      { x: 20, width: 10, isActive: true }
    );
  });

  it("uses the dragged pixel range for an active selection (takes priority)", () => {
    const bounds = computeSegmentBounds(
      data,
      xScale,
      xAccessor,
      { index: 1 }, // ignored — selection wins
      { active: true, startX: 5, endX: 25 }
    );
    assert.deepEqual(bounds, { x: 5, width: 20, isActive: true });
  });

  it("normalizes a reversed (right-to-left) selection drag", () => {
    const bounds = computeSegmentBounds(data, xScale, xAccessor, null, {
      active: true,
      startX: 25,
      endX: 5,
    });
    assert.deepEqual(bounds, { x: 5, width: 20, isActive: true });
  });
});
