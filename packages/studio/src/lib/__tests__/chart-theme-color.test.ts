import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyOpacityToColor,
  isValidOklchColor,
  oklchBodyFromColor,
  resolveStudioColorForPicker,
  srgbBytesToOklchBody,
} from "../chart-theme-color";

const HEX_PARSEABLE_RE = /^#[0-9A-F]{6}$/;

describe("resolveStudioColorForPicker", () => {
  it("keeps oklch palette colors parseable for the picker", () => {
    const color = "oklch(0.865 0.127 207.078)";
    const resolved = resolveStudioColorForPicker(color);

    assert.match(resolved.parseable, HEX_PARSEABLE_RE);
    assert.equal(resolved.opacity, 100);
    assert.equal(isValidOklchColor(color), true);
  });

  it("preserves opacity from color-mix values", () => {
    const resolved = resolveStudioColorForPicker(
      "color-mix(in oklch, oklch(0.865 0.127 207.078) 40%, transparent)"
    );

    assert.match(resolved.parseable, HEX_PARSEABLE_RE);
    assert.equal(resolved.opacity, 40);
  });

  it("returns hex parseable values for hex inputs", () => {
    const resolved = resolveStudioColorForPicker("#336699");

    assert.equal(resolved.parseable, "#336699");
    assert.equal(resolved.opacity, 100);
  });
});

describe("applyOpacityToColor", () => {
  it("applies alpha to oklch colors", () => {
    assert.equal(
      applyOpacityToColor("oklch(0.865 0.127 207.078)", 40),
      "oklch(0.865 0.127 207.078 / 0.4)"
    );
  });
});

describe("oklchBodyFromColor", () => {
  it("preserves Mist chart-1 oklch tokens", () => {
    assert.equal(
      oklchBodyFromColor("oklch(0.865 0.127 207.078)"),
      "0.865 0.127 207.078"
    );
  });
});

describe("srgbBytesToOklchBody", () => {
  it("converts srgb bytes to oklch components", () => {
    assert.equal(srgbBytesToOklchBody(51, 102, 153), "0.499 0.099 250.433");
  });
});
