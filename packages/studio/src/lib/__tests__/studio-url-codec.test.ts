import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compressToEncodedURIComponent } from "lz-string";
import { lineChartProfitLossDefaults } from "../line-chart-mode";
import { defaultStudioState, studioSearchParams } from "../studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
  STUDIO_STATE_KEY_ORDER,
} from "../studio-url-codec";
import { loadStudioStateFromRequest } from "../studio-url-loader";

describe("studio-url-codec", () => {
  it("key order matches studioSearchParams", () => {
    assert.deepEqual(STUDIO_STATE_KEY_ORDER, Object.keys(studioSearchParams));
  });

  it("round-trips defaults-only state", () => {
    const state = defaultStudioState();
    const encoded = encodeStudioUrlState(state);
    assert.ok(encoded.startsWith("v1."));
    assert.deepEqual(decodeStudioUrlState(encoded), state);
  });

  it("round-trips profit/loss preset", () => {
    const state = defaultStudioState({
      chart: "line-chart",
      ...lineChartProfitLossDefaults,
    });
    assert.deepEqual(decodeStudioUrlState(encodeStudioUrlState(state)), state);
  });

  it("round-trips heavy customization with CSS colors", () => {
    const state = defaultStudioState({
      chart: "line-chart",
      motionEase: "custom",
      motionBezier: "0.85, 0, 0.15, 1",
      seriesColors: "#ff0000|#00ff00",
      hiddenComponents: "line.yaxis.left|line.yaxis.right",
      lineLoadingGridStroke:
        "color-mix(in oklch, var(--chart-grid) 50%, transparent)",
      crosshairColor: "var(--chart-crosshair)",
      showBrush: true,
      brushHeight: 88,
    });
    assert.deepEqual(decodeStudioUrlState(encodeStudioUrlState(state)), state);
  });

  it("returns defaults for unknown codec version", () => {
    assert.deepEqual(decodeStudioUrlState("v2.invalid"), defaultStudioState());
  });

  it("loadStudioStateFromRequest prefers compressed param", () => {
    const state = defaultStudioState({
      chart: "pie-chart",
      pieSize: 120,
    });
    const encoded = encodeStudioUrlState(state);
    const url = new URL(
      `https://ui.bklit.com/studio?s=${encodeURIComponent(encoded)}&chart=area-chart`
    );
    assert.deepEqual(loadStudioStateFromRequest(url), state);
  });

  it("round-trips bar chart without null string fields", () => {
    const state = defaultStudioState({
      chart: "bar-chart",
      barOrientation: "horizontal",
      dataSeries: 3,
    });
    assert.deepEqual(decodeStudioUrlState(encodeStudioUrlState(state)), state);
    assert.equal(
      decodeStudioUrlState(encodeStudioUrlState(state)).seriesColors,
      ""
    );
  });

  it("decode ignores null delta entries from legacy chart switches", () => {
    const seriesColorsIndex = STUDIO_STATE_KEY_ORDER.indexOf("seriesColors");
    const chartIndex = STUDIO_STATE_KEY_ORDER.indexOf("chart");
    const delta: [number, string | number | boolean | null][] = [
      [chartIndex, "bar-chart"],
      [seriesColorsIndex, null],
    ];
    const payload = `v1.${compressToEncodedURIComponent(JSON.stringify(delta))}`;
    const decoded = decodeStudioUrlState(payload);
    assert.equal(decoded.chart, "bar-chart");
    assert.equal(decoded.seriesColors, "");
  });

  it("loadStudioStateFromRequest reads legacy flat params", () => {
    const url = new URL(
      "https://ui.bklit.com/studio?chart=bar-chart&barOrientation=horizontal"
    );
    const state = loadStudioStateFromRequest(url);
    assert.equal(state.chart, "bar-chart");
    assert.equal(state.barOrientation, "horizontal");
  });
});
