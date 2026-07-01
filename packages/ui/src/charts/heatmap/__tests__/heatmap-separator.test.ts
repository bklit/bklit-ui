import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, Fragment } from "react";
import { resolveHeatmapSeparatorConfig } from "../heatmap-resolve-separator";
import { HeatmapSeparator } from "../heatmap-separator";
import {
  buildHeatmapQuarterSeparatorGroups,
  buildHeatmapSeparatorGradientStops,
  findHeatmapColumnIndexForDate,
  getCalendarQuarterStartDatesBetween,
  getHeatmapColumnXOffset,
  getHeatmapMonthLabelColumnIndex,
  getHeatmapPlotInnerWidth,
  getHeatmapSeparatorLineY,
  resolveHeatmapSeparatorLayout,
  resolveHeatmapSeparatorStrokeDasharray,
} from "../heatmap-utils";

describe("heatmap separator layout", () => {
  it("reads fixed-interval separator props from chart children", () => {
    const config = resolveHeatmapSeparatorConfig(
      createElement(
        Fragment,
        null,
        createElement(HeatmapSeparator, { every: 4, spacing: 12 })
      ),
      null
    );

    assert.deepEqual(config, { groupBy: "every", every: 4, spacing: 12 });
  });

  it("reads quarter separator props from chart children", () => {
    const config = resolveHeatmapSeparatorConfig(
      createElement(
        Fragment,
        null,
        createElement(HeatmapSeparator, { groupBy: "quarter", spacing: 12 })
      ),
      null
    );

    assert.deepEqual(config, { groupBy: "quarter", spacing: 12 });
  });

  it("falls back to chart columnSeparators prop", () => {
    const config = resolveHeatmapSeparatorConfig(
      createElement(Fragment, null),
      {
        groupBy: "every",
        every: 3,
        spacing: 8,
      }
    );

    assert.deepEqual(config, { groupBy: "every", every: 3, spacing: 8 });
  });

  it("offsets columns after each separator group", () => {
    const separator = {
      spacing: 12,
      atColumns: [4],
      groups: [],
    };

    assert.equal(getHeatmapColumnXOffset(0, separator), 0);
    assert.equal(getHeatmapColumnXOffset(4, separator), 12);
    assert.equal(getHeatmapColumnXOffset(8, separator), 12);
    assert.equal(getHeatmapPlotInnerWidth(8, 10, separator), 8 * 10 + 12);
  });

  it("computes separator line span with optional startOffset", () => {
    const defaultSpan = getHeatmapSeparatorLineY({
      innerHeight: 100,
      marginTop: 28,
    });
    assert.deepEqual(defaultSpan, { y1: 0, y2: 100 });

    const alignedSpan = getHeatmapSeparatorLineY({
      innerHeight: 100,
      marginTop: 28,
      startOffset: 14,
    });
    assert.deepEqual(alignedSpan, { y1: -14, y2: 100 });
  });

  it("snaps month labels to separator group starts", () => {
    const layout = { spacing: 12, atColumns: [4, 8], groups: [] };

    assert.equal(getHeatmapMonthLabelColumnIndex(5, layout), 4);
    assert.equal(getHeatmapMonthLabelColumnIndex(3, layout), 0);
  });
});

describe("heatmap quarter separators", () => {
  it("lists calendar quarter start dates within a grid extent", () => {
    const gridStart = new Date(2025, 7, 3);
    const gridEnd = new Date(2026, 6, 4);

    const dates = getCalendarQuarterStartDatesBetween(gridStart, gridEnd);

    assert.deepEqual(
      dates.map((date) => date.toDateString()),
      [
        "Wed Oct 01 2025",
        "Thu Jan 01 2026",
        "Wed Apr 01 2026",
        "Wed Jul 01 2026",
      ]
    );
  });

  it("finds the week column containing a calendar date", () => {
    const columns = [
      makeWeekColumn(0, new Date(2025, 8, 28)),
      makeWeekColumn(1, new Date(2025, 9, 5)),
    ];

    assert.equal(
      findHeatmapColumnIndexForDate(columns, new Date(2025, 9, 1)),
      1
    );
    assert.equal(
      findHeatmapColumnIndexForDate(columns, new Date(2025, 8, 30)),
      0
    );
  });

  it("places separators at calendar quarter boundaries", () => {
    const columns = [
      makeWeekColumn(0, new Date(2025, 7, 3)),
      makeWeekColumn(1, new Date(2025, 7, 10)),
      makeWeekColumn(2, new Date(2025, 8, 7)),
      makeWeekColumn(3, new Date(2025, 8, 28)),
      makeWeekColumn(4, new Date(2025, 9, 5)),
      makeWeekColumn(5, new Date(2025, 9, 26)),
      makeWeekColumn(6, new Date(2025, 10, 2)),
      makeWeekColumn(7, new Date(2025, 11, 28)),
      makeWeekColumn(8, new Date(2026, 0, 4)),
      makeWeekColumn(9, new Date(2026, 2, 29)),
      makeWeekColumn(10, new Date(2026, 5, 28)),
    ];

    const groups = buildHeatmapQuarterSeparatorGroups(columns);
    const layout = resolveHeatmapSeparatorLayout(
      { groupBy: "quarter", spacing: 12 },
      columns
    );

    assert.equal(groups[0]?.label, "Q3");
    assert.equal(groups[0]?.startColumnIndex, 0);
    assert.deepEqual(
      groups.slice(1).map((group) => group.label),
      ["Q4", "Q1", "Q2", "Q3"]
    );
    assert.deepEqual(
      layout?.atColumns,
      groups
        .slice(1)
        .map((group) => group.startColumnIndex)
        .filter((columnIndex) => columnIndex > 0)
    );
    assert.equal(
      findHeatmapColumnIndexForDate(columns, new Date(2025, 9, 1)),
      groups.find((group) => group.label === "Q4")?.startColumnIndex
    );
  });
});

describe("heatmap separator stroke", () => {
  it("builds two- and three-stop vertical gradients", () => {
    assert.deepEqual(
      buildHeatmapSeparatorGradientStops({
        from: "red",
        to: "blue",
        fromOpacity: 0,
        toOpacity: 1,
      }),
      [
        { offset: "0%", color: "red", opacity: 0 },
        { offset: "100%", color: "blue", opacity: 1 },
      ]
    );

    assert.deepEqual(
      buildHeatmapSeparatorGradientStops(
        {
          from: "var(--muted)",
          via: "var(--muted)",
          to: "var(--muted)",
          fromOpacity: 0,
          viaOpacity: 1,
          toOpacity: 0,
        },
        0.5
      ),
      [
        { offset: "0%", color: "var(--muted)", opacity: 0 },
        { offset: "50%", color: "var(--muted)", opacity: 0.5 },
        { offset: "100%", color: "var(--muted)", opacity: 0 },
      ]
    );
  });

  it("resolves dashed stroke patterns", () => {
    assert.equal(resolveHeatmapSeparatorStrokeDasharray("solid"), undefined);
    assert.equal(resolveHeatmapSeparatorStrokeDasharray("dashed"), "4,4");
    assert.equal(
      resolveHeatmapSeparatorStrokeDasharray("dashed", "2,6"),
      "2,6"
    );
  });
});

function makeWeekColumn(bin: number, sunday: Date) {
  const bins = Array.from({ length: 7 }, (_, day) => {
    const date = new Date(sunday);
    date.setDate(date.getDate() + day);
    return { bin: day, count: 1, date };
  });

  return { bin, bins };
}
