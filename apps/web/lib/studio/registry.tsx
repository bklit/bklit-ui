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
  SeriesBar,
  XAxis,
} from "@bklitui/ui/charts";
import { validChartSlugs } from "@/components/charts/chart-slugs";
import { ChoroplethStudioPreview } from "@/components/studio/charts/choropleth-studio";
import { FunnelStudioPreview } from "@/components/studio/charts/funnel-studio-preview";
import { GaugeStudioPreview } from "@/components/studio/charts/gauge-studio-preview";
import { LiveLineStudioPreview } from "@/components/studio/charts/live-line-studio";
import { PieStudioPreview } from "@/components/studio/charts/pie-studio-preview";
import { RingStudioPreview } from "@/components/studio/charts/ring-studio-preview";
import {
  StudioCartesianFill,
  StudioRadialCenter,
  studioRadialSize,
} from "@/components/studio/charts/studio-chart-layout";
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
} from "./codegen-helpers";
import { resolveCurve } from "./curves";
import {
  areaData,
  barData,
  barHorizontalData,
  barStackedData,
  candlestickOhlcData,
  composedDemoData,
  lineHeroData,
  pieData,
  radarDataDual,
  radarMetrics5,
  sankeySimple,
} from "./demo-data";
import { motionEnterPropsCodegen } from "./motion-codegen";
import {
  areaChartControlGroups,
  barChartControlGroups,
  candlestickChartControlGroups,
  choroplethChartControlGroups,
  composedChartControlGroups,
  funnelChartControlGroups,
  gaugeControlGroups,
  lineChartControlGroups,
  liveLineChartControlGroups,
  pieChartControlGroups,
  radarChartControlGroups,
  ringChartControlGroups,
  sankeyChartControlGroups,
} from "./registry-control-groups";
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
    return (
      <StudioCartesianFill>
        <AreaChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={areaData}
          key={studioPreviewChartKey(ctx)}
        >
          <Grid horizontal />
          {ctx.patternDefs}
          {fill ? (
            <PatternArea curve={curve} dataKey="desktop" fill={fill} />
          ) : null}
          <Area
            curve={curve}
            dataKey="desktop"
            fadeEdges={fill ? false : state.fadeEdges}
            fillOpacity={fill ? 0 : state.fillOpacity}
            gradientToOpacity={state.gradientToOpacity}
            showHighlight={state.showHighlight}
            showLine={state.showLine}
            strokeWidth={state.strokeWidth}
          />
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => ({
    code: cartesianCodegen("AreaChart", state, "desktop"),
    data: areaChartDataSnippet(),
  }),
};

const lineConfig: StudioChartConfig = {
  slug: "line-chart",
  label: chartLabels["line-chart"],
  supportsCurves: true,
  motionPanel: true,
  controls: [],
  controlGroups: lineChartControlGroups,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <LineChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        className="size-full"
        data={lineHeroData}
        key={studioPreviewChartKey(ctx)}
      >
        <Grid horizontal />
        <Line
          curve={resolveCurve(state.curve)}
          dataKey="desktop"
          fadeEdges={state.fadeEdges}
          showHighlight={state.showHighlight}
          strokeWidth={state.strokeWidth}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </StudioCartesianFill>
  ),
  generateCode: (state) => ({
    code: cartesianCodegen("LineChart", state, "desktop"),
    data: lineChartDataSnippet(),
  }),
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
    const stacked = state.barSeriesMode === "stacked";
    const multi = state.barSeriesMode !== "single";
    type BarStudioDatum =
      | (typeof barData)[number]
      | (typeof barHorizontalData)[number]
      | (typeof barStackedData)[number];
    let chartData: BarStudioDatum[] = barData;
    if (horizontal) {
      chartData = barHorizontalData;
    } else if (multi) {
      chartData = barStackedData;
    }
    const xKey = horizontal ? "browser" : "month";
    const fill = ctx.patternFill ?? "var(--chart-1)";
    const lineCap = state.barLineCap;

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
          <Bar
            dataKey={horizontal ? "users" : "desktop"}
            fadedOpacity={state.barFadedOpacity}
            fill={fill}
            groupGap={state.groupGap}
            lineCap={lineCap}
            stackGap={stacked ? 3 : 0}
          />
          {multi && !horizontal ? (
            <Bar
              dataKey="mobile"
              fadedOpacity={state.barFadedOpacity}
              fill="var(--chart-3)"
              groupGap={state.groupGap}
              lineCap={lineCap}
              stackGap={stacked ? 3 : 0}
            />
          ) : null}
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
    return (
      <StudioCartesianFill>
        <ComposedChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={composedDemoData}
          key={studioPreviewChartKey(ctx)}
        >
          <Grid horizontal />
          {ctx.patternDefs}
          <SeriesBar
            dataKey="revenue"
            fill={ctx.patternFill ?? "var(--chart-1)"}
            radius={state.composedBarRadius}
          />
          <Area
            curve={curve}
            dataKey="runRate"
            fadeEdges={state.fadeEdges}
            fill="var(--chart-4)"
            fillOpacity={state.fillOpacity}
          />
          <Line
            curve={curve}
            dataKey="runRate"
            fadeEdges={state.fadeEdges}
            stroke="var(--chart-2)"
            strokeWidth={state.strokeWidth}
          />
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

export const studioChartList = validChartSlugs.map((slug) => ({
  slug,
  label: chartLabels[slug],
}));
