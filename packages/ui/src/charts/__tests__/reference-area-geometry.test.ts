import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeReferenceAreaRect,
  resolveReferenceDataRange,
} from "../reference-area-geometry";

const innerWidth = 400;
const innerHeight = 200;

const xScale = (date: Date) => date.getTime() / 10;
const yScale = (value: number) => innerHeight - value;

function baseOptions(
  overrides: Partial<Parameters<typeof computeReferenceAreaRect>[0]> = {}
) {
  return {
    innerWidth,
    innerHeight,
    xScale,
    yScale,
    ...overrides,
  };
}

describe("computeReferenceAreaRect", () => {
  it("maps a full-width horizontal band between y1 and y2", () => {
    const rect = computeReferenceAreaRect(baseOptions({ y1: 40, y2: 80 }));
    assert.deepEqual(rect, { x: 0, y: 120, width: 400, height: 40 });
  });

  it("maps a partial x-range when x1 and x2 are set", () => {
    const rect = computeReferenceAreaRect(
      baseOptions({
        x1: new Date(1000),
        x2: new Date(2000),
        y1: 50,
        y2: 100,
      })
    );
    assert.deepEqual(rect, { x: 100, y: 100, width: 100, height: 50 });
  });

  it("clamps to the plot when ifOverflow is hidden", () => {
    const rect = computeReferenceAreaRect(
      baseOptions({
        y1: 150,
        y2: 250,
        ifOverflow: "hidden",
      })
    );
    assert.deepEqual(rect, { x: 0, y: 0, width: 400, height: 50 });
  });

  it("returns null when discard and partly outside the plot", () => {
    const rect = computeReferenceAreaRect(
      baseOptions({
        y1: 150,
        y2: 250,
        ifOverflow: "discard",
      })
    );
    assert.equal(rect, null);
  });

  it("does not clamp when ifOverflow is visible", () => {
    const rect = computeReferenceAreaRect(
      baseOptions({
        y1: 150,
        y2: 250,
        ifOverflow: "visible",
      })
    );
    assert.deepEqual(rect, { x: 0, y: -50, width: 400, height: 100 });
  });

  it("returns null for zero plot size", () => {
    assert.equal(
      computeReferenceAreaRect(
        baseOptions({ innerWidth: 0, innerHeight: 200, y1: 10, y2: 20 })
      ),
      null
    );
  });
});

describe("resolveReferenceDataRange", () => {
  it("returns inclusive bounds between y1 and y2", () => {
    assert.deepEqual(resolveReferenceDataRange(160, 220, [0, 300]), [160, 220]);
  });

  it("extends to domain edges when y bounds are omitted", () => {
    assert.deepEqual(
      resolveReferenceDataRange(undefined, 220, [0, 300]),
      [0, 220]
    );
    assert.deepEqual(
      resolveReferenceDataRange(160, undefined, [0, 300]),
      [160, 300]
    );
  });
});
