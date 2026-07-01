import { buildArcs, type HeatmapLevelStyle } from "@bklitui/ui/charts";
import { fadeEdgesCodegen } from "@/components/controls/fade-edges-picker";
import { motionSliceFromState } from "./chart-animation";
import { curveImportName } from "./curves";
import {
  barHorizontalData,
  candlestickOhlcData,
  clampStudioPointCount,
  clampStudioSeriesCount,
  funnelData,
  generateStudioTrendingData,
  liveLineSampleData,
  radarDataDual,
  radarMetrics5,
  ringData,
  STUDIO_SERIES_KEYS,
  type StudioCartesianXAxis,
  sankeySimple,
  scatterStudioData,
  sunburstData,
} from "./demo-data";
import { studioHeatmapLevelStyles } from "./heatmap-studio-colors";
import { heatmapSeparatorCodegenBlock } from "./heatmap-studio-props";
import {
  getLineYAxisFormatLargeNumbers,
  getLineYAxisNumTicks,
} from "./line-y-axis-settings";
import {
  cssRevealAnimationCodegen,
  motionEnterPropsCodegen,
  motionTransitionCodegen,
} from "./motion-codegen";
import { patternCodegenBlock } from "./patterns";
import { seriesStrokePropsCodegen } from "./series-stroke-props";
import { isStudioComponentVisible } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";
import {
  buildStudioProjectionPath,
  getProjectionCount,
  getProjectionCurve,
  getProjectionDashArray,
  getProjectionEndMarkerStroke,
  getProjectionShowEndpoints,
  getProjectionStroke,
  getProjectionStrokeGradientEnd,
  getProjectionStrokeGradientStart,
  getProjectionStrokeStyle,
  getProjectionStrokeWidth,
} from "./studio-projection-props";
import {
  getSeriesCurve,
  getSeriesFadeEdges,
  getSeriesShowHighlight,
  getSeriesShowLine,
  getSeriesStrokeWidth,
} from "./studio-series-line-props";

function visxCurveImportLines(
  state: StudioUrlState,
  seriesIndices: number[]
): string {
  const names = [
    ...new Set(
      seriesIndices.map((index) =>
        curveImportName(getSeriesCurve(state, index))
      )
    ),
  ];
  return names
    .map((name) => `import { ${name} } from "@visx/curve";`)
    .join("\n");
}

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

/** Trending cartesian data snippet for line chart projection exploration. */
export function studioTrendingDataSnippet(
  state: StudioUrlState,
  xAxis: StudioCartesianXAxis,
  keysOverride?: readonly string[]
): string {
  const keys = keysOverride ?? seriesKeysForState(state);
  const points = clampStudioPointCount(state.dataPoints);
  const sign = state.lineDataTrend === "up" ? 1 : -1;
  const xLine =
    xAxis === "date"
      ? "  date: new Date(2024, 0, i + 1),"
      : '  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i % 12],';
  const seriesLines = keys
    .map(
      (key, s) =>
        `  ${key}: Math.max(10, Math.floor(${120 + s * 18} + ${sign} * (${5.5 + s * 1.25}) * i + Math.sin((i + ${s * 9}) / 4.4 + ${s * 1.2}) * ${24 + s * 3} + Math.cos((i + ${s * 9}) / 1.65 + ${s * 0.85}) * ${16 + s * 2} + Math.sin((i + ${s * 9}) / 0.68 + ${s * 2.4}) * ${10 + s} + Math.cos((i + ${s * 9}) / 2.95 + ${s * 1.6}) * 7)),`
    )
    .join("\n");
  return `const chartData = Array.from({ length: ${points} }, (_, i) => ({
${xLine}
${seriesLines}
}));`;
}

function formatProjectionPathSnippet(
  path: { date: Date; value: number }[],
  varName: string
): string {
  const rows = path
    .map(
      (point) =>
        `  { date: new Date(${point.date.getFullYear()}, ${point.date.getMonth()}, ${point.date.getDate()}), value: ${point.value} }`
    )
    .join(",\n");
  return `const ${varName} = [\n${rows},\n];`;
}

export function projectionCodegenDataSnippets(state: StudioUrlState): string {
  const count = getProjectionCount(state);
  if (count === 0) {
    return "";
  }

  const sourceData = generateStudioTrendingData({
    direction: state.lineDataTrend,
    seriesCount: clampStudioSeriesCount(state.dataSeries),
    pointCount: state.dataPoints,
    xAxis: "date",
  });

  const snippets: string[] = [];
  for (let index = 0; index < count; index += 1) {
    if (!isStudioComponentVisible(state, `line.projection.${index}`)) {
      continue;
    }
    const path = buildStudioProjectionPath(state, index, sourceData);
    snippets.push(formatProjectionPathSnippet(path, `projectionData${index}`));
  }

  return snippets.length > 0 ? `\n\n${snippets.join("\n\n")}` : "";
}

