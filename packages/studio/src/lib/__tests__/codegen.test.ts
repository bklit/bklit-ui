import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validChartSlugs } from "@/chart-slugs";
import { generateStudioCode } from "../codegen";
import { barCodegen, liveLineCodegen } from "../codegen-helpers";
import { defaultStudioState } from "../studio-parsers";

const SHOW_LINE_FALSE_RE = /showLine=\{false\}/;
const CURVE_MONOTONE_X_RE = /curveMonotoneX/;
const FILL_FALSE_RE = /fill=\{false\}/;
const STROKE_WIDTH_3_RE = /strokeWidth=\{3\}/;
const ORIENTATION_HORIZONTAL_RE = /orientation="horizontal"/;
const STACKED_RE = /stacked/;
const DATA_KEY_USERS_RE = /dataKey="users"/;
const DEFAULT_LABEL_REVENUE_RE = /defaultLabel="Revenue"/;
const START_ANGLE_90_RE = /startAngle=\{90\}/;
const DATA_KEY_MOBILE_RE = /dataKey="mobile"/;
const INTERVAL_750_RE = /750/;

describe("generateStudioCode", () => {
  for (const slug of validChartSlugs) {
    it(`returns non-empty code for ${slug}`, () => {
      const state = defaultStudioState({ chart: slug });
      const { code } = generateStudioCode(slug, state);
      assert.ok(code.length > 20);
    });
  }

  it("area chart reflects showLine=false", () => {
    const state = defaultStudioState({
      chart: "area-chart",
      showLine: false,
    });
    const { code } = generateStudioCode("area-chart", state);
    assert.match(code, SHOW_LINE_FALSE_RE);
  });

  it("live line includes curve and live props", () => {
    const state = defaultStudioState({
      chart: "live-line-chart",
      curve: "monotoneX",
      liveFill: false,
      livePulse: false,
      strokeWidth: 3,
    });
    const { code } = generateStudioCode("live-line-chart", state);
    assert.match(code, CURVE_MONOTONE_X_RE);
    assert.match(code, FILL_FALSE_RE);
    assert.match(code, STROKE_WIDTH_3_RE);
  });

  it("bar horizontal uses categorical browser dataset", () => {
    const state = defaultStudioState({
      chart: "bar-chart",
      barOrientation: "horizontal",
    });
    const { code } = generateStudioCode("bar-chart", state);
    assert.match(code, ORIENTATION_HORIZONTAL_RE);
    assert.match(code, DATA_KEY_USERS_RE);
  });

  it("bar vertical stacked emits stacked prop with multi-series", () => {
    const state = defaultStudioState({
      chart: "bar-chart",
      barSeriesMode: "stacked",
      dataSeries: 3,
    });
    const { code } = generateStudioCode("bar-chart", state);
    assert.match(code, STACKED_RE);
  });

  it("gauge uses dynamic label and angles", () => {
    const state = defaultStudioState({
      chart: "gauge-chart",
      gaugeLabel: "Revenue",
      startAngle: 90,
      endAngle: 360,
    });
    const { code } = generateStudioCode("gauge-chart", state);
    assert.match(code, DEFAULT_LABEL_REVENUE_RE);
    assert.match(code, START_ANGLE_90_RE);
  });
});

describe("barCodegen", () => {
  it("grouped vertical adds mobile series when dataSeries > 1", () => {
    const { code } = barCodegen(
      defaultStudioState({ barSeriesMode: "grouped", dataSeries: 2 })
    );
    assert.match(code, DATA_KEY_MOBILE_RE);
  });
});

describe("liveLineCodegen", () => {
  it("mentions interval in data comment", () => {
    const { data } = liveLineCodegen(defaultStudioState({ liveInterval: 750 }));
    assert.match(data ?? "", INTERVAL_750_RE);
  });
});
