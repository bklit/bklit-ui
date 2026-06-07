import { describe, expect, it } from "vitest";
import { defaultStudioState } from "@/lib/studio-parsers";
import {
  buildSeriesScopedControlUpdate,
  getSeriesCurve,
  getSeriesStrokeWidth,
} from "@/lib/studio-series-line-props";

describe("studio-series-line-props", () => {
  it("keeps stroke width scoped per series", () => {
    const base = { ...defaultStudioState(), strokeWidth: 2, dataSeries: 2 };
    const updated = {
      ...base,
      ...buildSeriesScopedControlUpdate(base, "strokeWidth", 1, 4),
    };
    expect(getSeriesStrokeWidth(updated, 0)).toBe(2);
    expect(getSeriesStrokeWidth(updated, 1)).toBe(4);
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
    expect(getSeriesCurve(updated, 0)).toBe("natural");
    expect(getSeriesCurve(updated, 1)).toBe("step");
  });
});