function projectionCodegenBlock(state: StudioUrlState): string {
  const count = getProjectionCount(state);
  if (count === 0) {
    return "";
  }

  const blocks: string[] = [];
  for (let index = 0; index < count; index += 1) {
    if (!isStudioComponentVisible(state, `line.projection.${index}`)) {
      continue;
    }
    const curveKind = getProjectionCurve(state, index);
    const strokeStyle = getProjectionStrokeStyle(state, index);
    const props = [
      `data={projectionData${index}}`,
      `curveKind="${curveKind}"`,
      "showEndMarker={false}",
      `stroke="${getProjectionStroke(state, index)}"`,
      `strokeWidth={${getProjectionStrokeWidth(state, index)}}`,
      `strokeDasharray="${getProjectionDashArray(state, index)}"`,
    ];
    if (strokeStyle === "gradient") {
      props.push(`strokeStyle="gradient"`);
      props.push(
        `gradientStart="${getProjectionStrokeGradientStart(state, index)}"`
      );
      props.push(
        `gradientEnd="${getProjectionStrokeGradientEnd(state, index)}"`
      );
    }
    blocks.push(`\n  <ProjectionLine ${props.join(" ")} />`);
    if (getProjectionShowEndpoints(state, index)) {
      blocks.push(
        `\n  <ProjectionLineEndMarker data={projectionData${index}} stroke="${getProjectionEndMarkerStroke(state, index)}" />`
      );
    }
  }

  return blocks.join("");
}

export function gridPropsCodegen(state: StudioUrlState): string {
  const props: string[] = [];

  if (state.gridHorizontal) {
    props.push("horizontal");
  } else {
    props.push("horizontal={false}");
  }
  if (state.gridVertical) {
    props.push("vertical");
  }
  if (state.gridNumTicksRows !== 5) {
    props.push(`numTicksRows={${state.gridNumTicksRows}}`);
  }
  if (state.gridNumTicksColumns !== 10) {
    props.push(`numTicksColumns={${state.gridNumTicksColumns}}`);
  }
  if (state.gridStroke !== "var(--chart-grid)") {
    props.push(`stroke="${state.gridStroke}"`);
  }
  if (state.gridStrokeOpacity !== 1) {
    props.push(`strokeOpacity={${state.gridStrokeOpacity}}`);
  }
  if (state.gridStrokeWidth !== 1) {
    props.push(`strokeWidth={${state.gridStrokeWidth}}`);
  }
  if (state.gridStrokeDasharray !== "4,4") {
    props.push(`strokeDasharray="${state.gridStrokeDasharray}"`);
  }
  if (!state.gridFadeHorizontal) {
    props.push("fadeHorizontal={false}");
  }
  if (state.gridFadeVertical) {
    props.push("fadeVertical");
  }
  if (state.gridHideHorizontalEdgeLines) {
    props.push("hideHorizontalEdgeLines");
  }
  if (state.gridHideVerticalEdgeLines) {
    props.push("hideVerticalEdgeLines");
  }

  return props.length > 0 ? ` ${props.join(" ")}` : " horizontal";
}

function backgroundCirclePatternPropsCodegen(state: StudioUrlState): string[] {
  const props: string[] = [];
  if (state.backgroundPatternRadius !== 2) {
    props.push(`radius={${state.backgroundPatternRadius}}`);
  }
  if (state.backgroundPatternComplement) {
    props.push("complement");
  }
  if (state.backgroundPattern === "circles" && state.backgroundPatternFill) {
    props.push(`fill="${state.backgroundPatternFill}"`);
  }
  if (state.backgroundPattern === "dots" && !state.backgroundPatternDotsFill) {
    props.push("dotFill={false}");
  }
  return props;
}

export function backgroundPropsCodegen(state: StudioUrlState): string {
  const props: string[] = [];

  if (state.backgroundPattern !== "diagonal") {
    props.push(`pattern="${state.backgroundPattern}"`);
  }
  if (state.backgroundPatternColor !== "var(--chart-grid)") {
    props.push(`color="${state.backgroundPatternColor}"`);
  }
  if (state.backgroundPatternScale !== 1) {
    props.push(`scale={${state.backgroundPatternScale}}`);
  }
  if (state.backgroundPatternStrokeWidth !== 1) {
    props.push(`strokeWidth={${state.backgroundPatternStrokeWidth}}`);
  }
  if (
    state.backgroundPattern === "circles" ||
    state.backgroundPattern === "dots"
  ) {
    props.push(...backgroundCirclePatternPropsCodegen(state));
  }
  if (state.backgroundPatternTileBackground) {
    props.push(`tileBackground="${state.backgroundPatternTileBackground}"`);
  }
  if (!state.backgroundPatternShowFill) {
    props.push("showFill={false}");
  }
  if (state.backgroundPatternOpacity !== 1) {
    props.push(`opacity={${state.backgroundPatternOpacity}}`);
  }
  if (!state.backgroundFadeHorizontal) {
    props.push("fadeHorizontal={false}");
  }
  if (state.backgroundFadeHorizontalLength !== 10) {
    props.push(
      `fadeHorizontalLength={${state.backgroundFadeHorizontalLength}}`
    );
  }
  if (!state.backgroundFadeVertical) {
    props.push("fadeVertical={false}");
  }
  if (state.backgroundFadeVerticalLength !== 10) {
    props.push(`fadeVerticalLength={${state.backgroundFadeVerticalLength}}`);
  }

  return props.length > 0 ? ` ${props.join(" ")}` : "";
}

