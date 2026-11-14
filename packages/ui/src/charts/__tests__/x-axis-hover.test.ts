import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { xAxisLabelColor, xAxisLabelHighlight } from "../x-axis-hover";

describe("xAxisLabelHighlight", () => {
  it("marks the hovered row's label active", () => {
    assert.deepEqual(xAxisLabelHighlight("Jan 5", 300, 120, "Jan 5", 80), {
      active: true,
      strength: 1,
    });
  });

  it("falls off linearly to zero at the radius", () => {
    assert.equal(
      xAxisLabelHighlight("Jan 1", 140, 100, null, 80).strength,
      0.5
    );
    assert.equal(xAxisLabelHighlight("Jan 1", 200, 100, null, 80).strength, 0);
  });

  it("is off when not hovering", () => {
    assert.deepEqual(xAxisLabelHighlight("Jan 1", 100, null, null, 80), {
      active: false,
      strength: 0,
    });
  });
});

describe("xAxisLabelColor", () => {
  it("mixes nearby labels toward the nearby color from the base label color", () => {
    assert.equal(
      xAxisLabelColor({ active: false, strength: 0.5 }, "red", "blue"),
      "color-mix(in oklab, blue 50%, var(--chart-label))"
    );
    assert.equal(
      xAxisLabelColor({ active: true, strength: 1 }, "red", "blue"),
      "red"
    );
    assert.equal(
      xAxisLabelColor({ active: false, strength: 0 }, "red", "blue"),
      undefined
    );
  });
});
