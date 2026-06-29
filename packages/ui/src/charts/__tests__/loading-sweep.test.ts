import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSkeletonHeights } from "../loading-sweep";

describe("getSkeletonHeights", () => {
  it("returns the requested number of heights", () => {
    assert.equal(getSkeletonHeights(12).length, 12);
    assert.equal(getSkeletonHeights(0).length, 0);
  });

  it("is deterministic for the same (count, seed) — SSR-safe", () => {
    assert.deepEqual(getSkeletonHeights(8, 3), getSkeletonHeights(8, 3));
  });

  it("re-rolls when the seed changes", () => {
    assert.notDeepEqual(getSkeletonHeights(8, 0), getSkeletonHeights(8, 1));
  });

  it("stays within the default [20, 80) range", () => {
    for (const h of getSkeletonHeights(50, 7)) {
      assert.ok(h >= 20 && h < 80, `height ${h} out of default range`);
    }
  });

  it("respects a custom range", () => {
    for (const h of getSkeletonHeights(50, 2, 40, 60)) {
      assert.ok(h >= 40 && h < 60, `height ${h} out of [40, 60)`);
    }
  });
});