export function backgroundCodegenBlock(
  state: StudioUrlState,
  chartPrefix: string
): string {
  const gridVisible = isStudioComponentVisible(state, `${chartPrefix}.grid`);
  const backgroundVisible = isStudioComponentVisible(
    state,
    `${chartPrefix}.background`
  );

  if (gridVisible || !backgroundVisible || state.backgroundPattern === "none") {
    return "";
  }

  return `\n  <Background${backgroundPropsCodegen(state)} />`;
}

function referenceAreaPropsCodegen(state: StudioUrlState): string {
  const parts: string[] = [
    `y1={${state.referenceAreaY1}}`,
    `y2={${state.referenceAreaY2}}`,
    `fill="${state.referenceAreaFill}"`,
    `fillOpacity={${state.referenceAreaFillOpacity}}`,
    `pattern="${state.referenceAreaPattern}"`,
    `patternColor="${state.referenceAreaPatternColor}"`,
    `stroke="${state.referenceAreaStroke}"`,
    `strokeStyle="${state.referenceAreaStrokeStyle}"`,
    ...(state.referenceAreaStrokeStyle === "dashed"
      ? [`strokeDasharray="${state.referenceAreaStrokeDasharray}"`]
      : []),
    `fadeEdges={${state.referenceAreaFadeEdges}}`,
    `fadeEdgesLength={${state.referenceAreaFadeEdgesLength}}`,
    `axisLabelColor="${state.referenceAreaAxisLabelColor}"`,
    `showMarkers={${state.referenceAreaShowMarkers}}`,
    `markerColor="${state.referenceAreaMarkerColor}"`,
    `yAxisId="${state.referenceAreaYAxis}"`,
  ];
  return parts.join(" ");
}

export function referenceAreaCodegenBlock(
  state: StudioUrlState,
  chartPrefix: string
): string {
  if (!isStudioComponentVisible(state, `${chartPrefix}.reference-area`)) {
    return "";
  }
  return `\n  <ReferenceArea ${referenceAreaPropsCodegen(state)} />`;
}

function referenceAreaCodegenImport(
  state: StudioUrlState,
  chartPrefix: string,
  imports: string[]
): void {
  if (isStudioComponentVisible(state, `${chartPrefix}.reference-area`)) {
    imports.push("ReferenceArea");
  }
}

function loadingGridPropsCodegen(state: StudioUrlState): string {
  const props = [`loadingStroke="${state.lineLoadingGridStroke}"`];
  const useShimmer =
    state.loadingStyle !== "sweep" && state.lineLoadingGridShimmer;

  if (useShimmer) {
    props.push("shimmer");
    if (state.lineLoadingGridShimmerSync) {
      props.push("shimmerSync");
    }
    if (
      state.lineLoadingGridShimmerStroke !==
      "color-mix(in oklch, var(--foreground) 68%, transparent)"
    ) {
      props.push(`shimmerStroke="${state.lineLoadingGridShimmerStroke}"`);
    }
    if (state.lineLoadingGridShimmerLength !== 140) {
      props.push(`shimmerLength={${state.lineLoadingGridShimmerLength}}`);
    }
    if (
      !state.lineLoadingGridShimmerSync &&
      state.lineLoadingGridShimmerSpeed !== 1
    ) {
      props.push(`shimmerSpeed={${state.lineLoadingGridShimmerSpeed}}`);
    }
  }

  return `${gridPropsCodegen(state)} ${props.join(" ")}`;
}

export function cartesianLoadingCodegen(
  chartType: "AreaChart" | "LineChart",
  state: StudioUrlState
) {
  const chartPrefix = chartType === "LineChart" ? "line" : "area";
  const primaryKey = seriesKeysForState(state)[0] ?? "revenue";
  const anim = `\n  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}`;
  const loadingLabel =
    state.lineLoadingLabel.length > 0
      ? `\n  loadingLabel="${state.lineLoadingLabel.replace(/"/g, '\\"')}"`
      : "";
  const loadingStyleAttr =
    state.loadingStyle === "sweep" ? ' loadingStyle="sweep"' : "";
  const loadingStrokeAttr = `loadingStroke="${state.lineLoadingStroke}" loadingStrokeOpacity={${state.lineLoadingStrokeOpacity}}`;

  const backgroundBlock = backgroundCodegenBlock(state, chartPrefix);
  const usesBackground = backgroundBlock.length > 0;
  const gridVisible = isStudioComponentVisible(state, `${chartPrefix}.grid`);
  const gridBlock = gridVisible
    ? `\n  <Grid${loadingGridPropsCodegen(state)} />`
    : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, chartPrefix);

  const chartImports = [chartType, "Grid"];
  referenceAreaCodegenImport(state, chartPrefix, chartImports);
  if (usesBackground) {
    chartImports.push("Background");
  }

  let child = "";
  if (chartType === "LineChart") {
    chartImports.push("Line");
    const curveName = curveImportName(getSeriesCurve(state, 0));
    child = `\n  <Line dataKey="${primaryKey}" curve={${curveName}} strokeWidth={${getSeriesStrokeWidth(state, 0)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, 0))} ${loadingStrokeAttr}${loadingStyleAttr} />`;
  } else {
    chartImports.push("Area");
    const curveName = curveImportName(getSeriesCurve(state, 0));
    child = `\n  <Area dataKey="${primaryKey}" curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${getSeriesStrokeWidth(state, 0)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, 0))} gradientToOpacity={${state.gradientToOpacity}} showLine={${getSeriesShowLine(state, 0)}} ${loadingStrokeAttr}${loadingStyleAttr} />`;
  }

  const curveImports = visxCurveImportLines(state, [0]);

  return {
    code: `import { ${chartImports.join(", ")} } from "@bklitui/ui/charts";
${curveImports}

<${chartType} data={chartData}${anim}
  status="loading"${loadingLabel}
  yDomainTween>${backgroundBlock}${gridBlock}${referenceAreaBlock}${child}
</${chartType}>`,
  };
}

