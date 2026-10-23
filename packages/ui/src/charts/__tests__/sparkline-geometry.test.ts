import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSparklineBarSegment,
  computeSparklineDomain,
  computeSparklineLayout,
  describeSparkline,
  interpolateSparklineLayout,
  resolveSparklinePadding,
  resolveSparklineValues,
  sparklineIndexAtX,
} from "../sparkline-geometry";

const padding = resolveSparklinePadding(0, 0);

describe("computeSparklineDomain", () => {
  it("pads a flat series so it renders centred", () => {
    assert.deepEqual(computeSparklineDomain([5, 5, 5]), [4, 6]);
  });

  it("includes zero for bars and keeps explicit bounds", () => {
    assert.deepEqual(
      computeSparklineDomain([3, 8], { includeZero: true }),
      [0, 8]
    );
    assert.deepEqual(
      computeSparklineDomain([3, 8], { yDomain: [undefined, 10] }),
      [3, 10]
    );
  });
});

describe("computeSparklineLayout", () => {
  it("places bars in band centres with a zero baseline across negatives", () => {
    const layout = computeSparklineLayout([-2, 2], {
      width: 100,
      height: 40,
      padding,
      domain: [-2, 2],
      kind: "band",
    });
    assert.deepEqual(
      layout.points.map((p) => p.x),
      [25, 75]
    );
    assert.equal(layout.baselineY, 20);
  });

  it("keeps missing values as gaps", () => {
    const values = resolveSparklineValues(
      [{ v: 1 }, { v: null }, { v: 3 }],
      "v"
    );
    const layout = computeSparklineLayout(values, {
      width: 100,
      height: 10,
      padding,
      domain: [1, 3],
      kind: "point",
    });
    assert.ok(Number.isNaN(layout.points[1]?.y));
  });
});

describe("buildSparklineBarSegment", () => {
  it("returns nothing for zero-height bars", () => {
    assert.equal(buildSparklineBarSegment(10, 4, 20, 20, 1), "");
  });
});

describe("sparklineIndexAtX", () => {
  it("snaps to the nearest point or containing band", () => {
    const base = { count: 5, width: 100, padding };
    assert.equal(sparklineIndexAtX(60, { ...base, kind: "point" }), 2);
    assert.equal(sparklineIndexAtX(39, { ...base, kind: "band" }), 1);
    assert.equal(sparklineIndexAtX(500, { ...base, kind: "band" }), 4);
  });
});

describe("describeSparkline", () => {
  it("summarises range and change", () => {
    assert.equal(
      describeSparkline([100, 120, 135]),
      "3 points, from 100 to 135, up 35%"
    );
  });
});

describe("interpolateSparklineLayout", () => {
  const layoutOf = (values: number[]) =>
    computeSparklineLayout(values, {
      width: 100,
      height: 100,
      padding,
      domain: [0, 10],
      kind: "point",
    });

  it("starts at the previous shape and ends at the target", () => {
    const from = layoutOf([0, 10]);
    const to = layoutOf([10, 0]);
    assert.deepEqual(
      interpolateSparklineLayout(from, to, 0).points.map((p) => p.y),
      [100, 0]
    );
    assert.deepEqual(
      interpolateSparklineLayout(from, to, 1).points.map((p) => p.y),
      [0, 100]
    );
  });

  it("resamples when the point count changes", () => {
    const frame = interpolateSparklineLayout(
      layoutOf([0, 10]),
      layoutOf([5, 5, 5]),
      0
    );
    assert.deepEqual(
      frame.points.map((p) => p.y),
      [100, 50, 0]
    );
  });
});
