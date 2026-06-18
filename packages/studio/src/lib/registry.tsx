"use client";

import {
  Area,
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  Scatter,
  ScatterChart,
  SeriesBar,
  XAxis,
} from "@bklitui/ui/charts";
import { validChartSlugs } from "@/chart-slugs";
import { AreaStudioPreview } from "@/components/charts/area-studio-preview";
import { CandlestickStudioPreview } from "@/components/charts/candlestick-studio-preview";
import { ChoroplethStudioPreview } from "@/components/charts/choropleth-studio";
import { FunnelStudioPreview } from "@/components/charts/funnel-studio-preview";
import { GaugeStudioPreview } from "@/components/charts/gauge-studio-preview";
import { HeatmapStudioPreview } from "@/components/charts/heatmap-studio-preview";
import { LineChartStudioStandardPreview } from "@/components/charts/line-chart-studio-standard-preview";
import { LineProfitLossStudioChart } from "@/components/charts/line-profit-loss-studio";
import { LiveLineStudioPreview } from "@/components/charts/live-line-studio";
import { PieStudioPreview } from "@/components/charts/pie-studio-preview";
import { RadarStudioPreview } from "@/components/charts/radar-studio-preview";
import { RingStudioPreview } from "@/components/charts/ring-studio-preview";
import { SankeyStudioPreview } from "@/components/charts/sankey-studio-preview";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import {
  StudioChartShell,
  StudioVisibleLayer,
} from "@/components/charts/studio-chart-shell";
import {
  StudioChartYAxisLayers,
  timeSeriesChartMargin,
} from "@/components/charts/studio-chart-y-axis";
import { StudioReferenceAreaLayer } from "@/components/charts/studio-reference-area-layer";
import { fadeEdgesPropValue } from "@/components/controls/fade-edges-picker";
import {
  getStudioCssRevealPropsForPreview,
  motionSliceFromState,
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
  heatmapCodegen,
  lineChartDataSnippet,
  liveLineCodegen,
  radarCodegen,
  ringCodegen,
  sankeyCodegen,
  scatterCodegen,
} from "./codegen-helpers";
import { resolveCurve } from "./curves";
import {
  clampStudioSeriesCount,
  generateStudioCartesianData,
  getBarHorizontalData,
  getScatterData,
  getVisitorsByCountry,
  pieData,
  STUDIO_SERIES_KEYS,
} from "./demo-data";
import { isProfitLossLineMode } from "./line-chart-mode";
import { getLineSeriesYAxisId } from "./line-series-y-axis";
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
  heatmapChartControlGroups,
  lineChartControlGroups,
  liveLineChartControlGroups,
  pieChartControlGroups,
  radarChartControlGroups,
  ringChartControlGroups,
  sankeyChartControlGroups,
  scatterChartControlGroups,
} from "./registry-control-groups";
import { seriesStrokePropsFromState } from "./series-stroke-props";
import {
  studioCartesianBackgroundLayer,
  studioCartesianGridLayer,
} from "./studio-cartesian-layers";
import { chartTooltipPropsFromState } from "./studio-chart-overlays";
import { isStudioComponentVisible } from "./studio-component-visibility";
import {
  resolveAreaComponents,
  resolveBarComponents,
  resolveCandlestickComponents,
  resolveChoroplethComponents,
  resolveComposedComponents,
  resolveFunnelComponents,
  resolveGaugeComponents,
  resolveHeatmapComponents,
  resolveLineComponents,
  resolveLiveLineComponents,
  resolvePieComponents,
  resolveRadarComponents,
  resolveRingComponents,
  resolveSankeyComponents,
  resolveScatterComponents,
} from "./studio-components";
import { studioCartesianLegendItems } from "./studio-legend-items";
import { getEffectiveSeriesColor } from "./studio-series-design";
import {
  getSeriesCurve,
  getSeriesFadeEdges,
  getSeriesStrokeWidth,
} from "./studio-series-line-props";
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
  resolveComponents: () => resolveGaugeComponents(),
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
  resolveComponents: resolveAreaComponents,
  render: (state, ctx) => <AreaStudioPreview ctx={ctx} state={state} />,
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
  resolveComponents: resolveLineComponents,
  render: (state, ctx) => {
    if (isProfitLossLineMode(state)) {
      return (
        <StudioCartesianFill className="size-full">
          <LineProfitLossStudioChart ctx={ctx} state={state} />
        </StudioCartesianFill>
      );
    }

    return <LineChartStudioStandardPreview ctx={ctx} state={state} />;
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
  resolveComponents: resolveScatterComponents,
  render: (state, ctx) => (
    <StudioChartShell
      legendComponentId="scatter.legend"
      legendItems={[
        {
          label: "desktop",
          value: 100,
          color: getEffectiveSeriesColor(state, 0),
        },
        ...(state.scatterSecondSeries
          ? [
              {
                label: "mobile",
                value: 80,
                color: getEffectiveSeriesColor(state, 1),
              },
            ]
          : []),
      ]}
      state={ctx.chromeState}
    >
      <StudioCartesianFill>
        <ScatterChart
          {...getStudioCssRevealPropsForPreview(state, ctx)}
          className="size-full"
          data={getScatterData(ctx.dataSeed)}
          key={studioPreviewChartKey(ctx)}
          margin={timeSeriesChartMargin(state)}
          onPhaseChange={ctx.reportOgPhase}
        >
          {studioCartesianBackgroundLayer(
            state,
            "scatter.background",
            "scatter.grid"
          )}
          {studioCartesianGridLayer(state, "scatter.grid")}
          <StudioReferenceAreaLayer
            componentId="scatter.reference-area"
            state={state}
          />
          {isStudioComponentVisible(state, "scatter.desktop") ? (
            <Scatter
              dataKey="desktop"
              fadeOnHover={state.scatterFadeOnHover}
              inactiveOpacity={state.scatterInactiveOpacity}
              radius={state.scatterRadius}
              ringGap={state.scatterRingGap}
              showActiveHighlight={state.scatterShowActiveHighlight}
              strokeWidth={state.scatterRingWidth}
              yAxisId={getLineSeriesYAxisId(state, 0)}
            />
          ) : null}
          {state.scatterSecondSeries &&
          isStudioComponentVisible(state, "scatter.mobile") ? (
            <Scatter
              dataKey="mobile"
              fadeOnHover={state.scatterFadeOnHover}
              inactiveOpacity={state.scatterInactiveOpacity}
              radius={state.scatterRadius}
              ringGap={state.scatterRingGap}
              showActiveHighlight={state.scatterShowActiveHighlight}
              strokeWidth={state.scatterRingWidth}
              yAxisId={getLineSeriesYAxisId(state, 1)}
            />
          ) : null}
          <StudioChartYAxisLayers chartPrefix="scatter" state={state} />
          <StudioVisibleLayer componentId="scatter.xaxis" state={state}>
            <XAxis />
          </StudioVisibleLayer>
          <StudioVisibleLayer componentId="scatter.tooltip" state={state}>
            <ChartTooltip {...chartTooltipPropsFromState(state)} />
          </StudioVisibleLayer>
        </ScatterChart>
      </StudioCartesianFill>
    </StudioChartShell>
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
  resolveComponents: resolveBarComponents,
  render: (state, ctx) => {
    const horizontal = state.barOrientation === "horizontal";
    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    // barSeriesMode "single" is treated as grouped when dataSeries > 1.
    const stacked = seriesCount > 1 && state.barSeriesMode === "stacked";
    const lineCap = state.barLineCap;
    const seriesFillAt = (idx: number) =>
      ctx.patternFillAt(idx) ?? `var(--chart-${(idx % 5) + 1})`;

    let chartData: Record<string, unknown>[];
    let xKey: string;
    let seriesKeys: readonly string[];
    if (horizontal) {
      // Horizontal bar keeps its categorical browser dataset for readability.
      chartData = getBarHorizontalData(ctx.dataSeed) as unknown as Record<
        string,
        unknown
      >[];
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
      <StudioChartShell
        legendComponentId="bar.legend"
        legendItems={studioCartesianLegendItems(state, seriesCount)}
        state={ctx.chromeState}
      >
        <StudioCartesianFill>
          <BarChart
            {...getStudioCssRevealPropsForPreview(state, ctx)}
            barGap={state.barGap}
            barWidth={state.barWidth > 0 ? state.barWidth : undefined}
            className="size-full"
            data={chartData}
            key={studioPreviewChartKey(ctx)}
            margin={
              horizontal
                ? { left: 80 }
                : timeSeriesChartMargin(state, { left: 56 })
            }
            onPhaseChange={ctx.reportOgPhase}
            orientation={state.barOrientation}
            stacked={stacked}
            stackGap={stacked ? 3 : 0}
            xDataKey={xKey}
          >
            {studioCartesianBackgroundLayer(
              state,
              "bar.background",
              "bar.grid"
            )}
            {studioCartesianGridLayer(state, "bar.grid")}
            <StudioReferenceAreaLayer
              componentId="bar.reference-area"
              state={state}
            />
            {ctx.patternDefs}
            {seriesKeys.map((key, idx) => (
              <Bar
                dataKey={key}
                fadedOpacity={state.barFadedOpacity}
                fill={seriesFillAt(idx)}
                groupGap={state.groupGap}
                key={key}
                lineCap={lineCap}
                stackGap={stacked ? 3 : 0}
                yAxisId={
                  horizontal ? undefined : getLineSeriesYAxisId(state, idx)
                }
              />
            ))}
            {horizontal ? (
              <StudioVisibleLayer componentId="bar.baryaxis" state={state}>
                <BarYAxis />
              </StudioVisibleLayer>
            ) : (
              <StudioChartYAxisLayers chartPrefix="bar" state={state} />
            )}
            <StudioVisibleLayer componentId="bar.xaxis" state={state}>
              <BarXAxis />
            </StudioVisibleLayer>
            <StudioVisibleLayer componentId="bar.tooltip" state={state}>
              <ChartTooltip showCrosshair={false} />
            </StudioVisibleLayer>
          </BarChart>
        </StudioCartesianFill>
      </StudioChartShell>
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
  resolveComponents: resolveComposedComponents,
  render: (state, ctx) => {
    const seriesCount = clampStudioSeriesCount(state.dataSeries);
    const data = generateStudioCartesianData({
      seriesCount,
      pointCount: state.dataPoints,
      xAxis: "date",
      seed: ctx.dataSeed,
    });
    const barKey = STUDIO_SERIES_KEYS[0];
    return (
      <StudioChartShell
        legendComponentId="composed.legend"
        legendItems={studioCartesianLegendItems(state, seriesCount)}
        state={ctx.chromeState}
      >
        <StudioCartesianFill>
          <ComposedChart
            {...getStudioCssRevealPropsForPreview(state, ctx)}
            className="size-full"
            data={data}
            key={studioPreviewChartKey(ctx)}
            margin={timeSeriesChartMargin(state)}
            onPhaseChange={ctx.reportOgPhase}
          >
            {studioCartesianBackgroundLayer(
              state,
              "composed.background",
              "composed.grid"
            )}
            <StudioVisibleLayer componentId="composed.grid" state={state}>
              <Grid horizontal />
            </StudioVisibleLayer>
            <StudioReferenceAreaLayer
              componentId="composed.reference-area"
              state={state}
            />
            {ctx.patternDefs}
            {barKey ? (
              <SeriesBar
                dataKey={barKey}
                fill={ctx.patternFillAt(0) ?? "var(--chart-1)"}
                radius={state.composedBarRadius}
              />
            ) : null}
            {STUDIO_SERIES_KEYS.slice(1, seriesCount).flatMap(
              (key, secondaryIdx) => {
                const seriesIndex = secondaryIdx + 1;
                const colorIdx = seriesIndex;
                const color = `var(--chart-${(colorIdx % 5) + 1})`;
                const yAxisId = getLineSeriesYAxisId(state, seriesIndex);
                const curve = resolveCurve(getSeriesCurve(state, seriesIndex));
                return [
                  <Area
                    curve={curve}
                    dataKey={key}
                    fadeEdges={fadeEdgesPropValue(
                      getSeriesFadeEdges(state, seriesIndex)
                    )}
                    fill={color}
                    fillOpacity={state.fillOpacity}
                    key={`area-${key}`}
                    yAxisId={yAxisId}
                    {...seriesStrokePropsFromState(
                      state,
                      data.length,
                      seriesIndex
                    )}
                  />,
                  <Line
                    curve={curve}
                    dataKey={key}
                    fadeEdges={fadeEdgesPropValue(
                      getSeriesFadeEdges(state, seriesIndex)
                    )}
                    key={`line-${key}`}
                    stroke={color}
                    strokeWidth={getSeriesStrokeWidth(state, seriesIndex)}
                    yAxisId={yAxisId}
                    {...seriesStrokePropsFromState(
                      state,
                      data.length,
                      seriesIndex
                    )}
                  />,
                ];
              }
            )}
            <StudioChartYAxisLayers chartPrefix="composed" state={state} />
            <StudioVisibleLayer componentId="composed.xaxis" state={state}>
              <XAxis />
            </StudioVisibleLayer>
            <StudioVisibleLayer componentId="composed.tooltip" state={state}>
              <ChartTooltip {...chartTooltipPropsFromState(state)} />
            </StudioVisibleLayer>
          </ComposedChart>
        </StudioCartesianFill>
      </StudioChartShell>
    );
  },
  generateCode: (state) => composedCodegen(state),
};

const pieConfig: StudioChartConfig = {
  slug: "pie-chart",
  label: chartLabels["pie-chart"],
  motionPanel: true,
  supportsPatterns: true,
  controls: [],
  controlGroups: pieChartControlGroups,
  resolveComponents: resolvePieComponents,
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
  ${state.innerRadius > 0 ? `<PieCenter defaultLabel="${state.pieCenterLabel}"${state.pieCenterPrefix ? ` prefix="${state.pieCenterPrefix}"` : ""}${state.pieCenterSuffix ? ` suffix="${state.pieCenterSuffix}"` : ""} />` : ""}
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
  resolveComponents: resolveRingComponents,
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
  resolveComponents: resolveRadarComponents,
  render: (state, ctx) => <RadarStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => radarCodegen(state),
};

const candlestickConfig: StudioChartConfig = {
  slug: "candlestick-chart",
  label: chartLabels["candlestick-chart"],
  supportsPatterns: true,
  motionPanel: true,
  controls: [],
  controlGroups: candlestickChartControlGroups,
  resolveComponents: resolveCandlestickComponents,
  render: (state, ctx) => <CandlestickStudioPreview ctx={ctx} state={state} />,
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
  resolveComponents: resolveFunnelComponents,
  render: (state, ctx) => <FunnelStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => funnelCodegen(state),
};

const liveLineConfig: StudioChartConfig = {
  slug: "live-line-chart",
  label: chartLabels["live-line-chart"],
  supportsCurves: true,
  motionPanel: true,
  scrambleData: false,
  controls: [],
  controlGroups: liveLineChartControlGroups,
  resolveComponents: () => resolveLiveLineComponents(),
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
        state={state}
        stroke={getEffectiveSeriesColor(state, 0)}
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
  resolveComponents: resolveChoroplethComponents,
  render: (state, ctx) => (
    <StudioCartesianFill>
      <ChoroplethStudioPreview
        analytics={state.choroplethAnalytics}
        bgPattern={state.choroplethBgPattern}
        ctx={ctx}
        fgPattern={state.choroplethFgPattern}
        key={studioPreviewChartKey(ctx)}
        showGraticule={state.showGraticule}
        state={state}
        visitorCounts={getVisitorsByCountry(ctx.dataSeed)}
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
  resolveComponents: resolveSankeyComponents,
  render: (state, ctx) => <SankeyStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => sankeyCodegen(state),
};

const heatmapConfig: StudioChartConfig = {
  slug: "heatmap-chart",
  label: chartLabels["heatmap-chart"],
  motionPanel: true,
  motionStagger: true,
  controls: [],
  controlGroups: heatmapChartControlGroups,
  resolveComponents: resolveHeatmapComponents,
  render: (state, ctx) => <HeatmapStudioPreview ctx={ctx} state={state} />,
  generateCode: (state) => heatmapCodegen(state),
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
  "heatmap-chart": heatmapConfig,
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