export function cartesianCodegen(
  chartType: "AreaChart" | "LineChart",
  state: StudioUrlState
) {
  const fill = "url(#studio-pattern-fill)";
  const anim = `\n  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}`;

  const keys = seriesKeysForState(state);

  let child = "";
  if (chartType === "LineChart") {
    child = keys
      .map((key, idx) => {
        const strokeAttr =
          idx === 0 ? "" : ` stroke="${SERIES_COLOR_BY_INDEX[idx]}"`;
        const seriesProps = seriesStrokePropsCodegen(state, idx);
        const curveName = curveImportName(getSeriesCurve(state, idx));
        return `\n  <Line dataKey="${key}"${strokeAttr} curve={${curveName}} strokeWidth={${getSeriesStrokeWidth(state, idx)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, idx))} showHighlight={${getSeriesShowHighlight(state, idx)}}${seriesProps} />`;
      })
      .join("");
  } else if (state.pattern === "none") {
    child = keys
      .map((key, idx) => {
        const fillAttr =
          idx === 0 ? "" : ` fill="${SERIES_COLOR_BY_INDEX[idx]}"`;
        const seriesProps = seriesStrokePropsCodegen(state, idx);
        const curveName = curveImportName(getSeriesCurve(state, idx));
        return `\n  <Area dataKey="${key}"${fillAttr} curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${getSeriesStrokeWidth(state, idx)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, idx))} gradientToOpacity={${state.gradientToOpacity}} showLine={${getSeriesShowLine(state, idx)}} showHighlight={${getSeriesShowHighlight(state, idx)}}${seriesProps} />`;
      })
      .join("");
  } else {
    // Pattern fill applies only to the primary series; secondaries fall back to solid chart-N color.
    const [primaryKey, ...rest] = keys;
    const primarySeriesProps = seriesStrokePropsCodegen(state, 0);
    const primaryCurveName = curveImportName(getSeriesCurve(state, 0));
    const primary = primaryKey
      ? `\n  ${patternCodegenBlock(state.pattern)}\n  <PatternArea dataKey="${primaryKey}" fill="${fill}" curve={${primaryCurveName}} />\n  <Area dataKey="${primaryKey}" fillOpacity={0} curve={${primaryCurveName}} strokeWidth={${getSeriesStrokeWidth(state, 0)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, 0))} gradientToOpacity={${state.gradientToOpacity}} showLine={${getSeriesShowLine(state, 0)}} showHighlight={${getSeriesShowHighlight(state, 0)}}${primarySeriesProps} />`
      : "";
    const others = rest
      .map((key, idx) => {
        const seriesIndex = idx + 1;
        const seriesProps = seriesStrokePropsCodegen(state, seriesIndex);
        const curveName = curveImportName(getSeriesCurve(state, seriesIndex));
        return `\n  <Area dataKey="${key}" fill="${SERIES_COLOR_BY_INDEX[seriesIndex]}" curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${getSeriesStrokeWidth(state, seriesIndex)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, seriesIndex))} gradientToOpacity={${state.gradientToOpacity}} showLine={${getSeriesShowLine(state, seriesIndex)}} showHighlight={${getSeriesShowHighlight(state, seriesIndex)}}${seriesProps} />`;
      })
      .join("");
    child = `${primary}${others}`;
  }

  const chartPrefix = chartType === "LineChart" ? "line" : "area";
  const backgroundBlock = backgroundCodegenBlock(state, chartPrefix);
  const usesBackground = backgroundBlock.length > 0;
  const gridVisible = isStudioComponentVisible(state, `${chartPrefix}.grid`);
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, chartPrefix);

  const chartImports = [chartType, "XAxis", "ChartTooltip"];
  if (gridVisible) {
    chartImports.push("Grid");
  }
  referenceAreaCodegenImport(state, chartPrefix, chartImports);
  if (usesBackground) {
    chartImports.push("Background");
  }
  if (chartType === "LineChart") {
    chartImports.push("Line");
    if (getProjectionCount(state) > 0) {
      chartImports.push("ProjectionLine", "ProjectionLineEndMarker");
    }
  } else if (state.pattern === "none") {
    chartImports.push("Area");
  } else {
    chartImports.push(
      state.pattern === "circles" || state.pattern === "dots"
        ? "PatternCircles"
        : "PatternLines",
      "PatternArea",
      "Area"
    );
  }

  const curveImports = visxCurveImportLines(
    state,
    keys.map((_, index) => index)
  );

  const projectionBlock =
    chartType === "LineChart" ? projectionCodegenBlock(state) : "";

  return `import { ${chartImports.join(", ")} } from "@bklitui/ui/charts";
${curveImports}

<${chartType} data={chartData}${anim}>${backgroundBlock}${gridBlock}${referenceAreaBlock}${child}${projectionBlock}
  <XAxis />
  <ChartTooltip />
</${chartType}>`;
}

