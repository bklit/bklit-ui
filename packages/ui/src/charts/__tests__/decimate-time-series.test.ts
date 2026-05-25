import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decimateTimeSeries,
  maxRenderPointsForWidth,
} from "../decimate-time-series";

describe("decimateTimeSeries", () => {
  it("returns the original array when under the point budget", () => {
    const data = [{ v: 1 }, { v: 2 }, { v: 3 }];
    assert.equal(decimateTimeSeries(data, 10), data);
  });

  it("always keeps the first and last points", () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ v: i }));
    const sampled = decimateTimeSeries(data, 20, ["v"]);
    assert.equal(sampled[0]?.v, 0);
    assert.equal(sampled.at(-1)?.v, 99);
    assert.equal(sampled.length, 20);
  });

  it("preserves spikes in the series", () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      v: i === 25 ? 1000 : i,
    }));
    const sampled = decimateTimeSeries(data, 10, ["v"]);
    assert(sampled.some((point) => point.v === 1000));
  });
});

describe("maxRenderPointsForWidth", () => {
  it("returns at least 64 points", () => {
    assert.equal(maxRenderPointsForWidth(10), 64);
  });

  it("scales with chart width", () => {
    assert.equal(maxRenderPointsForWidth(400), 600);
  });
});
