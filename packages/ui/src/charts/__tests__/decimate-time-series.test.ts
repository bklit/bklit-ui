import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decimateOhlcData,
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

describe("decimateOhlcData", () => {
  it("preserves bucket high/low extremes", () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      date: new Date(i),
      open: i,
      high: i === 50 ? 999 : i + 5,
      low: i === 50 ? 1 : i - 5,
      close: i + 1,
    }));
    const sampled = decimateOhlcData(data, 10);
    assert(sampled.some((row) => row.high === 999));
    assert(sampled.some((row) => row.low === 1));
    assert.equal(sampled.length, 10);
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
