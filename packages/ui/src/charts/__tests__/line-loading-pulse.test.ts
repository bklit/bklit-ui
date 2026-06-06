import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveLineLoadingPulseMode } from "../line-loading-pulse";

describe("resolveLineLoadingPulseMode", () => {
  it("maps loading phases to pulse modes", () => {
    assert.equal(resolveLineLoadingPulseMode("loading"), "loop");
    assert.equal(resolveLineLoadingPulseMode("exiting"), "exit");
    assert.equal(resolveLineLoadingPulseMode("revealingLoading"), "enter");
  });

  it("returns null for non-loading phases", () => {
    assert.equal(resolveLineLoadingPulseMode("ready"), null);
    assert.equal(resolveLineLoadingPulseMode("revealing"), null);
    assert.equal(resolveLineLoadingPulseMode("exitingReady"), null);
  });
});
