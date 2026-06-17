/**
 * Generates registry example entries for Open in v0 (registry:example + registry:page).
 * Run from packages/ui: node scripts/generate-v0-examples.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const examplesDir = join(root, "registry/examples");

/** Per-chart barrel for installed @/components/charts/* paths in v0. */
const CHART_INDEX_EXPORTS = {
  "area-chart": `export { AreaChart } from "./area-chart";
export { Area } from "./area";
export { Grid } from "./grid";
export { XAxis } from "./x-axis";
export { ChartTooltip } from "./tooltip";`,
  "bar-chart": `export { BarChart } from "./bar-chart";
export { Bar } from "./bar";
export { BarXAxis } from "./bar-x-axis";
export { Grid } from "./grid";
export { ChartTooltip } from "./tooltip";`,
  "line-chart": `export { LineChart } from "./line-chart";
export { Line } from "./line";
export { Grid } from "./grid";
export { XAxis } from "./x-axis";
export { ChartTooltip } from "./tooltip";`,
  "scatter-chart": `export { ScatterChart } from "./scatter-chart";
export { Scatter } from "./scatter";
export { Grid } from "./grid";
export { XAxis } from "./x-axis";
export { ChartTooltip } from "./tooltip";`,
  "pie-chart": `export { PieChart } from "./pie-chart";
export { PieSlice } from "./pie-slice";
export { PieCenter } from "./pie-center";`,
  "gauge-chart": `export { Gauge } from "./gauge";`,
  "progress-bar": `export { ProgressBar } from "./progress-bar";`,
  "heatmap-chart": `export {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "./heatmap";`,
  "ring-chart": `export { RingChart } from "./ring-chart";
export { Ring } from "./ring";
export { RingCenter } from "./ring-center";`,
  "radar-chart": `export { RadarChart } from "./radar-chart";
export { RadarGrid } from "./radar-grid";
export { RadarAxis } from "./radar-axis";
export { RadarLabels } from "./radar-labels";
export { RadarArea } from "./radar-area";`,
  "composed-chart": `export { ComposedChart } from "./composed-chart";
export { SeriesBar } from "./series-bar";
export { Area } from "./area";
export { Line } from "./line";
export { Grid } from "./grid";
export { XAxis } from "./x-axis";
export { ChartTooltip } from "./tooltip";`,
  "funnel-chart": `export { FunnelChart } from "./funnel-chart";`,
  "sankey-chart": `export { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip } from "./sankey";`,
  "candlestick-chart": `export { CandlestickChart } from "./candlestick-chart";
export { Candlestick } from "./candlestick";
export { Grid } from "./grid";
export { XAxis } from "./x-axis";
export { YAxis } from "./y-axis";
export { ChartTooltip } from "./tooltip";`,
  "choropleth-chart": `export { ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip } from "./choropleth";`,
  "live-line-chart": `export { LiveLineChart } from "./live-line-chart";
export { LiveLine } from "./live-line";
export { LiveXAxis } from "./live-x-axis";
export { LiveYAxis } from "./live-y-axis";
export { ChartTooltip } from "./tooltip";`,
};

