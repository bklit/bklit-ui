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
const TREND_LINE_RE = /TrendLine/;
const TREND_LINE_IMPORT_RE =
  /import \{[^}]*TrendLine[^}]*\} from "@bklitui\/ui\/charts"/;
const TREND_LINE_JSX_RE =
  /<TrendLine dataKey="mobile" stroke="var\(--chart-2\)" strokeStyle="solid" yAxisId="right" \/>/;
const BAR_SHOW_VALUE_RE = /showValue/;
const BAR_LABEL_COLOR_RE = /valueLabelColor="#fff"/;
const BAR_LABEL_ORIENTATION_RE = /valueLabelOrientation="vertical"/;
const BAR_LABEL_POSITION_RE = /valueLabelPosition="top"/;
const VALUE_LABEL_PROP_RE = /showValue|valueLabel|fadeValueLabels/;
const AREA_JSX_RE = /<Area dataKey=[^>]*\/>/g;
const SPARKLINE_BAR_RE = /<BarSparkline[\s\S]*barGap=\{4\}/;
const SPARKLINE_LINE_ONLY_PROPS_RE = /curve=|strokeWidth=|endDot/;
const SPARKLINE_HIDDEN_LAYERS_RE = /crosshair=\{false\}[\s\S]*dot=\{false\}/;
const SPARKLINE_DAMPING_RE = /springConfig=\{\{ damping: 45 \}\}/;
const SPARKLINE_NO_SPRING_RE = /hoverTransition=\{false\}/;
const SPARKLINE_ANIMATE_FALSE_RE = /animate=\{false\}/;
const SPARKLINE_DURATION_RE = /animationDuration=/;
const AREA_LABEL_PROPS_RE =
  /showValue valueLabelMinCount=\{2\} valueLabelMaxCount=\{4\} fadeValueLabels/;

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

  it("bar emits enabled value-label options", () => {
    const state = defaultStudioState({
      chart: "bar-chart",
      barShowValue: true,
      barValueLabelColor: "#fff",
      barValueLabelOrientation: "vertical",
      barValueLabelPosition: "top",
    });
    const { code } = generateStudioCode("bar-chart", state);
    assert.match(code, BAR_SHOW_VALUE_RE);
    assert.match(code, BAR_LABEL_COLOR_RE);
    assert.match(code, BAR_LABEL_ORIENTATION_RE);
    assert.match(code, BAR_LABEL_POSITION_RE);
  });

  it("omits value-label props while labels are off", () => {
    const bar = generateStudioCode(
      "bar-chart",
      defaultStudioState({ chart: "bar-chart", barValueLabelColor: "#fff" })
    ).code;
    const area = generateStudioCode(
      "area-chart",
      defaultStudioState({ chart: "area-chart" })
    ).code;
    assert.doesNotMatch(bar, VALUE_LABEL_PROP_RE);
    assert.doesNotMatch(area, VALUE_LABEL_PROP_RE);
  });

  it("area emits value-label counts on every series", () => {
    const state = defaultStudioState({
      chart: "area-chart",
      areaShowValue: true,
      areaValueLabelMaxCount: 4,
      areaFadeValueLabels: true,
    });
    const { code } = generateStudioCode("area-chart", state);
    const areas = code.match(AREA_JSX_RE) ?? [];
    assert.ok(areas.length > 0);
    for (const area of areas) {
      assert.match(area, AREA_LABEL_PROPS_RE);
    }
  });

  it("sparkline emits only non-default props for the chosen variant", () => {
    const bar = generateStudioCode(
      "sparkline",
      defaultStudioState({
        chart: "sparkline",
        sparklineVariant: "bar",
        sparklineBarGap: 4,
        hiddenComponents: "sparkline.crosshair|sparkline.dot",
      })
    ).code;
    assert.match(bar, SPARKLINE_BAR_RE);
    assert.doesNotMatch(bar, SPARKLINE_LINE_ONLY_PROPS_RE);
    assert.match(bar, SPARKLINE_HIDDEN_LAYERS_RE);

    const still = generateStudioCode(
      "sparkline",
      defaultStudioState({ chart: "sparkline", sparklineAnimate: false })
    ).code;
    assert.match(still, SPARKLINE_ANIMATE_FALSE_RE);
    assert.doesNotMatch(still, SPARKLINE_DURATION_RE);

    const snappy = generateStudioCode(
      "sparkline",
      defaultStudioState({ chart: "sparkline", sparklineSpringDamping: 45 })
    ).code;
    assert.match(snappy, SPARKLINE_DAMPING_RE);

    const noSpring = generateStudioCode(
      "sparkline",
      defaultStudioState({
        chart: "sparkline",
        sparklineHoverSpring: false,
        sparklineSpringDamping: 45,
      })
    ).code;
    assert.match(noSpring, SPARKLINE_NO_SPRING_RE);
    assert.doesNotMatch(noSpring, SPARKLINE_DAMPING_RE);
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

describe("trend line codegen", () => {
  it("is omitted while the layer is hidden (default)", () => {
    const { code } = generateStudioCode(
      "line-chart",
      defaultStudioState({ chart: "line-chart", dataSeries: 2 })
    );
    assert.doesNotMatch(code, TREND_LINE_RE);
  });

  it("emits non-default props and import when shown", () => {
    const { code } = generateStudioCode(
      "line-chart",
      defaultStudioState({
        chart: "line-chart",
        dataSeries: 2,
        hiddenComponents: "+line.trend-line",
        lineSeriesYAxes: "left|right",
        trendLineSeries: 1,
        trendLineStrokeStyle: "solid",
      })
    );
    assert.match(code, TREND_LINE_JSX_RE);
    assert.match(code, TREND_LINE_IMPORT_RE);
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
