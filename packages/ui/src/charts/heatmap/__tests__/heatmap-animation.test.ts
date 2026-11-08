import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeHeatmapLevelRange,
  HEATMAP_DEFAULT_ENTER_DURATION_MS,
  HEATMAP_DEFAULT_LOADING_CELL_MAX_OPACITY,
  HEATMAP_ENTER_FADE_MS,
  heatmapLoadingCellParticipates,
  heatmapWaveDelayMs,
  resolveHeatmapWaveTiming,
} from "../heatmap-animation";
import type { HeatmapColumn } from "../heatmap-context";

function column(counts: number[]): HeatmapColumn {
  return {
    bin: 0,
    bins: counts.map((count, day) => ({
      bin: day,
      count,
      date: new Date(2025, 0, day + 1),
    })),
  };
}

describe("computeHeatmapLevelRange", () => {
  it("returns the min and max levels present in the dataset", () => {
    const data = [column([0, 1, 4]), column([2, 4, 4])];
    assert.deepEqual(computeHeatmapLevelRange(data), { min: 0, max: 4 });
  });

  it("handles datasets with only bright cells", () => {
    const data = [column([4, 4]), column([3, 4])];
    assert.deepEqual(computeHeatmapLevelRange(data), { min: 3, max: 4 });
  });
});

describe("enter wave helpers", () => {
  const timing = resolveHeatmapWaveTiming({
    animationDurationMs: HEATMAP_DEFAULT_ENTER_DURATION_MS,
    enterTransition: undefined,
    enterStaggerScale: 1,
    columnCount: 53,
    rowCount: 7,
  });

  it("sweeps over the line chart reveal duration with a short fade", () => {
    assert.equal(timing.sweepMs, 1100);
    assert.equal(timing.fadeMs, HEATMAP_ENTER_FADE_MS);
  });

  it("takes sweep duration from the transition, scaled by stagger", () => {
    const studio = resolveHeatmapWaveTiming({
      animationDurationMs: 1100,
      enterTransition: { type: "spring", duration: 0.8, bounce: 0.6 },
      enterStaggerScale: 2,
      columnCount: 10,
      rowCount: 7,
    });
    assert.equal(studio.sweepMs, 1600);
    assert.equal(studio.fadeMs, HEATMAP_ENTER_FADE_MS);
  });

  it("delays columns left to right along the eased wavefront", () => {
    const first = heatmapWaveDelayMs(0, 0, timing);
    const quarter = heatmapWaveDelayMs(13, 0, timing);
    const middle = heatmapWaveDelayMs(26, 0, timing);
    const last = heatmapWaveDelayMs(52, 0, timing);
    assert.equal(first, 0);
    // Line-reveal rhythm: the front lingers on the left (quarter of the
    // columns takes well over a quarter of the sweep), then rushes the middle.
    assert.ok(quarter > timing.sweepMs * 0.3);
    assert.ok(Math.abs(middle - timing.sweepMs / 2) < 5);
    assert.ok(Math.abs(last - timing.sweepMs) < 1e-6);
    assert.ok(heatmapWaveDelayMs(0, 6, timing) > first);
  });

  it("defaults loading cell max opacity to 85%", () => {
    assert.equal(HEATMAP_DEFAULT_LOADING_CELL_MAX_OPACITY, 0.85);
  });

  it("gates loading shimmer participation by randomness", () => {
    assert.equal(heatmapLoadingCellParticipates(0, 0, 0), false);
    assert.equal(heatmapLoadingCellParticipates(0, 0, 1), true);
  });
});
