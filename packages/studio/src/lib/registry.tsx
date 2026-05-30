"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  Candlestick,
  CandlestickChart,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  LinearGradient,
  LineChart,
  PatternArea,
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  Scatter,
  ScatterChart,
  SeriesBar,
  XAxis,
} from "@bklitui/ui/charts";
import { validChartSlugs } from "@/chart-slugs";
import { ChoroplethStudioPreview } from "@/components/charts/choropleth-studio";
import { FunnelStudioPreview } from "@/components/charts/funnel-studio-preview";
import { GaugeStudioPreview } from "@/components/charts/gauge-studio-preview";
import { LineProfitLossStudioChart } from "@/components/charts/line-profit-loss-studio";
import { LiveLineStudioPreview } from "@/components/charts/live-line-studio";
import { PieStudioPreview } from "@/components/charts/pie-studio-preview";
import { RingStudioPreview } from "@/components/charts/ring-studio-preview";
import {
  StudioCartesianFill,
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/charts/studio-chart-layout";
import { fadeEdgesPropValue } from "@/components/controls/fade-edges-picker";
import {
  getStudioCssRevealPropsForPreview,
  getStudioMotionEnterProps,
  motionSliceFromState,
  studioAnimationDurationMs,
  studioPreviewChartKey,
} from "./chart-animation";
import {
  areaChartDataSnippet,
  barCodegen,
  candlestickCodegen,
  cartesianCodegen,
  choroplethDataSnippet,
  composedCodegen,
  funnelCodegen,
  gaugeCodegen,
  lineChartDataSnippet,
  liveLineCodegen,
  radarCodegen,
  ringCodegen,
  sankeyCodegen,
  scatterCodegen,
} from "./codegen-helpers";
import { resolveCurve } from "./curves";
import {
  barHorizontalData,
  candlestickOhlcData,
  clampStudioSeriesCount,
  generateStudioCartesianData,
  pieData,
  radarDataDual,
  radarMetrics5,
  STUDIO_SERIES_COLORS,
  STUDIO_SERIES_KEYS,
  sankeySimple,
  scatterStudioData,
} from "./demo-data";
import { isProfitLossLineMode } from "./line-chart-mode";
import { motionEnterPropsCodegen } from "./motion-codegen";
import { profitLossLineCodegen } from "./profit-loss-line-codegen";
import {
  areaChartControlGroups,
  barChartControlGroups,
  candlestickChartControlGroups,
  choroplethChartControlGroups,
  composedChartControlGroups,
  funnelChartControlGroups,
  gaugeControlGroups,
  getLineChartControlGroups,
  lineChartControlGroups,
  liveLineChartControlGroups,
  pieChartControlGroups,
  radarChartControlGroups,
  ringChartControlGroups,
  sankeyChartControlGroups,
  scatterChartControlGroups,
} from "./registry-control-groups";
import { seriesStrokePropsFromState } from "./series-stroke-props";
import type { ChartSlug, StudioChartConfig } from "./types";
import { chartLabels } from "./types";

const gaugeConfig: StudioChartConfig = {
  slug: "gauge-chart",
  label: chartLabels["gauge-chart"],
  supportsPatterns: true,
  motionPanel: true,
  motionStagger: true,
  controls: [],
  controlGroups: gaugeControlGroups,
  render: (state, ctx) => <GaugeStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => gaugeCodegen(state),
};

const areaConfig: StudioChartConfig = {
  slug: "area-chart",
  label: chartLabels["area-chart"],
  supportsPatterns: true,
  supportsCurves: true,
  motionPanel: true,
  controls: [],
  controlGroups: areaChartControlGroups,
  render: (state, ctx) => {
    const curve = resolveCurve(state.curve);
    const fill = ctx.patternFill ?? undefined;
    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    const data = generateStudioCartesianData({
      seriesCount,
      pointCount: state.dataPoints,
      xAxis: "date",
      seed: ctx.dataSeed,
    });
    const seriesStroke = seriesStrokePropsFromState(state, data.length);
    return (
      <StudioCartesianFill>
        <AreaChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={data}
          key={studioPreviewChartKey(ctx)}
        >
          <Grid horizontal />
          {ctx.patternDefs}
          {STUDIO_SERIES_KEYS.slice(0, seriesCount).flatMap((key, idx) => {
            // AreaChart picks up series via `Children.forEach` — wrapping in <Fragment> hides children, so flatten.
            const isPrimary = idx === 0;
            const patternThisSeries = isPrimary ? fill : undefined;
            const nodes = [
              <Area
                curve={curve}
                dataKey={key}
                fadeEdges={
                  patternThisSeries
                    ? false
                    : fadeEdgesPropValue(state.fadeEdges)
                }
                fill={isPrimary ? undefined : STUDIO_SERIES_COLORS[idx]}
                fillOpacity={patternThisSeries ? 0 : state.fillOpacity}
                gradientToOpacity={state.gradientToOpacity}
                key={`area-${key}`}
                showHighlight={state.showHighlight}
                showLine={state.showLine}
                strokeWidth={state.strokeWidth}
                {...seriesStroke}
              />,
            ];
            if (patternThisSeries) {
              nodes.unshift(
                <PatternArea
                  curve={curve}
                  dataKey={key}
                  fill={patternThisSeries}
                  key={`pattern-${key}`}
                />
              );
            }
            return nodes;
          })}
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => ({
    code: cartesianCodegen("AreaChart", state),
    data: areaChartDataSnippet(state),
  }),
};

const lineConfig: StudioChartConfig = {
  slug: "line-chart",
  label: chartLabels["line-chart"],
  supportsCurves: true,
  motionPanel: true,
  controls: [],
  controlGroups: lineChartControlGroups,
  resolveControlGroups: (state) =>
    getLineChartControlGroups({
      lineChartMode: isProfitLossLineMode(state) ? "profitLoss" : "standard",
    }),
  render: (state, ctx) => {
    if (isProfitLossLineMode(state)) {
      return (
        <StudioCartesianFill className="size-full">
          <LineProfitLossStudioChart ctx={ctx} state={state} />
        </StudioCartesianFill>
      );
    }

    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    const data = generateStudioCartesianData({
      seriesCount,
      pointCount: state.dataPoints,
      xAxis: "date",
      seed: ctx.dataSeed,
    });
    const seriesStroke = seriesStrokePropsFromState(state, data.length);
    return (
      <StudioCartesianFill>
        <LineChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={data}
          key={studioPreviewChartKey(ctx)}
        >
          <Grid horizontal />
          {STUDIO_SERIES_KEYS.slice(0, seriesCount).map((key, idx) => (
            <Line
              curve={resolveCurve(state.curve)}
              dataKey={key}
              fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
              key={key}
              showHighlight={state.showHighlight}
              stroke={idx === 0 ? undefined : STUDIO_SERIES_COLORS[idx]}
              strokeWidth={state.strokeWidth}
              {...seriesStroke}
            />
          ))}
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) =>
    isProfitLossLineMode(state)
      ? profitLossLineCodegen(state)
      : {
          code: cartesianCodegen("LineChart", state),
          data: lineChartDataSnippet(state),
        },
};

const scatterConfig: StudioChartConfig = {
  slug: "scatter-chart",
  label: chartLabels["scatter-chart"],
  motionPanel: true,
  controls: [],
  controlGroups: scatterChartControlGroups,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <ScatterChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        className="size-full"
        data={scatterStudioData}
        key={studioPreviewChartKey(ctx)}
      >
        <Grid horizontal />
        <Scatter
          dataKey="desktop"
          fadeOnHover={state.scatterFadeOnHover}
          inactiveOpacity={state.scatterInactiveOpacity}
          radius={state.scatterRadius}
          ringGap={state.scatterRingGap}
          showActiveHighlight={state.scatterShowActiveHighlight}
          strokeWidth={state.scatterRingWidth}
        />
        {state.scatterSecondSeries ? (
          <Scatter
            dataKey="mobile"
            fadeOnHover={state.scatterFadeOnHover}
            inactiveOpacity={state.scatterInactiveOpacity}
            radius={state.scatterRadius}
            ringGap={state.scatterRingGap}
            showActiveHighlight={state.scatterShowActiveHighlight}
            strokeWidth={state.scatterRingWidth}
          />
        ) : null}
        <XAxis />
        <ChartTooltip />
      </ScatterChart>
    </StudioCartesianFill>
  ),
  generateCode: (state) => scatterCodegen(state),
};

const barConfig: StudioChartConfig = {
  slug: "bar-chart",
  label: chartLabels["bar-chart"],
  supportsPatterns: true,
  motionPanel: true,
  controls: [],
  controlGroups: barChartControlGroups,
  render: (state, ctx) => {
    const horizontal = state.barOrientation === "horizontal";
    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    // barSeriesMode "single" is treated as grouped when dataSeries > 1.
    const stacked = seriesCount > 1 && state.barSeriesMode === "stacked";
    const lineCap = state.barLineCap;
    const primaryFill = ctx.patternFill ?? "var(--chart-1)";

    let chartData: Record<string, unknown>[];
    let xKey: string;
    let seriesKeys: readonly string[];
    if (horizontal) {
      // Horizontal bar keeps its categorical browser dataset for readability.
      chartData = barHorizontalData as unknown as Record<string, unknown>[];
      xKey = "browser";
      seriesKeys = ["users"];
    } else {
      chartData = generateStudioCartesianData({
        seriesCount,
        pointCount: state.dataPoints,
        xAxis: "month",
        seed: ctx.dataSeed,
      }) as unknown as Record<string, unknown>[];
      xKey = "month";
      seriesKeys = STUDIO_SERIES_KEYS.slice(0, seriesCount);
    }

    return (
      <StudioCartesianFill>
        <BarChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          barGap={state.barGap}
          barWidth={state.barWidth > 0 ? state.barWidth : undefined}
          className="size-full"
          data={chartData}
          key={studioPreviewChartKey(ctx)}
          margin={horizontal ? { left: 80 } : undefined}
          orientation={state.barOrientation}
          stacked={stacked}
          stackGap={stacked ? 3 : 0}
          xDataKey={xKey}
        >
          <Grid
            fadeVertical={horizontal}
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {ctx.patternDefs}
          {seriesKeys.map((key, idx) => (
            <Bar
              dataKey={key}
              fadedOpacity={state.barFadedOpacity}
              fill={idx === 0 ? primaryFill : STUDIO_SERIES_COLORS[idx]}
              groupGap={state.groupGap}
              key={key}
              lineCap={lineCap}
              stackGap={stacked ? 3 : 0}
            />
          ))}
          <BarXAxis />
          <ChartTooltip showCrosshair={false} />
        </BarChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => barCodegen(state),
};

const composedConfig: StudioChartConfig = {
  slug: "composed-chart",
  label: chartLabels["composed-chart"],
  supportsPatterns: true,
  supportsCurves: true,
  motionPanel: true,
  controls: [],
  controlGroups: composedChartControlGroups,
  render: (state, ctx) => {
    const curve = resolveCurve(state.curve);
    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    const data = generateStudioCartesianData({
      seriesCount,
      pointCount: state.dataPoints,
      xAxis: "date",
      seed: ctx.dataSeed,
    });
    const seriesStroke = seriesStrokePropsFromState(state, data.length);
    const barKey = STUDIO_SERIES_KEYS[0];
    return (
      <StudioCartesianFill>
        <ComposedChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={data}
          key={studioPreviewChartKey(ctx)}
        >
          <Grid horizontal />
          {ctx.patternDefs}
          {barKey ? (
            <SeriesBar
              dataKey={barKey}
              fill={ctx.patternFill ?? "var(--chart-1)"}
              radius={state.composedBarRadius}
            />
          ) : null}
          {STUDIO_SERIES_KEYS.slice(1, seriesCount).flatMap(
            (key, secondaryIdx) => {
              // ComposedChart picks up series via `Children.forEach` — keep Area+Line as flat siblings, not inside a Fragment.
              const colorIdx = secondaryIdx + 1;
              const color = STUDIO_SERIES_COLORS[colorIdx];
              return [
                <Area
                  curve={curve}
                  dataKey={key}
                  fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
                  fill={color}
                  fillOpacity={state.fillOpacity}
                  key={`area-${key}`}
                  {...seriesStroke}
                />,
                <Line
                  curve={curve}
                  dataKey={key}
                  fadeEdges={fadeEdgesPropValue(state.fadeEdges)}
                  key={`line-${key}`}
                  stroke={color}
                  strokeWidth={state.strokeWidth}
                  {...seriesStroke}
                />,
              ];
            }
          )}
          <XAxis />
          <ChartTooltip />
        </ComposedChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => composedCodegen(state),
};

const pieConfig: StudioChartConfig = {
  slug: "pie-chart",
  label: chartLabels["pie-chart"],
  motionPanel: true,
  controls: [],
  controlGroups: pieChartControlGroups,
  render: (state, ctx) => <PieStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => {
    const useLines = state.pieFillMode === "lines";
    const angleProps = ` startAngle={${state.pieStartAngleDeg} * Math.PI / 180} endAngle={${state.pieEndAngleDeg} * Math.PI / 180}`;
    const patternDefs = useLines
      ? `\n  {/* Per-slice line patterns — see Pie Chart Patterns example */}\n  <PatternLines id="pp-1" height={6} width={6} stroke="var(--chart-1)" orientation={["diagonal"]} />\n  <PatternLines id="pp-2" height={6} width={6} stroke="var(--chart-2)" orientation={["horizontal"]} />\n  {/* …one PatternLines per slice */}`
      : "";
    const slices = useLines
      ? pieData
          .map(
            (_, i) =>
              `\n  <PieSlice index={${i}} fill="url(#pp-${i + 1})" hoverEffect="${state.pieHoverEffect}" />`
          )
          .join("")
      : pieData
          .map(
            (_, i) =>
              `\n  <PieSlice index={${i}} hoverEffect="${state.pieHoverEffect}" />`
          )
          .join("");

    const motionProps = motionEnterPropsCodegen(
      motionSliceFromState(state),
      state.motionStaggerScale
    );

    return {
      code: `<PieChart data={pieData} size={${state.pieSize}}${state.innerRadius ? ` innerRadius={${state.innerRadius}}` : ""} padAngle={${state.padAngle}} cornerRadius={${state.pieCornerRadius}} hoverOffset={${state.pieHoverOffset}}${angleProps}
  ${motionProps}>${patternDefs}${slices}
  ${state.innerRadius > 0 ? '<PieCenter defaultLabel="Total" />' : ""}
</PieChart>`,
      data: `const pieData = ${JSON.stringify(pieData, null, 2)};`,
    };
  },
};

const ringConfig: StudioChartConfig = {
  slug: "ring-chart",
  label: chartLabels["ring-chart"],
  motionPanel: true,
  controls: [],
  controlGroups: ringChartControlGroups,
  render: (state, ctx) => <RingStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => ringCodegen(state),
};

const radarConfig: StudioChartConfig = {
  slug: "radar-chart",
  label: chartLabels["radar-chart"],
  motionPanel: true,
  motionStagger: true,
  controls: [],
  controlGroups: radarChartControlGroups,
  render: (state, ctx) => {
    const motionEnter = getStudioMotionEnterProps(state, {
      linear: ctx.isRecording,
    });
    return (
      <StudioRadialCenter frame={ctx.frame}>
        <RadarChart
          data={radarDataDual}
          enterDurationMs={studioAnimationDurationMs(state)}
          enterTransition={motionEnter.enterTransition}
          key={studioPreviewChartKey(ctx)}
          levels={state.radarLevels}
          margin={state.radarMargin}
          metrics={radarMetrics5}
          motionReplayKey={studioPreviewChartKey(ctx)}
          size={studioRadialSize(ctx.frame, state.radarSize)}
          staggerScale={motionEnter.enterStaggerScale}
        >
          {state.showRadarGrid ? (
            <RadarGrid />
          ) : (
            <RadarGrid showLabels={false} />
          )}
          <RadarAxis />
          <RadarLabels fontSize={10} offset={16} />
          {radarDataDual.map((item, index) => (
            <RadarArea
              index={index}
              key={item.label}
              showGlow={false}
              showPoints={state.radarShowPoints}
              showStroke={state.radarShowStroke}
            />
          ))}
        </RadarChart>
      </StudioRadialCenter>
    );
  },
  generateCode: (state) => radarCodegen(state),
};

const candlestickConfig: StudioChartConfig = {
  slug: "candlestick-chart",
  label: chartLabels["candlestick-chart"],
  supportsPatterns: true,
  motionPanel: true,
  controls: [],
  controlGroups: candlestickChartControlGroups,
  render: (state, ctx) => {
    const patternUp = state.pattern === "none" ? undefined : ctx.patternFill;
    const positiveFill = state.candleUseGradient
      ? "url(#studio-candle-up)"
      : "var(--chart-1)";
    const negativeFill = state.candleUseGradient
      ? "url(#studio-candle-down)"
      : "var(--chart-3)";

    return (
      <StudioCartesianFill>
        <CandlestickChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          candleGap={state.candleGap}
          className="size-full"
          data={candlestickOhlcData}
          key={studioPreviewChartKey(ctx)}
          margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
        >
          {state.candleUseGradient ? (
            <>
              <LinearGradient
                from="var(--chart-1)"
                id="studio-candle-up"
                to="var(--chart-3)"
              />
              <LinearGradient
                from="var(--chart-4)"
                id="studio-candle-down"
                to="var(--chart-5)"
              />
            </>
          ) : null}
          {ctx.patternDefs}
          <Candlestick
            bodyPatternNegative={patternUp}
            bodyPatternPositive={patternUp}
            fadedOpacity={state.candleFadedOpacity}
            negativeFill={negativeFill}
            positiveFill={positiveFill}
          />
          <ChartTooltip showDots={state.candleShowDots} />
          <XAxis />
        </CandlestickChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => candlestickCodegen(state),
};

const funnelConfig: StudioChartConfig = {
  slug: "funnel-chart",
  label: chartLabels["funnel-chart"],
  supportsPatterns: true,
  motionPanel: true,
  motionStagger: true,
  controls: [],
  controlGroups: funnelChartControlGroups,
  render: (state, ctx) => <FunnelStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => funnelCodegen(state),
};

const liveLineConfig: StudioChartConfig = {
  slug: "live-line-chart",
  label: chartLabels["live-line-chart"],
  supportsCurves: true,
  motionPanel: true,
  controls: [],
  controlGroups: liveLineChartControlGroups,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <LiveLineStudioPreview
        badge={state.liveBadge}
        chartKey={studioPreviewChartKey(ctx)}
        curve={state.curve}
        exaggerate={state.liveExaggerate}
        fill={state.liveFill}
        frame={ctx.frame}
        intervalMs={state.liveInterval}
        lerpSpeed={state.liveLerpSpeed}
        paused={state.livePaused}
        pulse={state.livePulse}
        strokeWidth={state.strokeWidth}
        windowSecs={state.liveWindow}
      />
    </StudioCartesianFill>
  ),
  generateCode: (state) => liveLineCodegen(state),
};

const choroplethConfig: StudioChartConfig = {
  slug: "choropleth-chart",
  label: chartLabels["choropleth-chart"],
  motionPanel: true,
  controls: [],
  controlGroups: choroplethChartControlGroups,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <ChoroplethStudioPreview
        analytics={state.choroplethAnalytics}
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        bgPattern={state.choroplethBgPattern}
        fgPattern={state.choroplethFgPattern}
        key={studioPreviewChartKey(ctx)}
        showGraticule={state.showGraticule}
      />
    </StudioCartesianFill>
  ),
  generateCode: (state) => {
    const bg =
      state.choroplethBgPattern === "none"
        ? ""
        : `\n  <ChoroplethFeatureComponent getFeaturePattern={() => "studio-choro-bg"} patterns={<PatternLines id="studio-choro-bg" height={8} width={8} orientation={["diagonal"]} stroke="var(--chart-5)" strokeWidth={1} />} />`;
    const regionExpr = "\x24{getRegionCategory(feat.properties?.name)}";
    const fg =
      state.choroplethFgPattern === "none"
        ? ""
        : `\n  <ChoroplethFeatureComponent getFeaturePattern={(feat) => \`choro-p-${regionExpr}\`} patterns={/* regional PatternLines */} />`;
    const solid =
      state.choroplethAnalytics ||
      (state.choroplethBgPattern === "none" &&
        state.choroplethFgPattern === "none")
        ? `\n  <ChoroplethFeatureComponent${state.choroplethAnalytics ? " getFeatureColor={getVisitorColor}" : ' fill="var(--chart-3)"'} />`
        : "";

    return {
      code: `<ChoroplethChart data={geojson} aspectRatio="16 / 9" animationDuration={${state.animationDuration}}>${state.showGraticule ? "\n  <ChoroplethGraticule />" : ""}${bg}${solid}${fg}
  <ChoroplethTooltip${state.choroplethAnalytics ? ' getFeatureValue={getVisitorValue} valueLabel="Visitors"' : ""} />
</ChoroplethChart>`,
      data: choroplethDataSnippet(),
    };
  },
};

const sankeyConfig: StudioChartConfig = {
  slug: "sankey-chart",
  label: chartLabels["sankey-chart"],
  motionPanel: true,
  controls: [],
  controlGroups: sankeyChartControlGroups,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <SankeyChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        className="size-full"
        data={sankeySimple}
        key={studioPreviewChartKey(ctx)}
        nodePadding={state.sankeyNodePadding}
        nodeWidth={state.sankeyNodeWidth}
      >
        <SankeyNode />
        <SankeyLink strokeOpacity={state.linkOpacity} />
        <SankeyTooltip />
      </SankeyChart>
    </StudioCartesianFill>
  ),
  generateCode: (state) => sankeyCodegen(state),
};

export const studioRegistry: Record<ChartSlug, StudioChartConfig> = {
  "gauge-chart": gaugeConfig,
  "area-chart": areaConfig,
  "line-chart": lineConfig,
  "profit-loss-line": lineConfig,
  "scatter-chart": scatterConfig,
  "bar-chart": barConfig,
  "composed-chart": composedConfig,
  "pie-chart": pieConfig,
  "ring-chart": ringConfig,
  "radar-chart": radarConfig,
  "candlestick-chart": candlestickConfig,
  "funnel-chart": funnelConfig,
  "live-line-chart": liveLineConfig,
  "choropleth-chart": choroplethConfig,
  "sankey-chart": sankeyConfig,
};

export function getStudioConfig(slug: ChartSlug): StudioChartConfig {
  const config = studioRegistry[slug];
  if (!config) {
    throw new Error(`Unknown studio chart: ${slug}`);
  }
  return config;
}

export const studioChartList = validChartSlugs
  .filter((slug) => slug !== "profit-loss-line")
  .map((slug) => ({
    slug,
    label: chartLabels[slug],
  }));
