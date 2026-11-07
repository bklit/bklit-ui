import {
  Area,
  AreaChart,
  Background,
  Band,
  ChartTooltip,
  Grid,
  Line,
  PatternArea,
  ReferenceArea,
  SegmentBackground,
  SegmentChangeBadge,
  SegmentLineFrom,
  SegmentLineTo,
  XAxis,
} from "@bklitui/native/charts";
import { useMemo } from "react";
import { dailyData, forecastData, rangeData, revenueData } from "../demo/data";
import { useDemo } from "../demo/state";
import { ChartCard, DemoPage, useChartHaptics } from "../demo/ui";

const usd = (v: number) => `$${v.toLocaleString("en-US")}`;

export default function AreaPage() {
  return (
    <DemoPage
      subtitle="Patterns, bands and forecasts. Two fingers select a range on the first chart."
      title="Area"
    >
      <HomepageExample />
      <PatternFillExample />
      <HatchedBackdropExample />
      <ReferenceBandExample />
      <RangeBandExample />
      <ForecastExample />
    </DemoPage>
  );
}

function HomepageExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => revenueData(days, seed), [days, seed]);
  return (
    <ChartCard
      note="Homepage: dot pattern background, faded areas"
      title="Revenue vs costs"
    >
      <AreaChart
        aspectRatio={1.3}
        data={data}
        key={replayKey}
        margin={{ top: 28 }}
        {...haptics}
      >
        <Background
          fadeHorizontalLength={30}
          fadeVerticalLength={30}
          pattern="dots"
        />
        <SegmentBackground trendKey="revenue" />
        <Area dataKey="revenue" fillOpacity={0.1} label="Revenue" />
        <Area
          dataKey="costs"
          fillOpacity={0.1}
          label="Costs"
          strokeWidth={1.5}
        />
        <SegmentLineFrom trendKey="revenue" />
        <SegmentLineTo trendKey="revenue" />
        <XAxis />
        <ChartTooltip
          formatValue={usd}
          indicatorDasharray={indicatorDasharray}
        />
        <SegmentChangeBadge valueKey="revenue" />
      </AreaChart>
    </ChartCard>
  );
}

function PatternFillExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  return (
    <ChartCard note="PatternArea diagonal-up, faded edges" title="Pattern fill">
      <AreaChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <PatternArea
          dataKey="visitors"
          fillOpacity={0.06}
          pattern="diagonal-up"
        />
        <Area dataKey="visitors" fillOpacity={0} label="Visitors" />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </AreaChart>
    </ChartCard>
  );
}

function HatchedBackdropExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  return (
    <ChartCard note="Recipe: Hatched backdrop" title="Pattern background">
      <AreaChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Background fadeVerticalLength={33} pattern="diagonal-up" />
        <Area dataKey="visitors" fillOpacity={0.25} label="Visitors" />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </AreaChart>
    </ChartCard>
  );
}

function ReferenceBandExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => dailyData(days, seed), [days, seed]);
  return (
    <ChartCard
      note="ReferenceArea: solid target band, dashed edges"
      title="Reference band"
    >
      <AreaChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <ReferenceArea y1={1600} y2={2100} />
        <Area dataKey="visitors" fillOpacity={0.2} label="Visitors" />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </AreaChart>
    </ChartCard>
  );
}

function RangeBandExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => rangeData(days, seed), [days, seed]);
  return (
    <ChartCard note="Recipe: Range band" title="Range band">
      <AreaChart aspectRatio={1.5} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <Band
          fill="#6366f1"
          fillOpacity={0.35}
          fillType="gradient"
          label="Range"
          lowerKey="low"
          strokeDasharray={[3, 4]}
          strokeOpacity={0.6}
          upperKey="high"
        />
        <Area
          dataKey="visitors"
          fill="#6366f1"
          fillOpacity={0.12}
          label="Visitors"
        />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </AreaChart>
    </ChartCard>
  );
}

function ForecastExample() {
  const { days, seed, replayKey, indicatorDasharray } = useDemo();
  const haptics = useChartHaptics();
  const data = useMemo(() => forecastData(days, seed), [days, seed]);
  return (
    <ChartCard
      note="Dashed forecast with a widening confidence band"
      title="Forecast"
    >
      <AreaChart aspectRatio={1.45} data={data} key={replayKey} {...haptics}>
        <Grid horizontal />
        <Band
          fill="#e12afb"
          fillOpacity={0.28}
          fillType="gradient"
          lowerKey="low"
          strokeDasharray={[3, 4]}
          strokeOpacity={0.5}
          upperKey="high"
        />
        <Area dataKey="visitors" fillOpacity={0.2} label="Actual" />
        <Line
          dataKey="forecast"
          label="Forecast"
          showHighlight={false}
          stroke="#e12afb"
          strokeDasharray={[6, 4]}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip indicatorDasharray={indicatorDasharray} />
      </AreaChart>
    </ChartCard>
  );
}
