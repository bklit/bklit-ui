import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultStudioState } from "../studio-parsers";
import {
  buildSeriesScopedControlUpdate,
  getSeriesCurve,
  getSeriesStrokeWidth,
} from "../studio-series-line-props";

describe("studio-series-line-props", () => {
  it("keeps stroke width scoped per series", () => {
    const base = { ...defaultStudioState(), strokeWidth: 2, dataSeries: 2 };
    const updated = {
      ...base,
      ...buildSeriesScopedControlUpdate(base, "strokeWidth", 1, 4),
    };
    assert.equal(getSeriesStrokeWidth(updated, 0), 2);
    assert.equal(getSeriesStrokeWidth(updated, 1), 4);
  });

  it("keeps curve scoped per series", () => {
    const base = {
      ...defaultStudioState(),
      curve: "natural" as const,
      dataSeries: 2,
    };
    const updated = {
      ...base,
      ...buildSeriesScopedControlUpdate(base, "curve", 1, "step"),
    };
    assert.equal(getSeriesCurve(updated, 0), "natural");
    assert.equal(getSeriesCurve(updated, 1), "step");
  });
});
