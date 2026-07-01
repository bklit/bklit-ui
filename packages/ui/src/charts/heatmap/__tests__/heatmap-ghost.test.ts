import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HeatmapColumn } from "../heatmap-context";
import {
  getHeatmapCalendarRangeStart,
  getHeatmapWeekCount,
  getHeatmapWeekStartAlignedToRange,
  getHeatmapYearStartMonth,
  HEATMAP_MONTHS_SIX,
  isHeatmapGhostBin,
  resolveHeatmapDisplayRange,
  resolveHeatmapWeekRange,
} from "../heatmap-utils";

describe("heatmap ghost cells", () => {
  it("marks bins outside the display range as ghost", () => {
    const range = {
      start: new Date(2025, 7, 1),
      end: new Date(2026, 6, 1),
    };

    assert.equal(
      isHeatmapGhostBin(
        { bin: 0, count: 0, date: new Date(2025, 6, 31) },
        range
      ),
      true
    );
    assert.equal(
      isHeatmapGhostBin(
        { bin: 0, count: 0, date: new Date(2026, 6, 2) },
        range
      ),
      true
    );
    assert.equal(
      isHeatmapGhostBin(
        { bin: 0, count: 0, date: new Date(2026, 5, 15) },
        range
      ),
      false
    );
    assert.equal(
      isHeatmapGhostBin(
        { bin: 0, count: 0, date: new Date(2026, 6, 1) },
        range
      ),
      false
    );
  });

  it("does not treat inactive in-range days as ghost", () => {
    const range = {
      start: new Date(2025, 7, 1),
      end: new Date(2026, 6, 1),
    };

    assert.equal(
      isHeatmapGhostBin(
        { bin: 0, count: 0, date: new Date(2026, 0, 10) },
        range
      ),
      false
    );
  });

  it("infers GitHub-style display range for default year grids", () => {
    const today = new Date(2026, 6, 1);
    today.setHours(0, 0, 0, 0);

    const { startDate, weekCount, rangeStart } = resolveHeatmapWeekRange(today);
    const columns = buildYearGridColumns(
      startDate,
      weekCount,
      today,
      rangeStart
    );
    const displayRange = resolveHeatmapDisplayRange(columns);

    assert.equal(displayRange.start?.toDateString(), "Fri Aug 01 2025");
    assert.equal(displayRange.end?.toDateString(), today.toDateString());
  });

  it("infers GitHub-style display range for six-month grids", () => {
    const today = new Date(2026, 6, 1);
    today.setHours(0, 0, 0, 0);

    const rangeStart = getHeatmapCalendarRangeStart(today, HEATMAP_MONTHS_SIX);
    const startDate = getHeatmapWeekStartAlignedToRange(rangeStart);
    const weekCount = getHeatmapWeekCount(startDate, today);
    const columns = buildYearGridColumns(
      startDate,
      weekCount,
      today,
      rangeStart
    );
    const displayRange = resolveHeatmapDisplayRange(columns);

    assert.equal(rangeStart.toDateString(), "Thu Jan 01 2026");
    assert.equal(startDate.toDateString(), "Sun Dec 28 2025");
    assert.equal(displayRange.start?.toDateString(), rangeStart.toDateString());
    assert.equal(displayRange.end?.toDateString(), today.toDateString());
  });

  it("returns null bounds for non-year custom grids", () => {
    const columns: HeatmapColumn[] = [
      {
        bin: 0,
        bins: [
          { bin: 0, count: 1, date: new Date(2024, 0, 1) },
          { bin: 1, count: 2, date: new Date(2024, 0, 2) },
        ],
      },
    ];

    assert.deepEqual(resolveHeatmapDisplayRange(columns), {
      start: null,
      end: null,
    });
  });
});

function buildYearGridColumns(
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

describe("heatmap year grid alignment", () => {
  it("matches aligned week start used by demo data", () => {
    const today = new Date(2026, 6, 1);
    today.setHours(0, 0, 0, 0);
    const rangeStart = getHeatmapYearStartMonth(today);
    const alignedStart = getHeatmapWeekStartAlignedToRange(rangeStart);

    assert.equal(alignedStart.toDateString(), "Sun Jul 27 2025");
  });
});
