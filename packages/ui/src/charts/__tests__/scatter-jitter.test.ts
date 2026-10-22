import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  minDistinctStepRatio,
  resolveScatterJitterConfig,
  scatterJitterRangePadding,
  scatterJitterUnit,
} from "../scatter-jitter";

describe("scatterJitterUnit", () => {
  it("is deterministic, bounded, and varies across points and axes", () => {
    const values = new Set<number>();
    for (let index = 0; index < 200; index++) {
      const x = scatterJitterUnit(0, index, 0, 0);
      assert.equal(x, scatterJitterUnit(0, index, 0, 0));
      assert.ok(x >= -1 && x <= 1);
      assert.notEqual(x, scatterJitterUnit(0, index, 0, 1));
      values.add(x);
    }
    assert.equal(values.size, 200);
    assert.notEqual(
      scatterJitterUnit(0, 3, 0, 0),
      scatterJitterUnit(1, 3, 0, 0)
    );
  });
});

describe("resolveScatterJitterConfig", () => {
  it("normalises shorthand forms", () => {
    assert.equal(resolveScatterJitterConfig(undefined), null);
    assert.equal(resolveScatterJitterConfig(false), null);
    assert.deepEqual(resolveScatterJitterConfig(true), {
      x: 0.35,
      y: 0,
      seed: 0,
    });
    assert.deepEqual(resolveScatterJitterConfig(0.5), {
      x: 0.5,
      y: 0,
      seed: 0,
    });
    assert.deepEqual(resolveScatterJitterConfig({ y: 4, seed: 2 }), {
      x: 0.35,
      y: 4,
      seed: 2,
    });
    assert.equal(resolveScatterJitterConfig({ x: 0, y: 0 }), null);
  });
});

describe("jitter layout helpers", () => {
  it("measures the smallest distinct step and keeps edge points inside", () => {
    assert.equal(minDistinctStepRatio([0, 0, 10, 10, 20]), 0.5);
    assert.equal(minDistinctStepRatio([5, 5]), 0);

    const base = 15;
    const width = 600;
    const padding = scatterJitterRangePadding(base, width, 0.25, 0.4);
    const amplitude = (0.4 / 2) * (width - 2 * padding) * 0.25;
    assert.ok(Math.abs(padding - (base + amplitude)) < 1e-9);
    assert.equal(scatterJitterRangePadding(base, width, 0, 0.4), base);
  });
});
