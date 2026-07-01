import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HeatmapColumn } from "../heatmap/heatmap-context";
import {
  buildHeatmapQuarterSeparatorGroups,
  getCalendarQuarter,
  getHeatmapCalendarRangeStart,
  getHeatmapWeekCount,
  getHeatmapWeekStartAlignedToRange,
  HEATMAP_MONTHS_SIX,
  inferHeatmapCalendarRangeStart,
} from "../heatmap/heatmap-utils";

describe("heatmap six-month quarter labels", () => {
  it("labels the first quarter from the calendar range start, not the lead week", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeStart = getHeatmapCalendarRangeStart(today, HEATMAP_MONTHS_SIX);
    const weekStart = getHeatmapWeekStartAlignedToRange(rangeStart);
    const weekCount = getHeatmapWeekCount(weekStart, today);
    const columns = buildGridColumns(weekStart, weekCount, today, rangeStart);
    const inferredStart = inferHeatmapCalendarRangeStart(columns);
    const expectedFirstQuarter = getCalendarQuarter(rangeStart);

    assert.equal(inferredStart?.toDateString(), rangeStart.toDateString());
    assert.notEqual(
      getCalendarQuarter(weekStart),
      expectedFirstQuarter,
      "lead week should fall in the prior quarter"
    );

    const groups = buildHeatmapQuarterSeparatorGroups(columns);

    assert.equal(groups[0]?.label, `Q${expectedFirstQuarter}`);
    assert.equal(groups[0]?.startColumnIndex, 0);
    assert.equal(groups[0]?.quarter, expectedFirstQuarter);
  });
});

function buildGridColumns(
  startDate: Date,
  weekCount: number,
  today: Date,
  rangeStart: Date | null
): HeatmapColumn[] {
  const columns: HeatmapColumn[] = [];
  const cursor = new Date(startDate);

  for (let week = 0; week < weekCount; week++) {
    const bins = Array.from({ length: 7 }, (_, day) => {
      const date = new Date(cursor);
      cursor.setDate(cursor.getDate() + 1);
      const isOutOfRange =
        date > today || (rangeStart != null && date < rangeStart);

      return {
        bin: day,
        count: isOutOfRange ? 0 : 1,
        date,
      };
    });

    columns.push({ bin: week, bins });
  }

  return columns;
}
