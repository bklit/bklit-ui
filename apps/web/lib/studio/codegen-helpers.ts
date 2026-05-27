import { fadeEdgesCodegen } from "@/components/studio/controls/fade-edges-picker";
import { motionSliceFromState } from "./chart-animation";
import { curveImportName } from "./curves";
import {
  barHorizontalData,
  candlestickOhlcData,
  clampStudioPointCount,
  clampStudioSeriesCount,
  funnelData,
  liveLineSampleData,
  radarDataDual,
  radarMetrics5,
  ringData,
  STUDIO_SERIES_KEYS,
  type StudioCartesianXAxis,
  sankeySimple,
  scatterStudioData,
} from "./demo-data";
import {
  cssRevealAnimationCodegen,
  motionEnterPropsCodegen,
} from "./motion-codegen";
import { patternCodegenBlock } from "./patterns";
import { seriesStrokePropsCodegen } from "./series-stroke-props";
import type { StudioUrlState } from "./studio-parsers";

// Only 5 chart-N vars exist; series 6–10 cycle back through chart-1…chart-5.
const SERIES_COLOR_BY_INDEX = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function seriesKeysForState(state: StudioUrlState): string[] {
  const count = clampStudioSeriesCount(state.dataSeries);
  return STUDIO_SERIES_KEYS.slice(0, count);
}

/** Procedural `Array.from(...)` chart data snippet — matches `generateStudioCartesianData`. */
export function studioCartesianDataSnippet(
  state: StudioUrlState,
  xAxis: StudioCartesianXAxis,
  keysOverride?: readonly string[]
): string {
  const keys = keysOverride ?? seriesKeysForState(state);
  const points = clampStudioPointCount(state.dataPoints);
  const xLine =
    xAxis === "date"
      ? "  date: new Date(2024, 0, i + 1),"
      : '  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i % 12],';
  // Four layered waves at geometrically-spaced periods (~30, ~10.7, ~3.8, ~1.9) for lively, non-repeating output.
  const seriesLines = keys
    .map(
      (key, s) =>
        `  ${key}: Math.max(10, Math.floor(${180 + s * 18} + Math.sin((i + ${s * 17}) / 4.77) * ${38 + s * 3} + Math.cos((i + ${s * 7}) / 1.7) * 24 + Math.sin((i + ${s * 3}) / 0.61) * 14 + Math.cos((i + ${s * 11}) / 0.31) * 8)),`
    )
    .join("\n");
  return `const chartData = Array.from({ length: ${points} }, (_, i) => ({
${xLine}
${seriesLines}
}));`;
}

export function cartesianCodegen(
  chartType: "AreaChart" | "LineChart",
  state: StudioUrlState
) {
  const curveName = curveImportName(state.curve);
  const fill = "url(#studio-pattern-fill)";
  const anim = `\n  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}`;

  const seriesProps = seriesStrokePropsCodegen(state);
  const keys = seriesKeysForState(state);

  let child = "";
  if (chartType === "LineChart") {
    child = keys
      .map((key, idx) => {
        const strokeAttr =
          idx === 0 ? "" : ` stroke="${SERIES_COLOR_BY_INDEX[idx]}"`;
        return `\n  <Line dataKey="${key}"${strokeAttr} curve={${curveName}} strokeWidth={${state.strokeWidth}} ${fadeEdgesCodegen(state.fadeEdges)} showHighlight={${state.showHighlight}}${seriesProps} />`;
      })
      .join("");
  } else if (state.pattern === "none") {
    child = keys
      .map((key, idx) => {
        const fillAttr =
          idx === 0 ? "" : ` fill="${SERIES_COLOR_BY_INDEX[idx]}"`;
        return `\n  <Area dataKey="${key}"${fillAttr} curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${state.strokeWidth}} ${fadeEdgesCodegen(state.fadeEdges)} gradientToOpacity={${state.gradientToOpacity}} showLine={${state.showLine}} showHighlight={${state.showHighlight}}${seriesProps} />`;
      })
      .join("");
  } else {
    // Pattern fill applies only to the primary series; secondaries fall back to solid chart-N color.
    const [primaryKey, ...rest] = keys;
    const primary = primaryKey
      ? `\n  ${patternCodegenBlock(state.pattern)}\n  <PatternArea dataKey="${primaryKey}" fill="${fill}" curve={${curveName}} />\n  <Area dataKey="${primaryKey}" fillOpacity={0} curve={${curveName}} strokeWidth={${state.strokeWidth}} ${fadeEdgesCodegen(state.fadeEdges)} gradientToOpacity={${state.gradientToOpacity}} showLine={${state.showLine}} showHighlight={${state.showHighlight}}${seriesProps} />`
      : "";
    const others = rest
      .map(
        (key, idx) =>
          `\n  <Area dataKey="${key}" fill="${SERIES_COLOR_BY_INDEX[idx + 1]}" curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${state.strokeWidth}} ${fadeEdgesCodegen(state.fadeEdges)} gradientToOpacity={${state.gradientToOpacity}} showLine={${state.showLine}} showHighlight={${state.showHighlight}}${seriesProps} />`
      )
      .join("");
    child = `${primary}${others}`;
  }

  let extraImports = "";
  if (chartType === "LineChart") {
    extraImports = ", Line";
  } else if (state.pattern === "none") {
    extraImports = ", Area";
  } else {
    extraImports = ", PatternLines, PatternArea, Area";
  }

  return `import { ${chartType}, Grid, XAxis, ChartTooltip${extraImports} } from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";

<${chartType} data={chartData}${anim}>
  <Grid horizontal />${child}
  <XAxis />
  <ChartTooltip />
</${chartType}>`;
}

