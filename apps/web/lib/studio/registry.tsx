"use client";

import type { ChartStatFlowFormat } from "@bklitui/ui/charts";
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
  FunnelChart,
  Gauge,
  Grid,
  Line,
  LinearGradient,
  LineChart,
  PieCenter,
  PieChart,
  PieSlice,
  RadarArea,
  RadarAxis,
  RadarChart,
  RadarGrid,
  RadarLabels,
  Ring,
  RingCenter,
  RingChart,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  SeriesBar,
  XAxis,
} from "@bklitui/ui/charts";
import { validChartSlugs } from "@/components/charts/chart-slugs";
import { ChoroplethStudioPreview } from "@/components/studio/charts/choropleth-studio";
import { LiveLineStudioPreview } from "@/components/studio/charts/live-line-studio";
import { StudioPatternArea } from "@/components/studio/charts/pattern-area";
import {
  StudioCartesianFill,
  StudioRadialCenter,
  studioFitAspectSize,
  studioRadialSize,
} from "@/components/studio/charts/studio-chart-layout";
import { curveImportName, resolveCurve } from "./curves";
import {
  areaData,
  barData,
  barHorizontalData,
  barStackedData,
  candlestickOhlcData,
  composedDemoData,
  funnelData,
  lineHeroData,
  pieData,
  radarDataDual,
  radarMetrics5,
  ringData,
  sankeySimple,
} from "./demo-data";
import {
  patternCodegenBlock,
  studioPiePatternDefs,
  studioPieSlicePatternFill,
} from "./patterns";
import type { StudioUrlState } from "./studio-parsers";
import type { ChartSlug, StudioChartConfig } from "./types";
import { chartLabels } from "./types";

const gaugeFormat: ChartStatFlowFormat = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

