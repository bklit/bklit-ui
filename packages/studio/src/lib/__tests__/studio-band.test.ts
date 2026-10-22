import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateStudioCode } from "../codegen";
import { withStudioBandRange } from "../studio-band";
import { chartDefaultHiddenComponents } from "../studio-component-visibility";
import { defaultStudioState } from "../studio-parsers";
import { reconcileOverlayVisibility } from "../studio-visibility-sync";

const BAND_RE = /<Band /;
const BAND_DATA_RE = /data=\{bandData\}/;
const BOLLINGER_IMPORT_RE = /import \{ withBollingerBands \}/;
const MIN_PERIODS_RE = /minPeriods: 1,/;
const BAND_GLOBAL_RE = /<Band /g;
const DESKTOP_LINE_RE = /<Line dataKey="desktop"/;
const MOBILE_LINE_RE = /<Line dataKey="mobile"/;
const MOBILE_UPPER_RE = /mobileUpper:/;

function lineState(overrides: Parameters<typeof defaultStudioState>[0] = {}) {
  return defaultStudioState({
    chart: "line-chart",
    hiddenComponents: chartDefaultHiddenComponents("line", {
      showBand: overrides.bandEnabled,
    }),
    ...overrides,
  });
}

describe("studio band", () => {
  it("range bounds enclose the source value", () => {
    const rows = withStudioBandRange(
      [100, 180, 260].map((desktop) => ({ desktop })),
      "desktop",
      0.15
    );
    for (const row of rows) {
      assert.ok(Number(row.desktopLower) < row.desktop);
      assert.ok(Number(row.desktopUpper) > row.desktop);
    }
  });

  it("omits the band from line codegen by default", () => {
    const { code } = generateStudioCode("line-chart", lineState());
    assert.doesNotMatch(code, BAND_RE);
  });

  it("emits Band + bollinger data transform when enabled", () => {
    const { code, data } = generateStudioCode(
      "line-chart",
      lineState({ bandEnabled: true, bandMode: "bollinger" })
    );
    assert.match(code, BAND_RE);
    assert.match(code, BAND_DATA_RE);
    assert.match(data ?? "", BOLLINGER_IMPORT_RE);
    assert.doesNotMatch(data ?? "", MIN_PERIODS_RE);
  });

  it("emits minPeriods: 1 only for the partial warm-up", () => {
    const { data } = generateStudioCode(
      "line-chart",
      lineState({
        bandEnabled: true,
        bandMode: "bollinger",
        bandWarmup: "partial",
      })
    );
    assert.match(data ?? "", MIN_PERIODS_RE);
  });

  it("emits one Band per series and drops hidden lines (range area combo)", () => {
    const { code, data } = generateStudioCode(
      "line-chart",
      lineState({
        bandEnabled: true,
        bandSeries: "all",
        dataSeries: 2,
        hiddenComponents: `${chartDefaultHiddenComponents("line", {
          showBand: true,
        })}|line.series.0`,
      })
    );
    assert.equal(code.match(BAND_GLOBAL_RE)?.length, 2);
    assert.doesNotMatch(code, DESKTOP_LINE_RE);
    assert.match(code, MOBILE_LINE_RE);
    assert.match(data ?? "", MOBILE_UPPER_RE);
  });

  it("hides the band for legacy URLs whose hidden list predates it", () => {
    const reconciled = reconcileOverlayVisibility(
      defaultStudioState({
        chart: "line-chart",
        hiddenComponents: "line.yaxis.left|line.legend|line.brush",
      })
    );
    assert.ok(reconciled.hiddenComponents?.includes("line.band"));
  });
});
