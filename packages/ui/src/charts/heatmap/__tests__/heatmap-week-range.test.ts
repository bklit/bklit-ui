import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getHeatmapColumnMonthAnchor,
  getHeatmapMonthLabelColumnIndex,
  getHeatmapWeekStartAlignedToRange,
  getHeatmapYearStartMonth,
  resolveHeatmapWeekRange,
} from "../heatmap-utils";

describe("heatmap week range alignment", () => {
  it("skips a lead week that is mostly before the range start month", () => {
    const today = new Date(2026, 6, 1);
    today.setHours(0, 0, 0, 0);

    const { startDate, rangeStart } = resolveHeatmapWeekRange(today);

    assert.equal(rangeStart?.toDateString(), "Fri Aug 01 2025");
    assert.equal(startDate.toDateString(), "Sun Jul 27 2025");
  });

  it("keeps the week when range start is early in the column", () => {
    // Sep 1 2025 is a Monday — most of that Sun–Sat week is September
    const rangeStart = new Date(2025, 8, 1);
    const startDate = getHeatmapWeekStartAlignedToRange(rangeStart);

    assert.equal(startDate.toDateString(), "Sun Aug 31 2025");
  });
});

describe("heatmap month label columns", () => {
  it("snaps month ticks to separator group starts", () => {
    const layout = { spacing: 12, atColumns: [4, 8], groups: [] };

    assert.equal(getHeatmapMonthLabelColumnIndex(5, layout), 4);
    assert.equal(getHeatmapMonthLabelColumnIndex(0, layout), 0);
    assert.equal(getHeatmapMonthLabelColumnIndex(3, layout), 0);
  });

  it("uses the raw column when separators are disabled", () => {
    assert.equal(getHeatmapMonthLabelColumnIndex(5, null), 5);
    assert.equal(
      getHeatmapMonthLabelColumnIndex(5, {
        spacing: 0,
        atColumns: [],
        groups: [],
      }),
      5
    );
  });
});

describe("heatmap column month anchor", () => {
  it("falls back to the month of the first bin when the 1st is absent", () => {
    const anchor = getHeatmapColumnMonthAnchor({
      bin: 0,
      bins: [
        { bin: 0, count: 1, date: new Date(2025, 7, 3) },
        { bin: 1, count: 0, date: new Date(2025, 7, 4) },
      ],
    });

    assert.equal(anchor?.toDateString(), "Fri Aug 01 2025");
  });
});

describe("heatmap year start month", () => {
  it("starts twelve months before the current month", () => {
    const today = new Date(2026, 6, 1);
    const start = getHeatmapYearStartMonth(today);

    assert.equal(start.toDateString(), "Fri Aug 01 2025");
  });
});