const gaugeConfig: StudioChartConfig = {
  slug: "gauge-chart",
  label: chartLabels["gauge-chart"],
  supportsPatterns: true,
  controls: [
    { type: "number", key: "value", label: "Fill %", min: 0, max: 100 },
    {
      type: "number",
      key: "centerValue",
      label: "Center value",
      min: 0,
      max: 999_999,
      step: 1000,
      input: "number",
    },
    {
      type: "number",
      key: "totalNotches",
      label: "Notches",
      min: 8,
      max: 80,
    },
    { type: "number", key: "spacing", label: "Spacing", min: 0, max: 50 },
    {
      type: "number",
      key: "notchCornerRadius",
      label: "Corner radius",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "notchLengthPercent",
      label: "Notch length %",
      min: 5,
      max: 100,
    },
    {
      type: "angle",
      key: "startAngle",
      label: "Start angle",
      min: 0,
      max: 360,
    },
    { type: "angle", key: "endAngle", label: "End angle", min: 180, max: 450 },
    {
      type: "opacity",
      key: "inactiveFillOpacity",
      label: "Track opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "var(--muted)",
    },
    {
      type: "opacity",
      key: "activeFillOpacity",
      label: "Active opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "boolean", key: "useGradient", label: "Gradient fills" },
    { type: "boolean", key: "uniformWidth", label: "Uniform width" },
    { type: "text", key: "gaugeLabel", label: "Center label" },
    { type: "pattern", key: "pattern", label: "Pattern" },
  ],
  render: (state, ctx) => {
    const { width, height } = studioFitAspectSize(ctx.frame, 21 / 16);
    return (
      <Gauge
        activeFill={ctx.patternFill}
        activeFillOpacity={state.activeFillOpacity}
        centerValue={state.centerValue}
        defaultLabel={state.gaugeLabel}
        endAngle={state.endAngle}
        formatOptions={gaugeFormat}
        height={height}
        inactiveFillOpacity={state.inactiveFillOpacity}
        key={ctx.animationKey}
        notchCornerRadius={state.notchCornerRadius}
        notchLengthPercent={state.notchLengthPercent}
        spacing={state.spacing}
        startAngle={state.startAngle}
        totalNotches={state.totalNotches}
        uniformWidth={state.uniformWidth}
        useGradient={state.useGradient}
        value={state.value}
        width={width}
      >
        {ctx.patternDefs}
      </Gauge>
    );
  },
  generateCode: (state) => {
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
  spacing={${state.spacing}}
  notchCornerRadius={${state.notchCornerRadius}}
  notchLengthPercent={${state.notchLengthPercent}}
  useGradient={${state.useGradient}}
  uniformWidth={${state.uniformWidth}}
  inactiveFillOpacity={0.4}
  defaultLabel="Total Revenue"
  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}${activeFill}
>${patternChild}</Gauge>`,
    };
  },
};

function cartesianCodegen(
  chartType: "AreaChart" | "LineChart",
  state: StudioUrlState,
  dataKey: string
) {
  const curveName = curveImportName(state.curve);
  const fill = "url(#studio-pattern-fill)";
  let child = "";
  if (chartType === "LineChart") {
    child = `\n  <Line dataKey="${dataKey}" curve={${curveName}} strokeWidth={${state.strokeWidth}} />`;
  } else if (state.pattern === "none") {
    child = `\n  <Area dataKey="${dataKey}" curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${state.strokeWidth}} fadeEdges={${state.fadeEdges}} gradientToOpacity={${state.gradientToOpacity}} />`;
  } else {
    child = `\n  ${patternCodegenBlock(state.pattern)}\n  <Area dataKey="${dataKey}" fill="${fill}" curve={${curveName}} fillOpacity={${state.fillOpacity}} strokeWidth={${state.strokeWidth}} />`;
  }

  let extraImports = "";
  if (state.pattern !== "none") {
    extraImports = ", PatternLines";
  } else if (chartType === "LineChart") {
    extraImports = ", Line";
  } else {
    extraImports = ", Area";
  }

  return `import { ${chartType}, Grid, XAxis, ChartTooltip${extraImports} } from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";

<${chartType} data={chartData}>
  <Grid horizontal />${child}
  <XAxis />
  <ChartTooltip />
</${chartType}>`;
}

const areaConfig: StudioChartConfig = {
  slug: "area-chart",
  label: chartLabels["area-chart"],
  supportsPatterns: true,
  supportsCurves: true,
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    { type: "curve", key: "curve", label: "Curve" },
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Fill opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 0,
      max: 4,
      step: 0.5,
    },
    { type: "boolean", key: "showLine", label: "Show line" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
    { type: "boolean", key: "fadeEdges", label: "Fade edges" },
    {
      type: "opacity",
      key: "gradientToOpacity",
      label: "Gradient bottom",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "transparent",
    },
    { type: "pattern", key: "pattern", label: "Pattern" },
  ],
  render: (state, ctx) => {
    const curve = resolveCurve(state.curve);
    const fill = ctx.patternFill ?? undefined;
    return (
      <StudioCartesianFill>
        <AreaChart
          animationDuration={state.animationDuration}
          className="size-full"
          data={areaData}
          key={ctx.animationKey}
        >
          <Grid horizontal />
          {ctx.patternDefs}
          {fill ? (
            <StudioPatternArea curve={curve} dataKey="desktop" fill={fill} />
          ) : (
            <Area
              curve={curve}
              dataKey="desktop"
              fadeEdges={state.fadeEdges}
              fillOpacity={state.fillOpacity}
              gradientToOpacity={state.gradientToOpacity}
              showHighlight={state.showHighlight}
              showLine={state.showLine}
              strokeWidth={state.strokeWidth}
            />
          )}
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      </StudioCartesianFill>
    );
  },
  generateCode: (state) => ({
    code: cartesianCodegen("AreaChart", state, "desktop"),
    data: `const chartData = ${JSON.stringify(areaData, null, 2)};`,
  }),
};

const lineConfig: StudioChartConfig = {
  slug: "line-chart",
  label: chartLabels["line-chart"],
  supportsCurves: true,
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    { type: "curve", key: "curve", label: "Curve" },
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "fadeEdges", label: "Fade edges" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
  ],
  render: (state, ctx) => (
    <StudioCartesianFill>
      <LineChart
        animationDuration={state.animationDuration}
        className="size-full"
        data={lineHeroData}
        key={ctx.animationKey}
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
    data: "const chartData = /* time series */ [];",
  }),
};

const barConfig: StudioChartConfig = {
  slug: "bar-chart",
  label: chartLabels["bar-chart"],
  supportsPatterns: true,
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    {
      type: "select",
      key: "barSeriesMode",
      label: "Series",
      options: [
        { value: "single", label: "Single" },
        { value: "grouped", label: "Grouped" },
        { value: "stacked", label: "Stacked" },
      ],
    },
    { type: "orientation", key: "barOrientation", label: "Orientation" },
    {
      type: "number",
      key: "barGap",
      label: "Bar gap",
      min: 0,
      max: 0.6,
      step: 0.05,
    },
    {
      type: "number",
      key: "barWidth",
      label: "Bar width (px)",
      min: 0,
      max: 48,
      input: "number",
    },
    {
      type: "number",
      key: "groupGap",
      label: "Group gap",
      min: 0,
      max: 16,
    },
    { type: "lineCap", key: "barLineCap", label: "Line cap" },
    {
      type: "opacity",
      key: "barFadedOpacity",
      label: "Faded opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "pattern", key: "pattern", label: "Pattern" },
  ],
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
          animationDuration={state.animationDuration}
          barGap={state.barGap}
          barWidth={state.barWidth > 0 ? state.barWidth : undefined}
          className="size-full"
          data={chartData}
          key={ctx.animationKey}
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
  generateCode: (state) => ({
    code: `import { BarChart, Bar, BarXAxis, Grid, ChartTooltip${state.pattern === "none" ? "" : ", PatternLines"} } from "@bklitui/ui/charts";

<BarChart data={chartData} xDataKey="month"${state.barSeriesMode === "stacked" ? " stacked stackGap={3}" : ""} barGap={${state.barGap}}>
  <Grid horizontal />
  ${state.pattern === "none" ? "" : patternCodegenBlock(state.pattern)}
  <Bar dataKey="desktop" lineCap="${state.barLineCap}" fill="${state.pattern === "none" ? "var(--chart-1)" : "url(#studio-pattern-fill)"}" />
  <BarXAxis />
  <ChartTooltip showCrosshair={false} />
</BarChart>`,
    data: `const chartData = ${JSON.stringify(barData, null, 2)};`,
  }),
};

const composedConfig: StudioChartConfig = {
  slug: "composed-chart",
  label: chartLabels["composed-chart"],
  supportsPatterns: true,
  supportsCurves: true,
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    { type: "curve", key: "curve", label: "Curve" },
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Area opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-4)",
    },
    {
      type: "number",
      key: "composedBarRadius",
      label: "Bar radius",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "strokeWidth",
      label: "Line width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "fadeEdges", label: "Line fade edges" },
    { type: "pattern", key: "pattern", label: "Bar pattern" },
  ],
  render: (state, ctx) => {
    const curve = resolveCurve(state.curve);
    return (
      <StudioCartesianFill>
        <ComposedChart
          animationDuration={state.animationDuration}
          className="size-full"
          data={composedDemoData}
          key={ctx.animationKey}
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
  generateCode: (state) => ({
    code: `import { ComposedChart, SeriesBar, Area, Line, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts";
import { ${curveImportName(state.curve)} } from "@visx/curve";

<ComposedChart data={chartData}>
  <Grid horizontal />
  <SeriesBar dataKey="revenue" />
  <Area dataKey="runRate" curve={${curveImportName(state.curve)}} fillOpacity={${state.fillOpacity}} />
  <Line dataKey="runRate" curve={${curveImportName(state.curve)}} strokeWidth={2} />
  <XAxis />
  <ChartTooltip />
</ComposedChart>`,
    data: `const chartData = ${JSON.stringify(composedDemoData, null, 2)};`,
  }),
};

const pieConfig: StudioChartConfig = {
  slug: "pie-chart",
  label: chartLabels["pie-chart"],
  controls: [
    {
      type: "number",
      key: "pieSize",
      label: "Scale %",
      min: 50,
      max: 100,
    },
    {
      type: "innerRadius",
      key: "innerRadius",
      label: "Inner radius",
      min: 0,
      max: 120,
    },
    {
      type: "number",
      key: "padAngle",
      label: "Pad angle",
      min: 0,
      max: 0.1,
      step: 0.01,
    },
    {
      type: "number",
      key: "pieCornerRadius",
      label: "Corner radius",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "pieHoverOffset",
      label: "Hover offset",
      min: 0,
      max: 24,
    },
    {
      type: "angle",
      key: "pieStartAngleDeg",
      label: "Start angle",
      min: -180,
      max: 360,
      variant: "pieStart",
    },
    {
      type: "angle",
      key: "pieEndAngleDeg",
      label: "End angle",
      min: 0,
      max: 720,
      variant: "pieEnd",
    },
    { type: "pieHoverEffect", key: "pieHoverEffect", label: "Hover effect" },
    { type: "pieFill", key: "pieFillMode", label: "Fill" },
  ],
  render: (state, ctx) => {
    const useLines = state.pieFillMode === "lines";
    return (
      <StudioRadialCenter frame={ctx.frame}>
        <PieChart
          cornerRadius={state.pieCornerRadius}
          data={pieData}
          endAngle={(state.pieEndAngleDeg * Math.PI) / 180}
          hoverOffset={state.pieHoverOffset}
          innerRadius={state.innerRadius || undefined}
          key={ctx.animationKey}
          padAngle={state.padAngle}
          size={studioRadialSize(ctx.frame, state.pieSize)}
          startAngle={(state.pieStartAngleDeg * Math.PI) / 180}
        >
          {useLines ? studioPiePatternDefs(pieData.length) : null}
          {pieData.map((item, index) => (
            <PieSlice
              fill={useLines ? studioPieSlicePatternFill(index) : undefined}
              hoverEffect={state.pieHoverEffect}
              index={index}
              key={item.label}
              showGlow={false}
            />
          ))}
          {state.innerRadius > 0 ? <PieCenter defaultLabel="Total" /> : null}
        </PieChart>
      </StudioRadialCenter>
    );
  },
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

    return {
      code: `<PieChart data={pieData} size={${state.pieSize}}${state.innerRadius ? ` innerRadius={${state.innerRadius}}` : ""} padAngle={${state.padAngle}} cornerRadius={${state.pieCornerRadius}} hoverOffset={${state.pieHoverOffset}}${angleProps}>${patternDefs}${slices}
  ${state.innerRadius > 0 ? '<PieCenter defaultLabel="Total" />' : ""}
</PieChart>`,
      data: `const pieData = ${JSON.stringify(pieData, null, 2)};`,
    };
  },
};

const ringConfig: StudioChartConfig = {
  slug: "ring-chart",
  label: chartLabels["ring-chart"],
  controls: [
    {
      type: "number",
      key: "pieSize",
      label: "Scale %",
      min: 50,
      max: 100,
    },
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    {
      type: "number",
      key: "strokeWidth",
      label: "Ring width",
      min: 4,
      max: 24,
    },
    {
      type: "number",
      key: "ringGap",
      label: "Ring gap",
      min: 0,
      max: 20,
    },
    {
      type: "innerRadius",
      key: "ringBaseInnerRadius",
      label: "Inner radius",
      min: 40,
      max: 100,
    },
  ],
  render: (state, ctx) => (
    <StudioRadialCenter frame={ctx.frame}>
      <RingChart
        animationDuration={state.animationDuration}
        baseInnerRadius={state.ringBaseInnerRadius}
        data={ringData}
        key={ctx.animationKey}
        ringGap={state.ringGap}
        size={studioRadialSize(ctx.frame, state.pieSize)}
        strokeWidth={state.strokeWidth}
      >
        {ringData.map((item, index) => (
          <Ring index={index} key={item.label} />
        ))}
        <RingCenter defaultLabel="Channels" />
      </RingChart>
    </StudioRadialCenter>
  ),
  generateCode: (state) => ({
    code: `<RingChart data={ringData} size={${state.pieSize}} strokeWidth={${state.strokeWidth}}>
  {ringData.map((_, i) => <Ring index={i} key={i} />)}
  <RingCenter defaultLabel="Channels" />
</RingChart>`,
    data: `const ringData = ${JSON.stringify(ringData, null, 2)};`,
  }),
};

const radarConfig: StudioChartConfig = {
  slug: "radar-chart",
  label: chartLabels["radar-chart"],
  controls: [
    {
      type: "number",
      key: "radarSize",
      label: "Scale %",
      min: 50,
      max: 100,
      input: "number",
    },
    {
      type: "number",
      key: "radarMargin",
      label: "Margin",
      min: 24,
      max: 100,
    },
    {
      type: "number",
      key: "radarLevels",
      label: "Grid levels",
      min: 3,
      max: 8,
    },
    { type: "boolean", key: "showRadarGrid", label: "Grid labels" },
    { type: "boolean", key: "radarShowPoints", label: "Show points" },
    { type: "boolean", key: "radarShowStroke", label: "Show stroke" },
  ],
  render: (state, ctx) => (
    <StudioRadialCenter frame={ctx.frame}>
      <RadarChart
        data={radarDataDual}
        key={ctx.animationKey}
        levels={state.radarLevels}
        margin={state.radarMargin}
        metrics={radarMetrics5}
        size={studioRadialSize(ctx.frame, state.radarSize)}
      >
        {state.showRadarGrid ? <RadarGrid /> : <RadarGrid showLabels={false} />}
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
  ),
  generateCode: (state) => ({
    code: `<RadarChart data={data} metrics={metrics} size={${state.radarSize}} levels={${state.radarLevels}}>
  ${state.showRadarGrid ? "<RadarGrid />" : "<RadarGrid showLabels={false} />"}
  <RadarAxis />
  <RadarLabels />
  {data.map((_, i) => <RadarArea index={i} key={i} showGlow={${state.radarShowGlow}} />)}
</RadarChart>`,
  }),
};

const candlestickConfig: StudioChartConfig = {
  slug: "candlestick-chart",
  label: chartLabels["candlestick-chart"],
  supportsPatterns: true,
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    {
      type: "opacity",
      key: "candleFadedOpacity",
      label: "Faded opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "number",
      key: "candleGap",
      label: "Candle gap",
      min: 0,
      max: 0.5,
      step: 0.05,
    },
    { type: "boolean", key: "candleUseGradient", label: "Gradient fills" },
    { type: "boolean", key: "candleShowDots", label: "Tooltip dots" },
    { type: "pattern", key: "pattern", label: "Pattern" },
  ],
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
          animationDuration={state.animationDuration}
          candleGap={state.candleGap}
          className="size-full"
          data={candlestickOhlcData}
          key={ctx.animationKey}
          margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
        >
          {state.candleUseGradient ? (
            <>
              <LinearGradient
                from="var(--color-lime-400)"
                id="studio-candle-up"
                to="var(--color-emerald-500)"
              />
              <LinearGradient
                from="var(--color-yellow-400)"
                id="studio-candle-down"
                to="var(--color-red-500)"
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
  generateCode: (state) => ({
    code: `<CandlestickChart data={ohlcData} animationDuration={${state.animationDuration}} candleGap={${state.candleGap}} margin={{ top: 16, right: 16, bottom: 40, left: 16 }}>
  <Candlestick fadedOpacity={${state.candleFadedOpacity}} positiveFill="var(--chart-1)" negativeFill="var(--chart-3)" />
  <ChartTooltip showDots={${state.candleShowDots}} />
  <XAxis />
</CandlestickChart>`,
    data: "// OHLC time series",
  }),
};

const funnelConfig: StudioChartConfig = {
  slug: "funnel-chart",
  label: chartLabels["funnel-chart"],
  supportsPatterns: true,
  controls: [
    { type: "number", key: "funnelLayers", label: "Layers", min: 1, max: 5 },
    {
      type: "number",
      key: "funnelGap",
      label: "Segment gap",
      min: 0,
      max: 16,
    },
    { type: "orientation", key: "funnelOrientation", label: "Orientation" },
    { type: "funnelEdges", key: "funnelEdges", label: "Edges" },
    { type: "boolean", key: "funnelShowValues", label: "Show values" },
    { type: "boolean", key: "funnelShowLabels", label: "Show labels" },
    { type: "boolean", key: "funnelShowPercentage", label: "Show %" },
  ],
  render: (state, ctx) => {
    const widthOverHeight =
      state.funnelOrientation === "horizontal" ? 2.2 : 1 / 1.8;
    const { width, height } = studioFitAspectSize(ctx.frame, widthOverHeight);
    return (
      <div className="shrink-0" style={{ width, height }}>
        <FunnelChart
          className="size-full"
          color="var(--chart-1)"
          data={funnelData}
          edges={state.funnelEdges}
          gap={state.funnelGap}
          key={ctx.animationKey}
          layers={state.funnelLayers}
          orientation={state.funnelOrientation}
          showLabels={state.funnelShowLabels}
          showPercentage={state.funnelShowPercentage}
          showValues={state.funnelShowValues}
        />
      </div>
    );
  },
  generateCode: (state) => ({
    code: `<FunnelChart data={data} layers={${state.funnelLayers}} gap={${state.funnelGap}} edges="${state.funnelEdges}" orientation="${state.funnelOrientation}" showValues={${state.funnelShowValues}} color="var(--chart-1)" />`,
    data: `const data = ${JSON.stringify(funnelData, null, 2)};`,
  }),
};

const liveLineConfig: StudioChartConfig = {
  slug: "live-line-chart",
  label: chartLabels["live-line-chart"],
  supportsCurves: true,
  controls: [
    {
      type: "number",
      key: "liveInterval",
      label: "Interval (ms)",
      min: 200,
      max: 2000,
      step: 100,
      input: "number",
    },
    {
      type: "number",
      key: "liveWindow",
      label: "Window (sec)",
      min: 10,
      max: 120,
      input: "number",
    },
    { type: "curve", key: "curve", label: "Curve" },
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    {
      type: "number",
      key: "liveLerpSpeed",
      label: "Lerp speed",
      min: 0.02,
      max: 0.2,
      step: 0.01,
    },
    { type: "boolean", key: "liveFill", label: "Area fill" },
    { type: "boolean", key: "livePulse", label: "Live pulse" },
    { type: "boolean", key: "liveBadge", label: "Value badge" },
    { type: "boolean", key: "liveExaggerate", label: "Tight Y-axis" },
    { type: "boolean", key: "livePaused", label: "Paused" },
  ],
  render: (state, ctx) => (
    <StudioCartesianFill>
      <LiveLineStudioPreview
        animationKey={ctx.animationKey}
        badge={state.liveBadge}
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
  generateCode: (_state) => ({
    code: `<LiveLineChart data={data} value={latest}>
  <Grid horizontal />
  <LiveLine dataKey="value" strokeWidth={2} />
  <LiveXAxis />
  <LiveYAxis />
</LiveLineChart>`,
  }),
};

const choroplethConfig: StudioChartConfig = {
  slug: "choropleth-chart",
  label: chartLabels["choropleth-chart"],
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    { type: "boolean", key: "choroplethAnalytics", label: "Visitor analytics" },
    { type: "graticuleToggle", key: "showGraticule", label: "Graticule" },
    {
      type: "pattern",
      key: "choroplethBgPattern",
      label: "Background pattern",
    },
    {
      type: "pattern",
      key: "choroplethFgPattern",
      label: "Foreground pattern",
    },
  ],
  render: (state, ctx) => (
    <StudioCartesianFill>
      <ChoroplethStudioPreview
        analytics={state.choroplethAnalytics}
        animationDuration={state.animationDuration}
        bgPattern={state.choroplethBgPattern}
        fgPattern={state.choroplethFgPattern}
        key={ctx.animationKey}
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
    };
  },
};

const sankeyConfig: StudioChartConfig = {
  slug: "sankey-chart",
  label: chartLabels["sankey-chart"],
  controls: [
    {
      type: "number",
      key: "animationDuration",
      label: "Animation (ms)",
      min: 0,
      max: 3000,
      step: 100,
      input: "number",
    },
    {
      type: "number",
      key: "sankeyNodePadding",
      label: "Node padding",
      min: 4,
      max: 32,
    },
    {
      type: "number",
      key: "sankeyNodeWidth",
      label: "Node width",
      min: 8,
      max: 32,
    },
    {
      type: "opacity",
      key: "linkOpacity",
      label: "Link opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ],
  render: (state, ctx) => (
    <StudioCartesianFill>
      <SankeyChart
        animationDuration={state.animationDuration}
        className="size-full"
        data={sankeySimple}
        key={ctx.animationKey}
        nodePadding={state.sankeyNodePadding}
        nodeWidth={state.sankeyNodeWidth}
      >
        <SankeyNode />
        <SankeyLink strokeOpacity={state.linkOpacity} />
        <SankeyTooltip />
      </SankeyChart>
    </StudioCartesianFill>
  ),
  generateCode: (state) => ({
    code: `<SankeyChart data={data} nodePadding={${state.sankeyNodePadding}} nodeWidth={${state.sankeyNodeWidth}}>
  <SankeyNode />
  <SankeyLink strokeOpacity={${state.linkOpacity}} />
  <SankeyTooltip />
</SankeyChart>`,
    data: "// nodes + links",
  }),
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