export function gaugeCodegen(state: StudioUrlState) {
  const patternChild =
    state.pattern === "none"
      ? ""
      : `\n  ${patternCodegenBlock(state.pattern)}\n`;
  const activeFill =
    state.pattern === "none"
      ? ""
      : '\n  activeFill="url(#studio-pattern-fill)"';

  return {
    code: `import { Gauge${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<Gauge
  value={${state.value}}
  centerValue={${state.centerValue}}
  totalNotches={${state.totalNotches}}
  spacing={${state.spacing}}
  notchCornerRadius={${state.notchCornerRadius}}
  notchLengthPercent={${state.notchLengthPercent}}
  startAngle={${state.startAngle}}
  endAngle={${state.endAngle}}
  useGradient={${state.useGradient}}
  uniformWidth={${state.uniformWidth}}
  inactiveFillOpacity={${state.inactiveFillOpacity}}
  activeFillOpacity={${state.activeFillOpacity}}
  defaultLabel="${state.gaugeLabel}"
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}${activeFill}
  ${motionEnterPropsCodegen(motionSliceFromState(state), state.motionStaggerScale)}
>${patternChild}</Gauge>`,
    data: gaugeDataSnippet(state),
  };
}

export function barCodegen(state: StudioUrlState) {
  const horizontal = state.barOrientation === "horizontal";
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  // "single" mode is treated as grouped when dataSeries > 1.
  const stacked = seriesCount > 1 && state.barSeriesMode === "stacked";
  const primaryFill =
    state.pattern === "none" ? "var(--chart-1)" : "url(#studio-pattern-fill)";

  let dataSnippet: string;
  let xKey: string;
  let keys: string[];
  if (horizontal) {
    // Horizontal bar keeps the categorical browser dataset.
    dataSnippet = `const chartData = ${JSON.stringify(barHorizontalData, null, 2)};`;
    xKey = "browser";
    keys = ["users"];
  } else {
    keys = STUDIO_SERIES_KEYS.slice(0, seriesCount);
    dataSnippet = studioCartesianDataSnippet(state, "month", keys);
    xKey = "month";
  }

  const chartProps = [
    "data={chartData}",
    `xDataKey="${xKey}"`,
    cssRevealAnimationCodegen(
      state.animationDuration,
      motionSliceFromState(state)
    ),
    `barGap={${state.barGap}}`,
    stacked ? "stacked" : "",
    stacked ? "stackGap={3}" : "",
    state.barWidth > 0 ? `barWidth={${state.barWidth}}` : "",
    horizontal ? 'orientation="horizontal"' : "",
    horizontal ? "margin={{ left: 80 }}" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const gridProps = horizontal ? "vertical fadeVertical" : "horizontal";

  const patternBlock =
    state.pattern === "none" ? "" : `\n  ${patternCodegenBlock(state.pattern)}`;

  const bars = keys
    .map((key, idx) => {
      const fill = idx === 0 ? primaryFill : SERIES_COLOR_BY_INDEX[idx];
      return `\n  <Bar dataKey="${key}" lineCap="${state.barLineCap}" fill="${fill}" fadedOpacity={${state.barFadedOpacity}} groupGap={${state.groupGap}}${stacked ? " stackGap={3}" : ""} />`;
    })
    .join("");

  return {
    code: `import { BarChart, Bar, BarXAxis, Grid, ChartTooltip${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<BarChart ${chartProps}>
  <Grid ${gridProps} />${patternBlock}${bars}
  <BarXAxis />
  <ChartTooltip showCrosshair={false} />
</BarChart>`,
    data: dataSnippet,
  };
}

export function composedCodegen(state: StudioUrlState) {
  const curveName = curveImportName(state.curve);
  const barPattern =
    state.pattern === "none" ? "" : `\n  ${patternCodegenBlock(state.pattern)}`;
  const seriesProps = seriesStrokePropsCodegen(state);
  const keys = seriesKeysForState(state);
  const [barKey, ...secondaryKeys] = keys;

  const barLine = barKey
    ? `\n  <SeriesBar dataKey="${barKey}" radius={${state.composedBarRadius}} ${state.pattern === "none" ? 'fill="var(--chart-1)"' : 'fill="url(#studio-pattern-fill)"'} />`
    : "";

  const overlays = secondaryKeys
    .map((key, idx) => {
      const color = SERIES_COLOR_BY_INDEX[idx + 1];
      return `\n  <Area dataKey="${key}" curve={${curveName}} fillOpacity={${state.fillOpacity}} ${fadeEdgesCodegen(state.fadeEdges)} fill="${color}"${seriesProps} />\n  <Line dataKey="${key}" curve={${curveName}} strokeWidth={${state.strokeWidth}} ${fadeEdgesCodegen(state.fadeEdges)} stroke="${color}"${seriesProps} />`;
    })
    .join("");

  return {
    code: `import { ComposedChart, SeriesBar, Area, Line, Grid, XAxis, ChartTooltip${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";

<ComposedChart data={chartData}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}>
  <Grid horizontal />${barPattern}${barLine}${overlays}
  <XAxis />
  <ChartTooltip />
</ComposedChart>`,
    data: studioCartesianDataSnippet(state, "date"),
  };
}

export function ringCodegen(state: StudioUrlState) {
  return {
    code: `import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts";

<RingChart data={ringData} size={${state.pieSize}}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))} strokeWidth={${state.strokeWidth}} ringGap={${state.ringGap}} baseInnerRadius={${state.ringBaseInnerRadius}}>
  {ringData.map((_, i) => <Ring index={i} key={i} />)}
  <RingCenter defaultLabel="Channels" />
</RingChart>`,
    data: `const ringData = ${JSON.stringify(ringData, null, 2)};`,
  };
}

export function radarCodegen(state: StudioUrlState) {
  return {
    code: `import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts";

const metrics = ${JSON.stringify(radarMetrics5, null, 2)};

<RadarChart data={data} metrics={metrics} size={${state.radarSize}} margin={${state.radarMargin}} levels={${state.radarLevels}} enterDurationMs={${state.animationDuration}} staggerScale={${state.motionStaggerScale}}>
  ${state.showRadarGrid ? "<RadarGrid />" : "<RadarGrid showLabels={false} />"}
  <RadarAxis />
  <RadarLabels fontSize={10} offset={16} />
  {data.map((_, i) => (
    <RadarArea index={i} key={i} showGlow={false} showPoints={${state.radarShowPoints}} showStroke={${state.radarShowStroke}} />
  ))}
</RadarChart>`,
    data: `const data = ${JSON.stringify(radarDataDual, null, 2)};`,
  };
}

export function candlestickCodegen(state: StudioUrlState) {
  const gradientBlock = state.candleUseGradient
    ? `
  <LinearGradient id="candle-up" from="var(--color-lime-400)" to="var(--color-emerald-500)" />
  <LinearGradient id="candle-down" from="var(--color-yellow-400)" to="var(--color-red-500)" />`
    : "";
  const positiveFill = state.candleUseGradient
    ? 'positiveFill="url(#candle-up)"'
    : 'positiveFill="var(--chart-1)"';
  const negativeFill = state.candleUseGradient
    ? 'negativeFill="url(#candle-down)"'
    : 'negativeFill="var(--chart-3)"';
  const patternBlock =
    state.pattern === "none" ? "" : `\n  ${patternCodegenBlock(state.pattern)}`;
  const patternProps =
    state.pattern === "none"
      ? ""
      : '\n    bodyPatternPositive="url(#studio-pattern-fill)"\n    bodyPatternNegative="url(#studio-pattern-fill)"';

  return {
    code: `import { CandlestickChart, Candlestick, ChartTooltip, XAxis, Grid, LinearGradient${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<CandlestickChart data={ohlcData}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))} candleGap={${state.candleGap}} margin={{ top: 16, right: 16, bottom: 40, left: 16 }}>
  ${gradientBlock}${patternBlock}
  <Candlestick fadedOpacity={${state.candleFadedOpacity}} ${positiveFill} ${negativeFill}${patternProps} />
  <ChartTooltip showDots={${state.candleShowDots}} />
  <XAxis />
</CandlestickChart>`,
    data: `const ohlcData = ${JSON.stringify(candlestickOhlcData, null, 2)};`,
  };
}

export function funnelCodegen(state: StudioUrlState) {
  return {
    code: `<FunnelChart
  data={data}
  layers={${state.funnelLayers}}
  gap={${state.funnelGap}}
  edges="${state.funnelEdges}"
  orientation="${state.funnelOrientation}"
  showValues={${state.funnelShowValues}}
  showLabels={${state.funnelShowLabels}}
  showPercentage={${state.funnelShowPercentage}}
  staggerDelay={${(0.12 * state.motionStaggerScale).toFixed(2)}}
  color="var(--chart-1)"
/>`,
    data: `const data = ${JSON.stringify(funnelData, null, 2)};`,
  };
}

export function liveLineCodegen(state: StudioUrlState) {
  const curveName = curveImportName(state.curve);
  return {
    code: `import { LiveLineChart, Grid, LiveLine, LiveXAxis, LiveYAxis } from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";

<LiveLineChart
  data={data}
  value={latest}
  window={${state.liveWindow}}
  lerpSpeed={${state.liveLerpSpeed}}
  exaggerate={${state.liveExaggerate}}
  paused={${state.livePaused}}
>
  <Grid horizontal />
  <LiveLine
    dataKey="value"
    curve={${curveName}}
    strokeWidth={${state.strokeWidth}}
    fill={${state.liveFill}}
    pulse={${state.livePulse}}
    badge={${state.liveBadge}}
  />
  <LiveXAxis />
  <LiveYAxis />
</LiveLineChart>`,
    data: liveLineDataSnippet(state.liveInterval),
  };
}

export function sankeyCodegen(state: StudioUrlState) {
  return {
    code: `<SankeyChart data={sankeyData}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))} nodePadding={${state.sankeyNodePadding}} nodeWidth={${state.sankeyNodeWidth}}>
  <SankeyNode />
  <SankeyLink strokeOpacity={${state.linkOpacity}} />
  <SankeyTooltip />
</SankeyChart>`,
    data: `const sankeyData = ${JSON.stringify(sankeySimple, null, 2)};`,
  };
}

export function scatterCodegen(state: StudioUrlState) {
  const anim = `\n  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}`;
  const secondSeries = state.scatterSecondSeries
    ? `\n  <Scatter dataKey="mobile" radius={${state.scatterRadius}} ringGap={${state.scatterRingGap}} strokeWidth={${state.scatterRingWidth}} fadeOnHover={${state.scatterFadeOnHover}} inactiveOpacity={${state.scatterInactiveOpacity}} showActiveHighlight={${state.scatterShowActiveHighlight}} />`
    : "";

  return {
    code: `import { ScatterChart, Scatter, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts";

<ScatterChart data={chartData}${anim}>
  <Grid horizontal />
  <Scatter dataKey="desktop" radius={${state.scatterRadius}} ringGap={${state.scatterRingGap}} strokeWidth={${state.scatterRingWidth}} fadeOnHover={${state.scatterFadeOnHover}} inactiveOpacity={${state.scatterInactiveOpacity}} showActiveHighlight={${state.scatterShowActiveHighlight}} />${secondSeries}
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
    data: scatterChartDataSnippet(),
  };
}

export function scatterChartDataSnippet() {
  return `const chartData = ${JSON.stringify(scatterStudioData.slice(0, 12), null, 2)};`;
}

export function lineChartDataSnippet(state: StudioUrlState) {
  return studioCartesianDataSnippet(state, "date");
}

export function areaChartDataSnippet(state: StudioUrlState) {
  return studioCartesianDataSnippet(state, "date");
}

export function gaugeDataSnippet(state: StudioUrlState) {
  return `// Gauge is driven by props — bind to your metrics
const gaugeValue = ${state.value};
const gaugeCenterValue = ${state.centerValue};`;
}

export function liveLineDataSnippet(intervalMs = 750) {
  return `const data = ${JSON.stringify(liveLineSampleData, null, 2)};
// Append { time: Date.now(), value } on an interval (e.g. every ${intervalMs}ms)`;
}

export function choroplethDataSnippet() {
  return `// GeoJSON FeatureCollection — import your regions (e.g. world countries)
// const geojson = await fetch("/geo/world-countries.json").then((r) => r.json());
import geojson from "./your-regions.geojson";`;
}
