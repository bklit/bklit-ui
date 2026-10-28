"use client";

import {
  ChartStatFlow,
  RadialArea,
  RadialAxis,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialLine,
  RadialScrubber,
  type RadialSeries,
} from "@bklitui/ui/charts";
import { sfTemperatureData } from "@/components/charts/radial/sf-temperature-data";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

// ---------------------------------------------------------------------------
// Data — SFO daily temperatures by day of year (1999–2018)
// ---------------------------------------------------------------------------

const temperatureSeries: RadialSeries[] = [
  { dataKey: "avg", label: "Daily average", color: "var(--chart-1)" },
];

const annualAverage =
  sfTemperatureData.reduce((sum, d) => sum + d.avg, 0) /
  sfTemperatureData.length;
const recordLow = Math.min(...sfTemperatureData.map((d) => d.minmin));
const recordHigh = Math.max(...sfTemperatureData.map((d) => d.maxmax));

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------

const degreeFormat = { maximumFractionDigits: 1, minimumFractionDigits: 1 };

const detailClassName =
  "text-[clamp(0.5625rem,7cqw,0.875rem)] text-muted-foreground tabular-nums leading-snug";

function renderTemperatureCenter({ index }: RadialCenterState) {
  const day = index === null ? null : sfTemperatureData[index];
  return (
    <>
      <span className="mb-[3cqw] font-medium text-[clamp(0.625rem,8cqw,1rem)] text-muted-foreground">
        {day ? dayFormat.format(day.date) : "SFO 1999–2018"}
      </span>
      <ChartStatFlow
        formatOptions={degreeFormat}
        label={day ? "average" : "annual average"}
        labelClassName="mt-[2cqw] text-muted-foreground text-[clamp(0.5625rem,7cqw,0.875rem)]"
        suffix="°F"
        value={day ? day.avg : annualAverage}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,18cqw,2.75rem)]"
      />
      <span className={`mt-[4cqw] ${detailClassName}`}>
        {day
          ? `normal ${Math.round(day.min)}–${Math.round(day.max)}°`
          : "record range"}
      </span>
      <span className={detailClassName}>
        {day
          ? `record ${day.minmin}–${day.maxmax}°`
          : `${recordLow}–${recordHigh}°F`}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function TemperatureAreaExample() {
  return (
    <RadialChart
      angleType="time"
      data={sfTemperatureData}
      maxValue="auto"
      minValue="auto"
      niceValues={false}
      series={temperatureSeries}
      valueKeys={["minmin", "maxmax"]}
      xDataKey="date"
    >
      <RadialAxis
        showCircle={false}
        valueTickFormat={(v) => `${v}°F`}
        valueTicks={4}
      />
      {/* Record lows → record highs */}
      <RadialArea
        baseDataKey="minmin"
        color="var(--chart-1)"
        curve="linear"
        dataKey="maxmax"
        fillOpacity={0.14}
        rampFrom={1}
        stroke="none"
      />
      {/* Average low → average high */}
      <RadialArea
        baseDataKey="min"
        color="var(--chart-1)"
        curve="linear"
        dataKey="max"
        fillOpacity={0.28}
        rampFrom={1}
        stroke="none"
      />
      <RadialLine dataKey="avg" strokeWidth={1.5} />
      <RadialScrubber variant="gradient" />
      <RadialCenter>{renderTemperatureCenter}</RadialCenter>
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "avg", label: "Daily average", color: "var(--chart-1)" },
];

<RadialChart
  angleType="time"
  data={days}
  xDataKey="date"
  series={series}
  valueKeys={["minmin", "maxmax"]}
  minValue="auto"
  maxValue="auto"
  niceValues={false}
>
  <RadialAxis showCircle={false} valueTicks={4} valueTickFormat={(v) => \`\${v}°F\`} />
  {/* Record extremes */}
  <RadialArea
    dataKey="maxmax"
    baseDataKey="minmin"
    color="var(--chart-1)"
    fillOpacity={0.14}
    rampFrom={1}
    stroke="none"
    curve="linear"
  />
  {/* Normal range: average low → average high */}
  <RadialArea
    dataKey="max"
    baseDataKey="min"
    color="var(--chart-1)"
    fillOpacity={0.28}
    rampFrom={1}
    stroke="none"
    curve="linear"
  />
  <RadialLine dataKey="avg" strokeWidth={1.5} />
  <RadialScrubber variant="gradient" />
  <RadialCenter>
    {({ datum }) => (
      <ChartStatFlow
        value={datum ? datum.avg : annualAverage}
        label={datum ? formatDay(datum.date) : "annual average"}
        suffix="°F"
        formatOptions={{ maximumFractionDigits: 1 }}
      />
    )}
  </RadialCenter>
</RadialChart>`;

const dataSnippet = `// 366 days (plotted on the leap year 2000), °F — SFO daily temperatures
// 1999–2018 grouped by day of year (NOAA, via d3's radial area chart).
const days = [
  { date: Date.UTC(2000, 0, 1), avg: 50.2, min: 43.6, max: 55.7, minmin: 37, maxmax: 62 },
  { date: Date.UTC(2000, 0, 2), avg: 49.3, min: 43.9, max: 55.2, minmin: 37, maxmax: 62 },
  // …
];

// Shown in the center at rest
const annualAverage = days.reduce((total, d) => total + d.avg, 0) / days.length;

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const formatDay = (date) => dayFormat.format(date);`;

export const radialTemperatureAreaVariant: RadialGalleryVariant = {
  title: "Radial Chart - Temperature",
  description:
    "A year of San Francisco temperatures: record and normal ranges as radial bands around the daily average, after d3's radial area chart",
  code,
  data: dataSnippet,
  footer:
    "Hover around the year to read a day's average, normal range and records.",
  render: () => <TemperatureAreaExample />,
};
