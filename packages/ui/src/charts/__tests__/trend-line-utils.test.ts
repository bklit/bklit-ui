import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeLinearRegression,
  computeTrendSegment,
} from "../trend-line-utils";

describe("computeLinearRegression", () => {
  it("fits an exact line", () => {
    const fit = computeLinearRegression([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ]);
    assert.deepEqual(fit, { slope: 2, intercept: 1 });
  });

  it("returns null for fewer than two points or zero x-variance", () => {
    assert.equal(computeLinearRegression([]), null);
    assert.equal(computeLinearRegression([{ x: 1, y: 2 }]), null);
    assert.equal(
      computeLinearRegression([
        { x: 3, y: 1 },
        { x: 3, y: 9 },
      ]),
      null
    );
  });

  it("skips non-finite points", () => {
    const fit = computeLinearRegression([
      { x: 0, y: 0 },
      { x: 1, y: Number.NaN },
      { x: Number.POSITIVE_INFINITY, y: 4 },
      { x: 2, y: 4 },
    ]);
    assert.deepEqual(fit, { slope: 2, intercept: 0 });
    assert.equal(
      computeLinearRegression([
        { x: 0, y: 1 },
        { x: 1, y: Number.NaN },
      ]),
      null
    );
  });
});

describe("computeTrendSegment", () => {
  it("spans the min and max finite x", () => {
    const segment = computeTrendSegment([
      { x: 4, y: 8 },
      { x: 1, y: 2 },
      { x: 9, y: Number.NaN },
    ]);
    assert.deepEqual(segment, { x1: 1, y1: 2, x2: 4, y2: 8 });
  });
});
