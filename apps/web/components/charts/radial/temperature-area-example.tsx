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
import { useMemo } from "react";
import {
  type SfTemperatureDay,
  sfTemperatureData,
} from "@/components/charts/radial/sf-temperature-data";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";
import { useLocalNow } from "@/components/charts/radial/use-local-now";

// ---------------------------------------------------------------------------
// Data — this year's daily temperatures up to today, over SFO normals and
// records by day of year (1999–2018)
// ---------------------------------------------------------------------------

interface TemperatureDay extends SfTemperatureDay {
  /** This year's daily mean (simulated) — null after today */
  temp: number | null;
}

/** Park–Miller PRNG — deterministic so SSR and client render the same line. */
function seededRandom(seed: number) {
  let state = seed % 2_147_483_647;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * One calendar year of normals (Feb 29 dropped outside leap years) with a
 * simulated daily mean: the normal average plus slow, autocorrelated weather
 * noise seeded by `year`. Every day draws its noise whatever `today` is, so
 * the past stays put as the date advances; days after `today` drop `temp`.
 */
function generateTemperatureYear(
  year: number,
  todayIndex: number
): TemperatureDay[] {
  const rand = seededRandom(year * 7919 + 1);
  rand();
  rand();
  let anomaly = 0;
  return sfTemperatureData
    .filter((_, i) => isLeapYear(year) || i !== 59)
    .map((d, i) => {
      const normal = new Date(d.date);
      anomaly = 0.8 * anomaly + 2.6 * (rand() + rand() + rand() - 1.5);
      const temp = Math.min(
        d.maxmax - 1,
        Math.max(d.minmin + 1, d.avg + anomaly)
      );
      return {
        ...d,
        date: Date.UTC(year, normal.getUTCMonth(), normal.getUTCDate()),
        temp: i <= todayIndex ? Math.round(temp * 10) / 10 : null,
      };
    });
}

/** Days since Jan 1 for a YYYYMMDD key. */
function dayOfYear(dayKey: number): number {
  const year = Math.floor(dayKey / 10_000);
  const month = Math.floor(dayKey / 100) % 100;
  const day = dayKey % 100;
  return Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000
  );
}

/** This year's days up to the viewer's local date. */
function useTemperatureYear() {
  const { dayKey } = useLocalNow();
  const year = Math.floor(dayKey / 10_000);
  const todayIndex = dayOfYear(dayKey);
  const days = useMemo(
    () => generateTemperatureYear(year, todayIndex),
    [year, todayIndex]
  );
  return { days, todayIndex, year };
}

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

// ---------------------------------------------------------------------------
// Center — a day's mean against its normal; at rest, today
// ---------------------------------------------------------------------------

const degreeFormat = { maximumFractionDigits: 1, minimumFractionDigits: 1 };

const detailClassName =
  "text-[clamp(0.5625rem,7cqw,0.875rem)] text-muted-foreground tabular-nums leading-snug";

/** "+2.1° vs normal", "−0.4° vs normal" with a true minus sign. */
function formatVsNormal(temp: number, normal: number): string {
  const diff = Math.round((temp - normal) * 10) / 10;
  if (diff === 0) {
    return "at normal";
  }
  return `${diff < 0 ? "−" : "+"}${Math.abs(diff).toFixed(1)}° vs normal`;
}

