import {
  buildLinearProjection,
  type ChartMarker,
  ChartMarkers,
  ChartTooltip,
  DiamondMarkers,
  Grid,
  Line,
  LineChart,
  LineSeriesTerminalMarker,
  ProfitLossLine,
  ProjectionLine,
  TrendLine,
  Weekends,
  XAxis,
} from "@bklitui/native/charts";
import { useMemo } from "react";
import { dailyData, markerDates, pnlData, weekdayData } from "../demo/data";
import { useDemo } from "../demo/state";
import { ChartCard, DemoPage, useChartHaptics } from "../demo/ui";

const usd = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString("en-US")}`;

function inRange(markers: ChartMarker[], days: number) {
  const end = new Date(2026, 0, 5 + days - 1);
  return markers.filter((m) => m.date <= end);
}

export default function LinePage() {
  return (
    <DemoPage
      subtitle="Recipes from the web gallery. Drag to scrub, two fingers to select."
      title="Line"
    >
      <WeekdaysExample />
      <DiamondMarkersExample />
      <EventMarkersExample />
      <TrendLineExample />
      <ProjectionExample />
      <ProfitLossExample />
      <WeekendsExample />
    </DemoPage>
  );
}

function DiamondMarkersExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  const markers = useMemo(
    () =>
      inRange(
        [
          { date: markerDates.deploy, title: "Deploy" },
          { date: markerDates.pricing, title: "Pricing change" },
          { date: markerDates.campaign, title: "Campaign" },
        ],
        days
      ),
    [days]
  );
  return (
    <ChartCard note="Recipe: Diamond markers" title="Custom markers">
      <LineChart
        aspectRatio={1.45}
        data={data}
        key={replayKey}
        margin={{ top: 32 }}
        {...haptics}
      >
        <Grid horizontal />
        <Line dataKey="visitors" label="Visitors" strokeWidth={2} />
        <DiamondMarkers items={markers} />
        <XAxis />
        <ChartTooltip
          indicatorDasharray={indicatorDasharray}
          markers={markers}
        />
      </LineChart>
    </ChartCard>
  );
}

function EventMarkersExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  const markers = useMemo(
    () =>
      inRange(
        [
          {
            date: markerDates.launch,
            icon: "🚀",
            title: "v2.0 launch",
            description: "New dashboard shipped",
          },
          {
            date: markerDates.newsletter,
            icon: "📣",
            title: "Newsletter",
            description: "Monthly send to 40k readers",
          },
          {
            date: markerDates.newsletter,
            icon: "🐛",
            title: "Hotfix",
            description: "Checkout bug fixed",
          },
          {
            date: markerDates.perf,
            icon: "⚡",
            title: "Perf release",
            description: "Pages load 40% faster",
            color: "#6366f1",
          },
        ],
        days
      ),
    [days]
  );
  return (
    <ChartCard note="Recipe: Event markers" title="Event markers">
      <LineChart
        aspectRatio={1.4}
        data={data}
        key={replayKey}
        margin={{ top: 40 }}
        {...haptics}
      >
        <Grid horizontal />
        <Line dataKey="visitors" label="Visitors" strokeWidth={2} />
        <ChartMarkers items={markers} />
        <XAxis />
        <ChartTooltip
          indicatorDasharray={indicatorDasharray}
          markers={markers}
        />
      </LineChart>
    </ChartCard>
  );
}

function TrendLineExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  return (
    <ChartCard note="Recipe: Trend line" title="Trend line">
      <LineChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <Line
          dataKey="visitors"
          label="Visitors"
          stroke="#6366f18c"
          strokeWidth={1.5}
        />
        <TrendLine
          dataKey="visitors"
          fadeEdges
          strokeStyle="gradient"
          strokeWidth={2.5}
        />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </LineChart>
    </ChartCard>
  );
}

function ProjectionExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  const projection = useMemo(
    () => buildLinearProjection(data, "visitors", 7),
    [data]
  );
  return (
    <ChartCard note="Recipe: Projection line" title="Dashed projection">
      <LineChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <Line
          dataKey="visitors"
          label="Visitors"
          stroke="#6366f1"
          strokeWidth={2}
        />
        <LineSeriesTerminalMarker dataKey="visitors" />
        <ProjectionLine
          curveKind="bezier"
          data={projection}
          strokeDasharray={[1, 4]}
          strokeStyle="gradient"
        />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </LineChart>
    </ChartCard>
  );
}

function ProfitLossExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => pnlData(days, seed), [days, seed]);
  return (
    <ChartCard
      note="Smooth curve, faded edges, dashed zero line"
      title="Profit / loss"
    >
      <LineChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid highlightRowValues={[0]} horizontal />
        <ProfitLossLine dataKey="pnl" />
        <XAxis />
        <ChartTooltip
          formatValue={usd}
          indicatorColorFrom="pnl"
          indicatorDasharray={indicatorDasharray}
        />
      </LineChart>
    </ChartCard>
  );
}

function WeekendsExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  return (
    <ChartCard note="Recipe: Weekend stripes" title="Weekends">
      <LineChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Weekends fadeVerticalLength={33} />
        <Line dataKey="visitors" label="Visitors" />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </LineChart>
    </ChartCard>
  );
}

const weekdayLong = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long" });
const weekdayShort = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" });
const weekdayTitle = (d: Date) =>
  d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

function WeekdaysExample() {
  const { seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => weekdayData(seed), [seed]);
  return (
    <ChartCard
      note="Date pill sizes to Monday … Wednesday … Friday"
      title="Weekdays"
    >
      <LineChart aspectRatio={1.6} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <Line dataKey="visitors" label="Visitors" strokeWidth={2} />
        <XAxis formatLabel={weekdayShort} />
        <ChartTooltip
          datePillFormat={weekdayLong}
          formatLabel={weekdayTitle}
          indicatorDasharray={indicatorDasharray}
        />
      </LineChart>
    </ChartCard>
  );
}
