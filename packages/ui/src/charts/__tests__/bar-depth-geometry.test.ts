import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BAR_DEPTH_MAX_PX,
  BAR_DEPTH_PERSPECTIVE_RATIO,
  barDepthAndRise,
  barDepthMaxDepth,
} from "../bar-depth-geometry";

describe("barDepthMaxDepth", () => {
  it("caps at BAR_DEPTH_MAX_PX when the gap is wide", () => {
    // step 100, band 90 → gap 10, gap-1=9; band*0.22=19.8 → min(19.8, 9, 7) = 7
    assert.equal(barDepthMaxDepth(100, 90), BAR_DEPTH_MAX_PX);
  });

  it("is bounded by the inter-bar gap on dense charts", () => {
    // step 50, band 48 → gap 2, gap-1=1; band*0.22=10.56 → min(10.56, 1, 7) = 1
    assert.equal(barDepthMaxDepth(50, 48), 1);
  });

  it("is 0 when there is no gap between bars", () => {
    assert.equal(barDepthMaxDepth(50, 50), 0);
  });
});

describe("barDepthAndRise", () => {
  it("returns no depth for a dead-center bar (absOffset 0)", () => {
    assert.deepEqual(barDepthAndRise(0, 100, 7), {
      depth: 0,
      perspectiveRise: 0,
    });
  });

  it("scales depth with offset, capped by maxDepth at the edge", () => {
    assert.equal(barDepthAndRise(1, 100, 7).depth, 7);
    assert.equal(barDepthAndRise(0.5, 100, 7).depth, 3.5);
  });

  it("caps depth by the bar height so short bars stay proportional", () => {
    // naturalHeight 4 < maxDepth 7 → depth capped at 4
    assert.equal(barDepthAndRise(1, 4, 7).depth, 4);
  });

  it("derives the rise from depth via the perspective ratio", () => {
    const { depth, perspectiveRise } = barDepthAndRise(0.5, 100, 7);
    assert.equal(perspectiveRise, depth * BAR_DEPTH_PERSPECTIVE_RATIO);
  });

  it("clamps out-of-range inputs defensively", () => {
    assert.equal(barDepthAndRise(2, 100, 7).depth, 7); // absOffset clamped to 1
    assert.equal(barDepthAndRise(-1, 100, 7).depth, 0); // clamped to 0
    assert.equal(barDepthAndRise(1, -5, 7).depth, 0); // negative height → 0
  });
});
