import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatHeatmapContributionLabel,
  formatHeatmapTooltipDate,
  formatHeatmapTooltipWeekday,
} from "../heatmap/heatmap-utils";

describe("heatmap tooltip formatting", () => {
  it("formats the tooltip date with an ordinal day and year", () => {
    assert.equal(
      formatHeatmapTooltipDate(new Date(2026, 0, 20)),
      "January 20th 2026"
    );
    assert.equal(
      formatHeatmapTooltipDate(new Date(2026, 0, 1)),
      "January 1st 2026"
    );
    assert.equal(
      formatHeatmapTooltipDate(new Date(2026, 0, 2)),
      "January 2nd 2026"
    );
    assert.equal(
      formatHeatmapTooltipDate(new Date(2026, 0, 3)),
      "January 3rd 2026"
    );
    assert.equal(
      formatHeatmapTooltipDate(new Date(2026, 0, 11)),
      "January 11th 2026"
    );
  });

  it("formats the full weekday name", () => {
    assert.equal(formatHeatmapTooltipWeekday(new Date(2026, 0, 20)), "Tuesday");
  });

  it("formats singular and plural contribution counts", () => {
    assert.equal(formatHeatmapContributionLabel(0), "0 contributions");
    assert.equal(formatHeatmapContributionLabel(1), "1 contribution");
    assert.equal(formatHeatmapContributionLabel(4), "4 contributions");
  });
});
