import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRingHitRadii } from "../ring-context";

describe("getRingHitRadii", () => {
  it("extends each ring band by half the gap on both sides", () => {
    // base 60, stroke 12, gap 6 → ring 1 band is 78–90
    assert.deepEqual(getRingHitRadii(1, 60, 12, 6), {
      innerRadius: 75,
      outerRadius: 93,
    });
  });

  it("tiles adjacent rings with no overlap and no gap", () => {
    for (let i = 0; i < 4; i++) {
      const current = getRingHitRadii(i, 60, 12, 6);
      const next = getRingHitRadii(i + 1, 60, 12, 6);
      assert.equal(current.outerRadius, next.innerRadius);
    }
  });

  it("never returns a negative inner radius", () => {
    assert.equal(getRingHitRadii(0, 1, 12, 6).innerRadius, 0);
  });
});
