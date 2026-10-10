import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveResponsiveChartLabelCount } from "../responsive-chart-label-count";

describe("resolveResponsiveChartLabelCount", () => {
  it("keeps a numeric count at every container width", () => {
    assert.equal(resolveResponsiveChartLabelCount(4, 320, 12), 4);
  });

  it("uses the highest configured breakpoint that fits the container", () => {
    const labels = { base: 2, sm: 3, md: 4, lg: 5, xl: 6 };

    assert.equal(resolveResponsiveChartLabelCount(labels, 639, 12), 2);
    assert.equal(resolveResponsiveChartLabelCount(labels, 640, 12), 3);
    assert.equal(resolveResponsiveChartLabelCount(labels, 768, 12), 4);
    assert.equal(resolveResponsiveChartLabelCount(labels, 1024, 12), 5);
    assert.equal(resolveResponsiveChartLabelCount(labels, 1280, 12), 6);
  });

  it("falls back when no matching breakpoint is configured", () => {
    assert.equal(resolveResponsiveChartLabelCount({ lg: 8 }, 767, 12), 12);
  });
});