/** @type {Record<string, { registryDependencies: string[], dependencies: string[], importFrom: string, data: string, body: string }>} */
const EXAMPLES = {
  "area-chart": {
    registryDependencies: [
      "@bklit/area-chart",
      "@bklit/grid",
      "@bklit/x-axis",
      "@bklit/chart-tooltip",
    ],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom: "AreaChart, Area, Grid, XAxis, ChartTooltip",
    data: `const chartData = [
  { date: new Date("2024-01-01"), desktop: 186 },
  { date: new Date("2024-02-01"), desktop: 305 },
  { date: new Date("2024-03-01"), desktop: 237 },
  { date: new Date("2024-04-01"), desktop: 73 },
  { date: new Date("2024-05-01"), desktop: 209 },
  { date: new Date("2024-06-01"), desktop: 214 },
];`,
    body: `<AreaChart data={chartData} animationDuration={1100}>
  <Grid horizontal />
  <Area dataKey="desktop" curve={curveNatural} strokeWidth={2.5} fillOpacity={0.4} />
  <XAxis />
  <ChartTooltip />
</AreaChart>`,
    extraImports: `import { curveNatural } from "@visx/curve";`,
  },
  "bar-chart": {
    registryDependencies: [
      "@bklit/bar-chart",
      "@bklit/grid",
      "@bklit/chart-tooltip",
    ],
    dependencies: [
      "@visx/gradient@4.0.1-alpha.0",
      "@visx/pattern@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom: "BarChart, Bar, BarXAxis, Grid, ChartTooltip",
    data: `const data = [
  { month: "Jan", revenue: 12000, profit: 4500 },
  { month: "Feb", revenue: 15500, profit: 5200 },
  { month: "Mar", revenue: 11000, profit: 3800 },
  { month: "Apr", revenue: 18500, profit: 7100 },
  { month: "May", revenue: 16800, profit: 5400 },
  { month: "Jun", revenue: 21200, profit: 8800 },
];`,
    body: `<BarChart data={data} xDataKey="month">
  <Grid horizontal />
  <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
  <Bar dataKey="profit" fill="var(--chart-line-secondary)" lineCap="round" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>`,
  },
  "line-chart": {
    registryDependencies: [
      "@bklit/line-chart",
      "@bklit/grid",
      "@bklit/x-axis",
      "@bklit/chart-tooltip",
    ],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom: "LineChart, Line, Grid, XAxis, ChartTooltip",
    data: `const chartData = [
  { date: new Date("2024-01-01"), users: 1200 },
  { date: new Date("2024-02-01"), users: 1350 },
  { date: new Date("2024-03-01"), users: 1100 },
  { date: new Date("2024-04-01"), users: 1450 },
  { date: new Date("2024-05-01"), users: 1380 },
  { date: new Date("2024-06-01"), users: 1520 },
];`,
    body: `<LineChart data={chartData}>
  <Grid horizontal />
  <Line dataKey="users" curve={curveNatural} stroke="var(--chart-line-primary)" />
  <XAxis />
  <ChartTooltip />
</LineChart>`,
    extraImports: `import { curveNatural } from "@visx/curve";`,
  },
  "scatter-chart": {
    registryDependencies: [
      "@bklit/scatter-chart",
      "@bklit/grid",
      "@bklit/x-axis",
      "@bklit/chart-tooltip",
    ],
    dependencies: ["d3-scale", "d3-array", "motion", "react-use-measure"],
    importFrom: "ScatterChart, Scatter, Grid, XAxis, ChartTooltip",
    data: `const chartData = [
  { date: new Date("2024-01-01"), sessions: 420, conversions: 28 },
  { date: new Date("2024-02-01"), sessions: 510, conversions: 34 },
  { date: new Date("2024-03-01"), sessions: 390, conversions: 22 },
  { date: new Date("2024-04-01"), sessions: 580, conversions: 41 },
  { date: new Date("2024-05-01"), sessions: 620, conversions: 38 },
  { date: new Date("2024-06-01"), sessions: 710, conversions: 52 },
];`,
    body: `<ScatterChart data={chartData}>
  <Grid horizontal />
  <Scatter dataKey="sessions" />
  <Scatter dataKey="conversions" />
  <XAxis />
  <ChartTooltip />
</ScatterChart>`,
  },
  "pie-chart": {
    registryDependencies: ["@bklit/pie-chart"],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom: "PieChart, PieSlice, PieCenter",
    data: `const pieData = [
  { label: "Direct", value: 320 },
  { label: "Organic", value: 280 },
  { label: "Referral", value: 190 },
  { label: "Social", value: 140 },
];`,
    body: `<PieChart data={pieData} size={280}>
  {pieData.map((item, i) => (
    <PieSlice index={i} key={item.label} />
  ))}
  <PieCenter defaultLabel="Traffic" />
</PieChart>`,
  },
  "gauge-chart": {
    registryDependencies: ["@bklit/gauge-chart"],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom: "Gauge",
    data: "",
    body: `<Gauge
  value={72}
  centerValue={72}
  totalNotches={40}
  defaultLabel="Score"
  formatOptions={{ style: "percent" }}
/>`,
  },
  "progress-bar": {
    registryDependencies: ["@bklit/progress-bar"],
    dependencies: ["motion"],
    importFrom: "ProgressBar",
    data: "",
    body: `<ProgressBar
  value={72}
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  notchLengthPercent={38}
  inactiveFillOpacity={0.4}
  useGradient
/>`,
  },
  "heatmap-chart": {
    registryDependencies: ["@bklit/heatmap-chart"],
    dependencies: [
      "@visx/heatmap@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom:
      "HeatmapCells, HeatmapChart, HeatmapInteractionBoundary, HeatmapInteractionProvider, HeatmapLegend, HeatmapTooltip, HeatmapXAxis, HeatmapYAxis",
    data: `const data = [
  {
    bin: 0,
    bins: [
      { bin: 0, count: 2, date: new Date(2024, 0, 1) },
      { bin: 1, count: 0, date: new Date(2024, 0, 2) },
      { bin: 2, count: 3, date: new Date(2024, 0, 3) },
      { bin: 3, count: 1, date: new Date(2024, 0, 4) },
      { bin: 4, count: 4, date: new Date(2024, 0, 5) },
      { bin: 5, count: 0, date: new Date(2024, 0, 6) },
      { bin: 6, count: 1, date: new Date(2024, 0, 7) },
    ],
  },
  {
    bin: 1,
    bins: [
      { bin: 0, count: 1, date: new Date(2024, 0, 8) },
      { bin: 1, count: 2, date: new Date(2024, 0, 9) },
      { bin: 2, count: 0, date: new Date(2024, 0, 10) },
      { bin: 3, count: 3, date: new Date(2024, 0, 11) },
      { bin: 4, count: 2, date: new Date(2024, 0, 12) },
      { bin: 5, count: 1, date: new Date(2024, 0, 13) },
      { bin: 6, count: 0, date: new Date(2024, 0, 14) },
    ],
  },
];`,
    body: `<HeatmapInteractionProvider>
  <HeatmapInteractionBoundary>
    <div className="flex w-full flex-col items-stretch gap-3">
      <HeatmapChart className="w-full" data={data} layout="fluid">
        <HeatmapCells />
        <HeatmapXAxis />
        <HeatmapYAxis />
        <HeatmapTooltip />
      </HeatmapChart>
      <HeatmapLegend />
    </div>
  </HeatmapInteractionBoundary>
</HeatmapInteractionProvider>`,
  },
  "ring-chart": {
    registryDependencies: ["@bklit/ring-chart"],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom: "RingChart, Ring, RingCenter",
    data: `const ringData = [
  { label: "Email", value: 42 },
  { label: "Social", value: 28 },
  { label: "Direct", value: 18 },
  { label: "Other", value: 12 },
];`,
    body: `<RingChart data={ringData} size={280} strokeWidth={14}>
  {ringData.map((item, i) => (
    <Ring index={i} key={item.label} />
  ))}
  <RingCenter defaultLabel="Channels" />
</RingChart>`,
  },
  "radar-chart": {
    registryDependencies: ["@bklit/radar-chart"],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom: "RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea",
    data: `const metrics = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "comfort", label: "Comfort" },
  { key: "safety", label: "Safety" },
  { key: "efficiency", label: "Efficiency" },
];
const data = [
  { id: "a", speed: 80, reliability: 70, comfort: 60, safety: 90, efficiency: 75 },
];`,
    body: `<RadarChart data={data} metrics={metrics} size={320}>
  <RadarGrid />
  <RadarAxis />
  <RadarLabels fontSize={10} offset={16} />
  {data.map((row, i) => (
    <RadarArea key={row.id} index={i} fill="var(--chart-line-primary)" fillOpacity={0.35} />
  ))}
</RadarChart>`,
  },
  "composed-chart": {
    registryDependencies: [
      "@bklit/composed-chart",
      "@bklit/grid",
      "@bklit/x-axis",
      "@bklit/chart-tooltip",
    ],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom:
      "ComposedChart, SeriesBar, Area, Line, Grid, XAxis, ChartTooltip",
    data: `const chartData = [
  { date: new Date("2024-01-01"), revenue: 4200, runRate: 3800 },
  { date: new Date("2024-02-01"), revenue: 5100, runRate: 4600 },
  { date: new Date("2024-03-01"), revenue: 4800, runRate: 5200 },
  { date: new Date("2024-04-01"), revenue: 5500, runRate: 5000 },
];`,
    body: `<ComposedChart data={chartData}>
  <Grid horizontal />
  <SeriesBar dataKey="revenue" fill="var(--chart-1)" />
  <Area dataKey="runRate" curve={curveNatural} fill="var(--chart-4)" fillOpacity={0.35} />
  <Line dataKey="runRate" curve={curveNatural} stroke="var(--chart-2)" />
  <XAxis />
  <ChartTooltip />
</ComposedChart>`,
    extraImports: `import { curveNatural } from "@visx/curve";`,
  },
  "funnel-chart": {
    registryDependencies: ["@bklit/funnel-chart"],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom: "FunnelChart",
    data: `const funnelData = [
  { label: "Visitors", value: 12000 },
  { label: "Signups", value: 4800 },
  { label: "Activated", value: 2100 },
  { label: "Paid", value: 840 },
];`,
    body: `<FunnelChart data={funnelData} aspectRatio="2 / 1" />`,
  },
  "sankey-chart": {
    registryDependencies: ["@bklit/sankey-chart"],
    dependencies: [
      "@visx/sankey@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom: "SankeyChart, SankeyLink, SankeyNode, SankeyTooltip",
    data: `const data = {
  nodes: [
    { name: "Ads" },
    { name: "Organic" },
    { name: "Landing" },
    { name: "Product" },
    { name: "Checkout" },
  ],
  links: [
    { source: 0, target: 2, value: 40 },
    { source: 1, target: 2, value: 30 },
    { source: 2, target: 3, value: 50 },
    { source: 3, target: 4, value: 35 },
  ],
};`,
    body: `<SankeyChart data={data} aspectRatio="16 / 9">
  <SankeyLink />
  <SankeyNode />
  <SankeyTooltip />
</SankeyChart>`,
  },
  "candlestick-chart": {
    registryDependencies: [
      "@bklit/candlestick-chart",
      "@bklit/grid",
      "@bklit/x-axis",
      "@bklit/y-axis",
      "@bklit/chart-tooltip",
    ],
    dependencies: ["@visx/shape@4.0.1-alpha.0", "motion"],
    importFrom:
      "CandlestickChart, Candlestick, Grid, XAxis, YAxis, ChartTooltip",
    data: `const ohlcData = [
  { date: new Date("2024-01-02"), open: 100, high: 108, low: 98, close: 105 },
  { date: new Date("2024-01-03"), open: 105, high: 110, low: 102, close: 103 },
  { date: new Date("2024-01-04"), open: 103, high: 112, low: 101, close: 110 },
  { date: new Date("2024-01-05"), open: 110, high: 115, low: 107, close: 108 },
];`,
    body: `<CandlestickChart data={ohlcData}>
  <Grid horizontal vertical />
  <Candlestick />
  <XAxis />
  <YAxis />
  <ChartTooltip />
</CandlestickChart>`,
  },
  "choropleth-chart": {
    registryDependencies: ["@bklit/choropleth-chart"],
    dependencies: ["@visx/geo@4.0.1-alpha.0", "d3-geo", "topojson-client"],
    importFrom:
      "ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip",
    data: `const features = [
  { id: "US", name: "United States", value: 120 },
  { id: "CA", name: "Canada", value: 45 },
  { id: "GB", name: "United Kingdom", value: 62 },
];`,
    body: `<ChoroplethChart data={features} aspectRatio="2 / 1">
  <ChoroplethFeatureComponent />
  <ChoroplethTooltip />
</ChoroplethChart>`,
  },
  "live-line-chart": {
    registryDependencies: ["@bklit/live-line-chart", "@bklit/chart-tooltip"],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@visx/shape@4.0.1-alpha.0",
      "motion",
    ],
    importFrom: "LiveLineChart, LiveLine, LiveXAxis, LiveYAxis, ChartTooltip",
    data: `const initialData = Array.from({ length: 24 }, (_, i) => ({
  time: Date.now() - (23 - i) * 60_000,
  value: 50 + Math.sin(i / 3) * 20,
}));`,
    body: `<LiveLineChart
  data={initialData}
  interval={1000}
  maxPoints={24}
  xDataKey="time"
  yDataKey="value"
>
  <LiveLine curve={curveNatural} stroke="var(--chart-line-primary)" />
  <LiveXAxis />
  <LiveYAxis />
  <ChartTooltip />
</LiveLineChart>`,
    extraImports: `import { curveNatural } from "@visx/curve";`,
  },
};

mkdirSync(examplesDir, { recursive: true });

for (const [slug, spec] of Object.entries(EXAMPLES)) {
  const extra = spec.extraImports ? `${spec.extraImports}\n\n` : "";
  const content = `"use client"

// In your app (monorepo/npm): import { ${spec.importFrom} } from "@bklitui/ui/charts"
import { ${spec.importFrom} } from "@/components/charts"

${extra}${spec.data}

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        ${spec.body}
      </div>
    </main>
  )
}
`;
  writeFileSync(join(examplesDir, `${slug}.tsx`), content);

  const indexExports = CHART_INDEX_EXPORTS[slug];
  if (indexExports) {
    writeFileSync(
      join(examplesDir, `${slug}-index.ts`),
      `// biome-ignore-all lint/performance/noBarrelFile: v0 registry example barrel for shadcn install\n${indexExports}\n`
    );
  }
}

const registryPath = join(root, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));

registry.items = registry.items.filter(
  (item) => !item.name.endsWith("-example")
);

const exampleItems = Object.entries(EXAMPLES).map(([slug, spec]) => {
  const files = [
    {
      path: `registry/examples/${slug}.tsx`,
      type: "registry:page",
      target: "app/page.tsx",
    },
  ];
  if (CHART_INDEX_EXPORTS[slug]) {
    files.push({
      path: `registry/examples/${slug}-index.ts`,
      type: "registry:lib",
      target: "components/charts/index.ts",
    });
  }
  return {
    name: `${slug}-example`,
    type: "registry:example",
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Example`,
    description: `Composable ${slug} demo for Open in v0`,
    registryDependencies: spec.registryDependencies,
    dependencies: spec.dependencies,
    files,
  };
});

registry.items.push(...exampleItems);

writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Wrote ${Object.keys(EXAMPLES).length} v0 example registry items`);