function TemperatureCenter({
  day,
  isToday,
}: {
  day: TemperatureDay;
  isToday: boolean;
}) {
  const hasTemp = day.temp !== null;
  return (
    <>
      <span className="mb-[3cqw] font-medium text-[clamp(0.625rem,8cqw,1rem)] text-muted-foreground">
        {isToday
          ? `Today · ${dayFormat.format(day.date)}`
          : dayFormat.format(day.date)}
      </span>
      <ChartStatFlow
        formatOptions={degreeFormat}
        label={
          day.temp === null
            ? "normal average"
            : formatVsNormal(day.temp, day.avg)
        }
        labelClassName="mt-[2cqw] text-muted-foreground text-[clamp(0.5625rem,7cqw,0.875rem)]"
        suffix="°F"
        value={day.temp ?? day.avg}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,18cqw,2.75rem)]"
      />
      <span className={`mt-[4cqw] ${detailClassName}`}>
        {hasTemp
          ? `normal ${Math.round(day.min)}–${Math.round(day.max)}°`
          : `low ${Math.round(day.min)}° · high ${Math.round(day.max)}°`}
      </span>
      <span className={detailClassName}>
        {`record ${day.minmin}–${day.maxmax}°`}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function TemperatureAreaExample() {
  const { days, todayIndex, year } = useTemperatureYear();

  const series = useMemo<RadialSeries[]>(
    () => [{ dataKey: "temp", label: String(year), color: "var(--chart-1)" }],
    [year]
  );

  const renderCenter = useMemo(
    () =>
      ({ index }: RadialCenterState) => {
        const day = days[index ?? todayIndex];
        return day ? (
          <TemperatureCenter
            day={day}
            isToday={index === null || index === todayIndex}
          />
        ) : null;
      },
    [days, todayIndex]
  );

  return (
    <RadialChart
      angleType="time"
      data={days}
      maxValue="auto"
      minValue="auto"
      niceValues={false}
      series={series}
      trackNow
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
      {/* This year, Jan 1 → today */}
      <RadialLine dataKey="temp" strokeWidth={1.5} />
      <RadialScrubber variant="gradient" />
      <RadialCenter>{renderCenter}</RadialCenter>
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "temp", label: "2026", color: "var(--chart-1)" },
];

<RadialChart
  angleType="time"
  data={days}
  xDataKey="date"
  series={series}
  trackNow
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
  {/* This year up to today; ends in a pulsing "now" marker */}
  <RadialLine dataKey="temp" strokeWidth={1.5} />
  <RadialScrubber variant="gradient" />
  <RadialCenter>
    {({ index }) => {
      const day = days[index ?? todayIndex];
      return (
        <ChartStatFlow
          value={day.temp ?? day.avg}
          label={day.temp === null ? "normal average" : formatDay(day.date)}
          suffix="°F"
          formatOptions={{ maximumFractionDigits: 1 }}
        />
      );
    }}
  </RadialCenter>
</RadialChart>`;

const dataSnippet = `// One datum per day of this year, °F. Normals and records are SFO daily
// temperatures 1999–2018 by day of year (NOAA, via d3's radial area chart);
// \`temp\` is this year's daily mean, null after today so \`trackNow\` rests there.
const days = [
  { date: Date.UTC(2026, 0, 1), temp: 51.4, avg: 50.2, min: 43.6, max: 55.7, minmin: 37, maxmax: 62 },
  // …
  { date: Date.UTC(2026, 9, 29), temp: 61.3, avg: 60, min: 52.8, max: 66.8, minmin: 47, maxmax: 80 },
  { date: Date.UTC(2026, 9, 30), temp: null, avg: 59.2, min: 51.8, max: 66.3, minmin: 45, maxmax: 78 },
  // …
];

// Today in the viewer's time zone (days since Jan 1)
const now = new Date();
const todayIndex = Math.round(
  (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
    Date.UTC(now.getFullYear(), 0, 1)) / 86_400_000
);

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const formatDay = (date) => dayFormat.format(date);`;

export const radialTemperatureAreaVariant: RadialGalleryVariant = {
  title: "Radial Chart - Temperature",
  description:
    "This year's daily San Francisco temperature up to today, over record and normal ranges as radial bands, after d3's radial area chart",
  code,
  data: dataSnippet,
  footer:
    "The line runs to your local date and rests on today; hover a past day for its temperature against normal, or a later day for its normal range.",
  render: () => <TemperatureAreaExample />,
};
