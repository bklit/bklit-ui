import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveDatePillVelocity,
  velocitySwell,
} from "../tooltip/use-velocity-stretch";

describe("velocitySwell", () => {
  it("eases out from 0 at rest to 1 at max speed, either direction", () => {
    assert.equal(velocitySwell(0, 1600), 0);
    assert.equal(velocitySwell(800, 1600), 0.75);
    assert.equal(velocitySwell(-800, 1600), 0.75);
    assert.equal(velocitySwell(5000, 1600), 1);
  });
});

describe("resolveDatePillVelocity", () => {
  it("is off by default and merges partial config over defaults", () => {
    assert.equal(resolveDatePillVelocity(undefined), null);
    assert.equal(resolveDatePillVelocity(false), null);
    assert.deepEqual(resolveDatePillVelocity({ scale: 0.1 }), {
      scale: 0.1,
      stretch: 0.08,
      maxVelocity: 1600,
    });
  });
});
