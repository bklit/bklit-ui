import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withBollingerBands } from "../bollinger";

const rows = [2, 4, 4, 4, 5, 5, 7, 9].map((value, index) => ({
  index,
  value,
}));

describe("withBollingerBands", () => {
  it("nulls all three keys until the window fills", () => {
    const result = withBollingerBands(rows, { dataKey: "value", period: 3 });
    for (const row of result.slice(0, 2)) {
      assert.equal(row.valueUpper, null);
      assert.equal(row.valueLower, null);
      assert.equal(row.valueSma, null);
    }
    assert.equal(typeof result[2]?.valueSma, "number");
  });

  it("uses SMA ± multiplier × population std dev", () => {
    // Window of all 8 values: mean 5, population std dev 2.
    const result = withBollingerBands(rows, { dataKey: "value", period: 8 });
    const last = result.at(-1);
    assert.equal(last?.valueSma, 5);
    assert.equal(last?.valueUpper, 9);
    assert.equal(last?.valueLower, 1);
    assert.equal(last?.index, 7);
  });

  it("honours custom keys and multiplier", () => {
    const result = withBollingerBands(rows, {
      dataKey: "value",
      period: 8,
      multiplier: 1,
      upperKey: "hi",
      lowerKey: "lo",
      middleKey: "mid",
    });
    const last = result.at(-1);
    assert.equal(last?.mid, 5);
    assert.equal(last?.hi, 7);
    assert.equal(last?.lo, 3);
    assert.equal("valueUpper" in (last ?? {}), false);
  });

  it("nulls windows containing non-numeric values", () => {
    const gappy = [{ value: 1 }, { value: null }, { value: 3 }, { value: 5 }];
    const result = withBollingerBands(gappy, { dataKey: "value", period: 2 });
    assert.equal(result[1]?.valueSma, null);
    assert.equal(result[2]?.valueSma, null);
    assert.equal(result[3]?.valueSma, 4);
  });

  it("minPeriods: 1 warms up over a partial window", () => {
    const result = withBollingerBands(rows, {
      dataKey: "value",
      period: 3,
      minPeriods: 1,
    });
    // Row 0: single value, zero spread.
    assert.equal(result[0]?.valueSma, 2);
    assert.equal(result[0]?.valueUpper, 2);
    assert.equal(result[0]?.valueLower, 2);
    // Row 1: mean of [2, 4], population std dev 1.
    assert.equal(result[1]?.valueSma, 3);
    assert.equal(result[1]?.valueUpper, 5);
    // Full windows match the default.
    const full = withBollingerBands(rows, { dataKey: "value", period: 3 });
    assert.deepEqual(result.slice(2), full.slice(2));
  });
});
