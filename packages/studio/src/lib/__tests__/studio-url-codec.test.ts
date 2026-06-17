import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compressToEncodedURIComponent } from "lz-string";
import { lineChartProfitLossDefaults } from "../line-chart-mode";
import { defaultStudioState, studioSearchParams } from "../studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
} from "../studio-url-codec";
import { STUDIO_STATE_KEY_ORDER } from "../studio-url-key-orders";
import { loadStudioStateFromRequest } from "../studio-url-loader";

/**
 * Real-world `v1` share blob committed at the 206-key layout (commit 1d8a2f7,
 * trio gallery example). Decoding it under the current 238-key layout used to
 * map a curve string onto a numeric field and crash chart rendering with
 * `e.trim is not a function`.
 */
const LEGACY_TRIO_BLOB =
  "v1.NrAMBoCIBsEsDsCmBaAxgCwIYCcAukBdcYAJigHsBraDAClADoAOJkgAkYEYBmTt3kgwCcoAOwBKQsW4VqdRixIBSEqC68VoAcLHiAPlRrpanTaE0lOAVgaWr+w-OZWzDMUM0AWJsKGSiwFbgnGKcAQBs4OHeASRCUKiYuAC2AK7Q0ABK5MlSwJycZJAkeiUkeQUykABG5LjoerX1jXXoFZyRkKB63aDtolDcelbD7UxQ3WXt8V0MI1MBhRBdPT0VJFWJKelZOXpbaRnZyftJh7u5iySe4NxXQaJWi54zACZ1AM4VVpzBtk-EawyRiPRZWIKQRzGRjhcEcNhMITMUThNgAeg4DE8Em+A0hcmhDG4TG4mIK7BIok8DA6VnRmNATH8gPCZGsi3CMm44UWonGuGwqUQiyYQQFQpFnXeuC+IrxUPozHCqMY3DVbDiglAJHCzPyLHAjAB+REhv+iyEVQVjBedMYGzpiORqIxoD1nCENyNFrFguFgKEnVw5AADhUhONIOhyNhYAAvcjwXCYaB5VRkABmKY+-tIWjNJFioAhcCQDAAnpgAB6wD4MaCIDO4PSlxAV6u1hixgDm6GbrYY3djr0IBCAA";

describe("studio-url-codec", () => {
  it("every studio param is present in the frozen key order", () => {
    // Drift guard: STUDIO_STATE_KEY_ORDER is an explicit, append-only index map.
    // New params must be appended to it (never inserted mid-object), or every
    // previously shared URL silently corrupts.
    assert.deepEqual(
      [...STUDIO_STATE_KEY_ORDER].sort(),
      Object.keys(studioSearchParams).sort()
    );
  });

  it("decodes a legacy 206-key blob to type-correct state (no .trim crash)", () => {
    const decoded = decodeStudioUrlState(LEGACY_TRIO_BLOB);
    const defaults = defaultStudioState();

    assert.equal(decoded.chart, "line-chart");

    for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
      assert.equal(
        typeof decoded[key],
        typeof defaults[key],
        `field ${key} should keep its primitive type`
      );
    }
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
      `https://bklit.com/studio?s=${encodeURIComponent(encoded)}&chart=area-chart`
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
      "https://bklit.com/studio?chart=bar-chart&barOrientation=horizontal"
    );
    const state = loadStudioStateFromRequest(url);
    assert.equal(state.chart, "bar-chart");
    assert.equal(state.barOrientation, "horizontal");
  });
});
