import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HeatmapColumn } from "../heatmap-context";
import {
  buildHeatmapLegendGradient,
  buildHeatmapRowOpacity,
  getHeatmapDayLabels,
  resolveHeatmapRowOpacity,
  rotateHeatmapColumnBins,
} from "../heatmap-utils";

const GRADIENT_PREFIX = /^linear-gradient\(to right,/;
const GRADIENT_START = /#0ea5e9 0%/;
const GRADIENT_END = /#ef4444 100%/;

function sampleColumn(): HeatmapColumn {
  return {
    bin: 0,
    bins: [
      { bin: 0, count: 0, date: new Date(2024, 0, 7) },
      { bin: 1, count: 1, date: new Date(2024, 0, 8) },
      { bin: 2, count: 2, date: new Date(2024, 0, 9) },
      { bin: 3, count: 3, date: new Date(2024, 0, 10) },
      { bin: 4, count: 4, date: new Date(2024, 0, 11) },
      { bin: 5, count: 0, date: new Date(2024, 0, 12) },
      { bin: 6, count: 1, date: new Date(2024, 0, 13) },
    ],
  };
}

describe("heatmap week start helpers", () => {
  it("rotates day labels for Monday-first grids", () => {
    assert.deepEqual(getHeatmapDayLabels(1), [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("rotates column bins without changing counts or dates", () => {
    const rotated = rotateHeatmapColumnBins([sampleColumn()], 1)[0];
    assert.equal(rotated?.bins[0]?.date.getDay(), 1);
    assert.equal(rotated?.bins[0]?.count, 1);
    assert.equal(rotated?.bins[5]?.date.getDay(), 6);
    assert.equal(rotated?.bins[6]?.date.getDay(), 0);
  });

  it("returns columns unchanged when weekStartDay is 0", () => {
    const column = sampleColumn();
    assert.deepEqual(rotateHeatmapColumnBins([column], 0), [column]);
  });
});

describe("heatmap row opacity", () => {
  it("defaults to 1", () => {
    assert.equal(resolveHeatmapRowOpacity(3), 1);
  });

  it("supports a single multiplier", () => {
    assert.equal(resolveHeatmapRowOpacity(2, 0.35), 0.35);
  });

  it("supports per-row arrays", () => {
    const rowOpacity = [1, 1, 1, 1, 1, 0.35, 0.35] as const;
    assert.equal(resolveHeatmapRowOpacity(5, rowOpacity), 0.35);
    assert.equal(resolveHeatmapRowOpacity(2, rowOpacity), 1);
  });

  it("builds opacity maps from row indices", () => {
    assert.deepEqual(
      buildHeatmapRowOpacity([5, 6], 0.35),
      [1, 1, 1, 1, 1, 0.35, 0.35]
    );
  });

  it("builds opacity maps from a row predicate", () => {
    assert.deepEqual(
      buildHeatmapRowOpacity((row) => row >= 5, 0.35),
      [1, 1, 1, 1, 1, 0.35, 0.35]
    );
  });
});

describe("heatmap legend gradient", () => {
  it("builds evenly spaced color stops", () => {
    const gradient = buildHeatmapLegendGradient([
      { color: "#0ea5e9", fillMode: "solid", pattern: "none" },
      { color: "#22c55e", fillMode: "solid", pattern: "none" },
      { color: "#eab308", fillMode: "solid", pattern: "none" },
      { color: "#f97316", fillMode: "solid", pattern: "none" },
      { color: "#ef4444", fillMode: "solid", pattern: "none" },
    ]);

    assert.match(gradient, GRADIENT_PREFIX);
    assert.match(gradient, GRADIENT_START);
    assert.match(gradient, GRADIENT_END);
  });
});
