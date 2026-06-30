import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ancestorGrowOffset,
  applyHoverGrow,
  defaultSunburstGrowPadding,
  hoverGrowForPathSegment,
  maxHoverSegmentThickness,
  visibleHoverPathLength,
} from "../sunburst";

const UNCAPPED = 999;

describe("sunburst hover grow geometry", () => {
  it("counts visible path segments from focus to hover", () => {
    assert.equal(visibleHoverPathLength(4, 0), 4);
    assert.equal(visibleHoverPathLength(4, 3), 1);
    assert.equal(visibleHoverPathLength(2, 2), 1);
  });

  it("budgets hover grow by ring width and path depth", () => {
    assert.ok(Math.abs(hoverGrowForPathSegment(10, 65, 4) - 4.55) < 1e-9);
    assert.equal(hoverGrowForPathSegment(10, 200, 1), 10);
    assert.equal(hoverGrowForPathSegment(10, 65, 1), 6.5);
  });

  it("sums ancestor grow along the id path", () => {
    const growById: Record<string, number> = {
      Product: 10,
      "Product / Enterprise": 6,
    };
    const grow = (id: string) => growById[id] ?? 0;

    assert.equal(ancestorGrowOffset("Product", grow), 0);
    assert.equal(ancestorGrowOffset("Product / Enterprise", grow), 10);
    assert.equal(
      ancestorGrowOffset("Product / Enterprise / North America", grow),
      16
    );
    assert.equal(ancestorGrowOffset("Services / Support", grow), 0);
  });

  it("pushes descendants and thickens the hovered segment", () => {
    const grow = (id: string) => (id === "Product" ? 10 : 0);
    const base = { a0: 0, a1: 1, innerR: 80, outerR: 120 };

    assert.deepEqual(applyHoverGrow(base, "Product", grow, UNCAPPED), {
      a0: 0,
      a1: 1,
      innerR: 80,
      outerR: 130,
    });

    const childBase = { a0: 0, a1: 1, innerR: 120, outerR: 160 };
    assert.deepEqual(
      applyHoverGrow(childBase, "Product / Enterprise", grow, UNCAPPED),
      {
        a0: 0,
        a1: 1,
        innerR: 130,
        outerR: 170,
      }
    );
  });

  it("reserves grow padding from depth and hover pop", () => {
    assert.equal(defaultSunburstGrowPadding(4, 520, 8), 25);
  });

  it("caps expanded thickness to the first drill reference ring", () => {
    const maxThickness = maxHoverSegmentThickness(4, 260, 8);
    const grow = (id: string) =>
      id === "Product / Enterprise / Direct" ? 8 : 0;
    const wideBase = { a0: 0, a1: 1, innerR: 30, outerR: 250 };

    assert.deepEqual(
      applyHoverGrow(
        wideBase,
        "Product / Enterprise / North America / Direct",
        grow,
        maxThickness
      ),
      wideBase
    );

    const ringBase = { a0: 0, a1: 1, innerR: 40, outerR: 112 };
    const expanded = applyHoverGrow(
      ringBase,
      "Product / Enterprise",
      () => 8,
      maxThickness
    );
    assert.ok(expanded.outerR - expanded.innerR <= maxThickness + 1e-9);
  });
});
