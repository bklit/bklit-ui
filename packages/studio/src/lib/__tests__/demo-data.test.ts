import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scrambleGaugeValue } from "../demo-data";

describe("scrambleGaugeValue", () => {
  it("returns the input when seed is 0", () => {
    assert.equal(scrambleGaugeValue(66, 0), 66);
  });

  it("keeps fill percentages within 0–100 for studio seeds", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const value = scrambleGaugeValue(66, seed);
      assert.ok(value >= 0 && value <= 100, `seed ${seed} produced ${value}`);
    }
  });
});
