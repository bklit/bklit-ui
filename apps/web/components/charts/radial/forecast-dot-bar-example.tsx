"use client";

import {
  ChartStatFlow,
  RadialAxis,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialDotBar,
  RadialLegend,
  RadialScrubber,
  type RadialSeries,
} from "@bklitui/ui/charts";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

// ---------------------------------------------------------------------------
// Data — household energy use per hour, metered until 15:00, forecast after
// ---------------------------------------------------------------------------

interface EnergyHour extends Record<string, unknown> {
  time: string;
  /** kWh from rooftop solar (null after "now") */
  solar: number | null;
  /** kWh bought from the grid (null after "now") */
  grid: number | null;
  /** Forecast total use, kWh */
  forecast: number;
}

const NOW_HOUR = 14;

/** [solar, grid, forecast] kWh per hour, 00:00 → 23:00 */
const usage: [number, number, number][] = [
  [0, 0.6, 0.6],
  [0, 0.5, 0.5],
  [0, 0.4, 0.4],
  [0, 0.4, 0.4],
  [0, 0.5, 0.5],
  [0, 0.7, 0.7],
  [0.1, 1.3, 1.4],
  [0.4, 1.6, 2],
  [0.9, 1, 1.8],
  [1.3, 0.3, 1.5],
  [1.6, 0.1, 1.6],
  [1.8, 0, 1.7],
  [1.9, 0.2, 2],
  [1.8, 0.1, 1.8],
  [1.5, 0.2, 1.7],
  [0, 0, 1.9],
  [0, 0, 2.2],
  [0, 0, 2.8],
  [0, 0, 3.2],
  [0, 0, 3],
  [0, 0, 2.6],
  [0, 0, 2],
  [0, 0, 1.3],
  [0, 0, 0.8],
];

const energyData: EnergyHour[] = usage.map(([solar, grid, forecast], hour) => ({
  time: `${String(hour).padStart(2, "0")}:00`,
  solar: hour <= NOW_HOUR ? solar : null,
  grid: hour <= NOW_HOUR ? grid : null,
  forecast,
}));

const energySeries: RadialSeries[] = [
  { dataKey: "solar", label: "Solar", color: "var(--chart-2)" },
  { dataKey: "grid", label: "Grid", color: "var(--chart-1)" },
];

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------

function total(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, v) => sum + v, 0);
}

const kwhFormat = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

function renderEnergyCenter({
  datum,
  isFuture,
  label,
  totals,
  values,
}: RadialCenterState) {
  const hour = datum as EnergyHour | null;
  let value = total(totals);
  let caption = "kWh so far";
  if (hour && isFuture) {
    value = hour.forecast;
    caption = `forecast ${label}`;
  } else if (hour) {
    value = total(values);
    caption = `kWh at ${label}`;
  }
  return (
    <ChartStatFlow
      formatOptions={kwhFormat}
      label={caption}
      labelClassName="mt-[4cqw] text-muted-foreground text-[clamp(0.625rem,7.5cqw,1.25rem)]"
      value={value}
      valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,19cqw,3rem)]"
    />
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function RadialForecastDotBarExample() {
  return (
    <RadialChart data={energyData} series={energySeries} xDataKey="time">
      <RadialAxis />
      <RadialDotBar
        dotSize={0.9}
        ghostColor="var(--muted-foreground)"
        ghostDataKey="forecast"
        ghostDotSize={0.9}
        ghostOpacity={0.6}
        layout="columns"
        maxValue={3.2}
        patterns={{
          grid: { preset: "diagonal", strokeWidth: 1.5 },
          ghost: { preset: "diagonal", stroke: "none" },
        }}
        rows={5}
      />
      <RadialScrubber variant="dashed" />
      <RadialCenter>{renderEnergyCenter}</RadialCenter>
      <RadialLegend formatValue={(v) => `${v.toFixed(1)} kWh`} />
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "solar", label: "Solar", color: "var(--chart-2)" },
  { dataKey: "grid", label: "Grid", color: "var(--chart-1)" },
];

<RadialChart data={chartData} xDataKey="time" series={series}>
  <RadialAxis />
  <RadialDotBar
    layout="columns"
    rows={5}
    dotSize={0.9}
    maxValue={3.2}
    ghostDataKey="forecast"
    ghostColor="var(--muted-foreground)"
    ghostDotSize={0.9}
    ghostOpacity={0.6}
    patterns={{
      grid: { preset: "diagonal", strokeWidth: 1.5 },
      ghost: { preset: "diagonal", stroke: "none" },
    }}
  />
  <RadialScrubber variant="dashed" />
  <RadialCenter>
    {({ datum, isFuture, totals, values, label }) => {
      const counts = datum ? values : totals;
      let caption = "kWh so far";
      if (datum) {
        caption = isFuture ? \`forecast \${label}\` : \`kWh at \${label}\`;
      }
      return (
        <ChartStatFlow
          value={isFuture ? datum.forecast : counts.solar + counts.grid}
          formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          label={caption}
        />
      );
    }}
  </RadialCenter>
  <RadialLegend formatValue={(v) => \`\${v.toFixed(1)} kWh\`} />
</RadialChart>`;

const dataSnippet = `// 24 hourly bins, clockwise from 00:00. Metered until 14:00;
// later hours have null readings and show the striped forecast.
const chartData = [
  { time: "00:00", solar: 0, grid: 0.6, forecast: 0.6 },
  // …
  { time: "12:00", solar: 1.9, grid: 0.2, forecast: 2 },
  // …
  { time: "18:00", solar: null, grid: null, forecast: 3.2 },
  // …
];`;

export const radialForecastDotBarVariant: RadialGalleryVariant = {
  title: "Radial Chart - Patterned Dots",
  description:
    "Hourly home energy as one column of large dots per hour: solid solar, diagonally striped grid, and the rest of the day as a striped forecast",
  code,
  data: dataSnippet,
  footer:
    'Key patterns by series dataKey; the "ghost" key styles the comparison dots. Hover a future hour for its forecast.',
  render: () => <RadialForecastDotBarExample />,
};
