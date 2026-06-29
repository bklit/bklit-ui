import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHorizontalTangentBezierPath,
  buildProjectionPath,
} from "../projection-utils";

const sourceData = Array.from({ length: 6 }, (_, index) => ({
  date: new Date(2024, 0, index + 1),
  desktop: 100 + index * 10,
}));

describe("buildProjectionPath", () => {
  it("extends auto projections from the last point to the horizon", () => {
    const path = buildProjectionPath({
      sourceData,
      seriesKey: "desktop",
      mode: "auto",
      autoMethod: "linearRegression",
      horizonPoints: 3,
    });

    assert.equal(path.length, 2);
    assert.equal(path[0]?.value, 150);
    assert.ok((path.at(-1)?.value ?? 0) > 150);
  });

  it("builds a target projection to an end value", () => {
    const path = buildProjectionPath({
      sourceData,
      seriesKey: "desktop",
      mode: "target",
      horizonPoints: 3,
      endValue: 220,
    });

    assert.equal(path.length, 2);
    assert.equal(path[0]?.value, 150);
    assert.equal(path[1]?.value, 220);
  });
});

const HORIZONTAL_TANGENT_BEZIER_PATH = /^M 0,100 C 90,100 110,50 200,50$/;

describe("buildHorizontalTangentBezierPath", () => {
  it("uses horizontal control points at start and end y", () => {
    const path = buildHorizontalTangentBezierPath(0, 100, 200, 50);
    assert.match(path, HORIZONTAL_TANGENT_BEZIER_PATH);
  });
});