function gaugeUniformWidthCodegenBlock(
  state: StudioUrlState,
  isLinear: boolean
): string {
  if (isLinear) {
    return state.uniformWidth === false ? "\n  uniformWidth={false}" : "";
  }
  return state.uniformWidth ? "\n  uniformWidth={true}" : "";
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
  const isLinear = state.gaugeLinear;
  const trackFill =
    state.progressBarTrackFill.trim().length > 0
      ? `\n  inactiveFill="${state.progressBarTrackFill.trim()}"`
      : "";
  const centerBlock = state.gaugeShowLabel
    ? `\n  centerValue={${state.centerValue}}\n  defaultLabel="${state.gaugeLabel}"${state.gaugeCenterPrefix ? `\n  prefix="${state.gaugeCenterPrefix}"` : ""}${state.gaugeCenterSuffix ? `\n  suffix="${state.gaugeCenterSuffix}"` : ""}`
    : "";
  const labelLayoutBlock =
    isLinear && state.gaugeShowLabel
      ? `\n  labelPlacement="${state.gaugeLabelPlacement}"\n  labelAlign="${state.gaugeLabelAlign}"`
      : "";
  const linearBlock = isLinear
    ? `\n  orientation="linear"\n  linearHeight={${state.progressBarHeight}}\n  notchWidthPercent={${state.notchWidthPercent}}${trackFill}`
    : `\n  startAngle={${state.startAngle}}\n  endAngle={${state.endAngle}}`;
  const uniformWidthBlock = gaugeUniformWidthCodegenBlock(state, isLinear);

  return {
    code: `import { Gauge${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<Gauge
  value={${state.value}}${centerBlock}${linearBlock}${labelLayoutBlock}
  totalNotches={${state.totalNotches}}
  spacing={${state.spacing}}
  notchCornerRadius={${state.notchCornerRadius}}
  notchLengthPercent={${state.notchLengthPercent}}
  useGradient={${state.useGradient}}${uniformWidthBlock}
  inactiveFillOpacity={${state.inactiveFillOpacity}}
  activeFillOpacity={${state.activeFillOpacity}}
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

  let dataSnippet: string;
  let xKey: string;
  let keys: string[];
  if (horizontal) {
    dataSnippet = `const chartData = ${JSON.stringify(barHorizontalData, null, 2)};`;
    xKey = "browser";
    keys = ["users"];
  } else {
    keys = STUDIO_SERIES_KEYS.slice(0, seriesCount);
    dataSnippet = studioCartesianDataSnippet(state, "month", keys);
    xKey = "month";
  }

  if (state.barChartState === "loading") {
    return barLoadingCodegen(state, { horizontal, xKey });
  }

  return barReadyCodegen(state, {
    dataSnippet,
    horizontal,
    keys,
    stacked,
    xKey,
  });
}

function barLoadingCodegen(
  state: StudioUrlState,
  options: { horizontal: boolean; xKey: string }
) {
  const { horizontal, xKey } = options;
  const chartProps = [
    "data={chartData}",
    `xDataKey="${xKey}"`,
    'status="loading"',
    cssRevealAnimationCodegen(
      state.animationDuration,
      motionSliceFromState(state)
    ),
    `barGap={${state.barGap}}`,
    state.barWidth > 0 ? `barWidth={${state.barWidth}}` : "",
    horizontal ? 'orientation="horizontal"' : "",
    horizontal ? "margin={{ left: 80 }}" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const backgroundBlock = backgroundCodegenBlock(state, "bar");
  const gridVisible = isStudioComponentVisible(state, "bar.grid");
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "bar");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "bar.reference-area"
  )
    ? ", ReferenceArea"
    : "";

  return {
    code: `import { BarChart${gridImport}${backgroundImport}${referenceAreaImport} } from "@bklitui/ui/charts";

<BarChart ${chartProps}>${backgroundBlock}${gridBlock}${referenceAreaBlock}
</BarChart>`,
    data: "const chartData: Record<string, unknown>[] = [];",
  };
}

function barReadyCodegen(
  state: StudioUrlState,
  options: {
    dataSnippet: string;
    horizontal: boolean;
    keys: string[];
    stacked: boolean;
    xKey: string;
  }
) {
  const { dataSnippet, horizontal, keys, stacked, xKey } = options;
  const primaryFill =
    state.pattern === "none" ? "var(--chart-1)" : "url(#studio-pattern-fill)";

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

  const patternBlock =
    state.pattern === "none" ? "" : `\n  ${patternCodegenBlock(state.pattern)}`;

  const bars = keys
    .map((key, idx) => {
      const fill = idx === 0 ? primaryFill : SERIES_COLOR_BY_INDEX[idx];
      return `\n  <Bar dataKey="${key}" lineCap="${state.barLineCap}" fill="${fill}" fadedOpacity={${state.barFadedOpacity}} groupGap={${state.groupGap}}${stacked ? " stackGap={3}" : ""} />`;
    })
    .join("");

  const backgroundBlock = backgroundCodegenBlock(state, "bar");
  const gridVisible = isStudioComponentVisible(state, "bar.grid");
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "bar");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "bar.reference-area"
  )
    ? ", ReferenceArea"
    : "";

  return {
    code: `import { BarChart, Bar, BarXAxis, ChartTooltip${gridImport}${backgroundImport}${referenceAreaImport}${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<BarChart ${chartProps}>${backgroundBlock}${gridBlock}${referenceAreaBlock}${patternBlock}${bars}
  <BarXAxis />
  <ChartTooltip showCrosshair={false} />
</BarChart>`,
    data: dataSnippet,
  };
}

export function composedCodegen(state: StudioUrlState) {
  const barPattern =
    state.pattern === "none" ? "" : `\n  ${patternCodegenBlock(state.pattern)}`;
  const keys = seriesKeysForState(state);
  const [barKey, ...secondaryKeys] = keys;

  const barLine = barKey
    ? `\n  <SeriesBar dataKey="${barKey}" radius={${state.composedBarRadius}} ${state.pattern === "none" ? 'fill="var(--chart-1)"' : 'fill="url(#studio-pattern-fill)"'} />`
    : "";

  const overlays = secondaryKeys
    .map((key, idx) => {
      const seriesIndex = idx + 1;
      const color = SERIES_COLOR_BY_INDEX[seriesIndex];
      const seriesProps = seriesStrokePropsCodegen(state, seriesIndex);
      const curveName = curveImportName(getSeriesCurve(state, seriesIndex));
      return `\n  <Area dataKey="${key}" curve={${curveName}} fillOpacity={${state.fillOpacity}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, seriesIndex))} fill="${color}"${seriesProps} />\n  <Line dataKey="${key}" curve={${curveName}} strokeWidth={${getSeriesStrokeWidth(state, seriesIndex)}} ${fadeEdgesCodegen(getSeriesFadeEdges(state, seriesIndex))} stroke="${color}"${seriesProps} />`;
    })
    .join("");

  const backgroundBlock = backgroundCodegenBlock(state, "composed");
  const gridVisible = isStudioComponentVisible(state, "composed.grid");
  const gridBlock = gridVisible ? "\n  <Grid horizontal />" : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "composed");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "composed.reference-area"
  )
    ? ", ReferenceArea"
    : "";

  const curveImports = visxCurveImportLines(
    state,
    secondaryKeys.map((_, index) => index + 1)
  );

  return {
    code: `import { ComposedChart, SeriesBar, Area, Line, XAxis, ChartTooltip${gridImport}${backgroundImport}${referenceAreaImport}${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";
${curveImports}

<ComposedChart data={chartData}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}>${backgroundBlock}${gridBlock}${referenceAreaBlock}${barPattern}${barLine}${overlays}
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
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))} strokeWidth={${state.ringStrokeWidth}} ringGap={${state.ringGap}} baseInnerRadius={${state.ringBaseInnerRadius}}>
  {ringData.map((_, i) => <Ring index={i} key={i} />)}
  <RingCenter defaultLabel="${state.ringCenterLabel}"${state.ringCenterPrefix ? ` prefix="${state.ringCenterPrefix}"` : ""}${state.ringCenterSuffix ? ` suffix="${state.ringCenterSuffix}"` : ""} />
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

  const backgroundBlock = backgroundCodegenBlock(state, "candlestick");
  const gridVisible = isStudioComponentVisible(state, "candlestick.grid");
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "candlestick");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "candlestick.reference-area"
  )
    ? ", ReferenceArea"
    : "";
  const yAxisLeftVisible = isStudioComponentVisible(
    state,
    "candlestick.yaxis.left"
  );
  const yAxisImport = yAxisLeftVisible ? ", YAxis" : "";

  return {
    code: `import { CandlestickChart, Candlestick, ChartTooltip, XAxis, LinearGradient${gridImport}${backgroundImport}${referenceAreaImport}${yAxisImport}${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<CandlestickChart data={ohlcData}
  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))} candleGap={${state.candleGap}} margin={{ top: 16, right: 16, bottom: 40, left: 56 }}>
  ${gradientBlock}${patternBlock}${backgroundBlock}${gridBlock}${referenceAreaBlock}
  <Candlestick fadedOpacity={${state.candleFadedOpacity}} ${positiveFill} ${negativeFill}${patternProps} />
  <ChartTooltip showDots={${state.candleShowDots}} />${yAxisLeftVisible ? `\n  <YAxis numTicks={${getLineYAxisNumTicks(state, "left")}} formatLargeNumbers={${getLineYAxisFormatLargeNumbers(state, "left")}} />` : ""}
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

export function sunburstCodegen(state: StudioUrlState) {
  const { arcs } = buildArcs(sunburstData);
  const segmentLines = arcs
    .map(
      (arc) => `    <SunburstSegment index={${arc.arcIndex}} key="${arc.id}" />`
    )
    .join("\n");

  const labelFill = state.sunburstLabelColor.trim()
    ? `"${state.sunburstLabelColor.trim()}"`
    : '"var(--chart-label)"';
  const labelStroke = state.sunburstLabelOutlineColor.trim()
    ? `"${state.sunburstLabelOutlineColor.trim()}"`
    : '"var(--chart-background)"';

  const labelsBlock = state.sunburstShowLabels
    ? `
  <SunburstLabels
    fontSize={${state.sunburstLabelFontSize}}
    fill={${labelFill}}
    stroke={${labelStroke}}
    strokeWidth={${state.sunburstLabelOutlineWidth}}
  />`
    : "";

  return {
    code: `import {
  SunburstBreadcrumb,
  SunburstCenter,
  SunburstChart,
  SunburstHint,
  SunburstLabels,
  SunburstSegment,
  useSunburstBreadcrumbItems,
} from "@bklitui/ui/charts";

function DrillBreadcrumb() {
  const { items, zoomTo } = useSunburstBreadcrumbItems();
  // Compose your breadcrumb UI here (e.g. shadcn Breadcrumb)
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id}>
          {item.isCurrent ? (
            item.label
          ) : (
            <button onClick={() => zoomTo(item.id)} type="button">
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}

<SunburstChart data={sunburstData} size={520} hoverPop={${state.pieHoverOffset}}>
  <SunburstBreadcrumb>
    <DrillBreadcrumb />
  </SunburstBreadcrumb>${labelsBlock}
${segmentLines}
  <SunburstCenter />
  <SunburstHint />
</SunburstChart>`,
    data: `const sunburstData = ${JSON.stringify(sunburstData, null, 2)};`,
  };
}

function serializeHeatmapLevelStyle(style: HeatmapLevelStyle): string {
  const entries = [
    `color: ${JSON.stringify(style.color)}`,
    `fillMode: ${JSON.stringify(style.fillMode ?? "solid")}`,
    `pattern: ${JSON.stringify(style.pattern ?? "none")}`,
  ];

  const optionalEntries: Array<string | null> = [
    style.patternColor
      ? `patternColor: ${JSON.stringify(style.patternColor)}`
      : null,
    style.patternScale != null && style.patternScale !== 1
      ? `patternScale: ${style.patternScale}`
      : null,
    style.patternStrokeWidth != null && style.patternStrokeWidth !== 1
      ? `patternStrokeWidth: ${style.patternStrokeWidth}`
      : null,
    style.patternRadius != null && style.patternRadius !== 2
      ? `patternRadius: ${style.patternRadius}`
      : null,
    style.patternComplement ? "patternComplement: true" : null,
    style.patternFill
      ? `patternFill: ${JSON.stringify(style.patternFill)}`
      : null,
    style.patternTileBackground
      ? `patternTileBackground: ${JSON.stringify(style.patternTileBackground)}`
      : null,
    style.patternOpacity != null && style.patternOpacity !== 1
      ? `patternOpacity: ${style.patternOpacity}`
      : null,
    style.patternDotsFill === false ? "patternDotsFill: false" : null,
  ];

  for (const entry of optionalEntries) {
    if (entry) {
      entries.push(entry);
    }
  }

  return `{ ${entries.join(", ")} }`;
}

export function heatmapCodegen(state: StudioUrlState) {
  const motion = motionSliceFromState(state);
  const anim = cssRevealAnimationCodegen(state.animationDuration, motion);
  const enterStagger = `enterStaggerScale={${state.motionStaggerScale.toFixed(2)}}`;
  const enterTransition = `enterTransition={${motionTransitionCodegen(motion)}}`;
  const loadingProps =
    state.heatmapChartState === "loading"
      ? `
  status="loading"
  loadingLabel="${state.heatmapLoadingLabel}"
  loadingOpacity={${state.heatmapLoadingOpacity}}
  loadingCellMaxOpacity={${state.heatmapLoadingCellMaxOpacity}}
  loadingCellRandomness={${state.heatmapLoadingCellRandomness}}`
      : "";
  const weekStartProp =
    state.heatmapWeekStartDay === "0"
      ? ""
      : `\n  weekStartDay={${state.heatmapWeekStartDay}}`;
  const cellInactiveProps = [
    state.heatmapCellsInactiveOpacity === 0.3
      ? null
      : `inactiveOpacity={${state.heatmapCellsInactiveOpacity}}`,
    state.heatmapCellsInactiveScale === 1
      ? null
      : `inactiveScale={${state.heatmapCellsInactiveScale}}`,
  ]
    .filter(Boolean)
    .join(" ");
  const cellProps = `cornerRadius={${state.heatmapCornerRadius}}${cellInactiveProps ? ` ${cellInactiveProps}` : ""}`;
  const levelStyles = studioHeatmapLevelStyles(state);
  const levelStylesLiteral = `[${levelStyles.map(serializeHeatmapLevelStyle).join(", ")}] as const`;
  const levelStylesConst = `const heatmapLevelStyles = ${levelStylesLiteral};`;
  const chartProps = `gap={${state.heatmapGap}}
  levelStyles={heatmapLevelStyles}${weekStartProp}
  ${anim}
  ${enterTransition}
  ${enterStagger}${loadingProps}`;
  const legendProps = [
    `align="${state.legendAlign}"`,
    `cellSize={${state.heatmapLegendCellSize}}`,
    `cornerRadius={${state.heatmapCornerRadius}}`,
    `gap={${state.heatmapGap}}`,
    state.legendFontSize === 13 ? null : `fontSize={${state.legendFontSize}}`,
    state.heatmapLegendVariant === "swatches"
      ? null
      : `variant="${state.heatmapLegendVariant}"`,
    state.heatmapLegendVariant === "gradient" &&
    state.heatmapLegendGradientSpan !== 5
      ? `gradientSpan={${state.heatmapLegendGradientSpan}}`
      : null,
    "levelStyles={heatmapLevelStyles}",
    cellInactiveProps || null,
  ]
    .filter(Boolean)
    .join(" ");
  const yAxisProps = [
    state.heatmapYAxisTickFilter === "odd"
      ? null
      : `tickFilter="${state.heatmapYAxisTickFilter}"`,
    state.heatmapYAxisLabelFormat === "full"
      ? null
      : `labelFormat="${state.heatmapYAxisLabelFormat}"`,
  ]
    .filter(Boolean)
    .join(" ");
  const yAxisBlock = yAxisProps
    ? `<HeatmapYAxis ${yAxisProps} />`
    : "<HeatmapYAxis />";
  const { separatorImport, separatorBlock } =
    heatmapSeparatorCodegenBlock(state);
  const legendBlock = `<HeatmapLegend ${legendProps} />`;
  const chartBlock = `<HeatmapChart data={contributionData} ${chartProps}>
      <HeatmapCells ${cellProps} />
      <HeatmapXAxis />
      ${yAxisBlock}
      <HeatmapTooltip />${separatorBlock}
    </HeatmapChart>`;
  const layoutBlock =
    state.legendPlacement === "top"
      ? `${legendBlock}\n    ${chartBlock}`
      : `${chartBlock}\n    ${legendBlock}`;

  return {
    code: `import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis${separatorImport},
} from "@bklitui/ui/charts";

${levelStylesConst}

<HeatmapInteractionProvider>
  <HeatmapInteractionBoundary>
    <div className="flex w-full flex-col items-stretch gap-3">
    ${layoutBlock}
    </div>
  </HeatmapInteractionBoundary>
</HeatmapInteractionProvider>`,
    data: `import type { HeatmapColumn } from "@bklitui/ui/charts";

const contributionData: HeatmapColumn[] = [/* week columns */];`,
  };
}

export function liveLineCodegen(state: StudioUrlState) {
  const curveName = curveImportName(state.curve);
  const backgroundBlock = backgroundCodegenBlock(state, "live-line");
  const gridVisible = isStudioComponentVisible(state, "live-line.grid");
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "live-line");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "live-line.reference-area"
  )
    ? ", ReferenceArea"
    : "";

  return {
    code: `import { LiveLineChart, LiveLine, LiveXAxis, LiveYAxis${gridImport}${backgroundImport}${referenceAreaImport} } from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";

<LiveLineChart
  data={data}
  value={latest}
  window={${state.liveWindow}}
  lerpSpeed={${state.liveLerpSpeed}}
  exaggerate={${state.liveExaggerate}}
  paused={${state.livePaused}}
>${backgroundBlock}${gridBlock}${referenceAreaBlock}
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

  const backgroundBlock = backgroundCodegenBlock(state, "scatter");
  const gridVisible = isStudioComponentVisible(state, "scatter.grid");
  const gridBlock = gridVisible ? `\n  <Grid${gridPropsCodegen(state)} />` : "";
  const referenceAreaBlock = referenceAreaCodegenBlock(state, "scatter");
  const gridImport = gridVisible ? ", Grid" : "";
  const backgroundImport = backgroundBlock ? ", Background" : "";
  const referenceAreaImport = isStudioComponentVisible(
    state,
    "scatter.reference-area"
  )
    ? ", ReferenceArea"
    : "";

  return {
    code: `import { ScatterChart, Scatter, XAxis, ChartTooltip${gridImport}${backgroundImport}${referenceAreaImport} } from "@bklitui/ui/charts";

<ScatterChart data={chartData}${anim}>${backgroundBlock}${gridBlock}${referenceAreaBlock}
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
  const dataSnippet =
    getProjectionCount(state) > 0
      ? studioTrendingDataSnippet(state, "date")
      : studioCartesianDataSnippet(state, "date");
  return dataSnippet + projectionCodegenDataSnippets(state);
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
