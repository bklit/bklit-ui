import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatOklchBody,
  oklchBodyToHex,
  oklchToSrgbBytes,
  parseOklchBody,
  srgbBytesToOklch,
  srgbBytesToOklchBody,
} from "../oklch-color";

describe("srgbBytesToOklchBody", () => {
  it("matches existing chart-theme conversion", () => {
    assert.equal(srgbBytesToOklchBody(51, 102, 153), "0.499 0.099 250.433");
  });
});

describe("oklch round-trip", () => {
  it("preserves Mist chart-1 components through rgb", () => {
    const body = "0.865 0.127 207.078";
    const parsed = parseOklchBody(body);
    assert.ok(parsed);
    const rgb = oklchToSrgbBytes(parsed.l, parsed.c, parsed.h);
    const roundTrip = formatOklchBody(srgbBytesToOklch(rgb.r, rgb.g, rgb.b));
    const parts = roundTrip.split(" ").map(Number.parseFloat);
    assert.equal(parts[0], 0.865);
    assert.equal(parts[1], 0.127);
    assert.ok(parts[2] !== undefined && Math.abs(parts[2] - 207.078) < 0.01);
  });

  it("converts oklch body to hex for picker state", () => {
    assert.equal(oklchBodyToHex("0.865 0.127 207.078"), "53EAFD");
  });
});
