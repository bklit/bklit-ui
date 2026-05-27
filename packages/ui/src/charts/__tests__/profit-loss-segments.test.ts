import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitProfitLossSegments } from "../profit-loss-segments";

const xAccessor = (d: Record<string, unknown>) => d.date as Date;

describe("splitProfitLossSegments", () => {
  it("returns empty array for no data", () => {
    assert.deepEqual(
      splitProfitLossSegments({
        data: [],
        dataKey: "pnl",
        xAccessor,
      }),
      []
    );
  });

  it("splits at zero crossings with interpolated crossing points", () => {
    const data = [
      { date: new Date("2024-01-01"), pnl: 100 },
      { date: new Date("2024-01-02"), pnl: -50 },
      { date: new Date("2024-01-03"), pnl: -20 },
    ];

    const segments = splitProfitLossSegments({
      data,
      dataKey: "pnl",
      xAccessor,
    });

    assert.equal(segments.length, 2);
    assert.equal(segments[0]?.isPositive, true);
    assert.equal(segments[1]?.isPositive, false);
    assert.equal(segments[0]?.data.at(-1)?.pnl, 0);
    assert.equal(segments[1]?.data[0]?.pnl, 0);
  });

  it("keeps a single segment when values stay on one side of zero", () => {
    const data = [
      { date: new Date("2024-01-01"), pnl: 10 },
      { date: new Date("2024-01-02"), pnl: 20 },
    ];

    const segments = splitProfitLossSegments({
      data,
      dataKey: "pnl",
      xAccessor,
    });

    assert.equal(segments.length, 1);
    assert.equal(segments[0]?.isPositive, true);
    assert.equal(segments[0]?.data.length, 2);
  });
});
