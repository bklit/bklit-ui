"use client";

import {
  ChartStatFlow,
  RadialAxis,
  RadialBar,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialLegend,
  type RadialSeries,
} from "@bklitui/ui/charts";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";
import {
  type UsStateAgeDatum,
  usAgeBands,
  usStateAgeData,
} from "@/components/charts/radial/us-state-age-data";

// ---------------------------------------------------------------------------
// Series — five age bands, youngest innermost, one palette slot each
// (`--chart-1` … `--chart-5` by position, so the header palette applies)
// ---------------------------------------------------------------------------

const ageSeries: RadialSeries[] = usAgeBands.map((band) => ({ ...band }));

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatPopulation = (value: number) => compact.format(value);

/** Value rings — skip 0 (the band base), like d3's `y.ticks(5).slice(1)` */
const VALUE_TICKS = [10_000_000, 20_000_000, 30_000_000, 40_000_000];

const populationFormat = {
  notation: "compact",
  maximumFractionDigits: 1,
} as const;

// ---------------------------------------------------------------------------
// Center — hovered state's total and largest age band; national total at rest
// ---------------------------------------------------------------------------

function largestBand(values: Record<string, number>) {
  let best: (typeof usAgeBands)[number] = usAgeBands[0];
  for (const band of usAgeBands) {
    if ((values[band.dataKey] ?? 0) > (values[best.dataKey] ?? 0)) {
      best = band;
    }
  }
  const total = Object.values(values).reduce((sum, v) => sum + v, 0);
  const share = total > 0 ? (values[best.dataKey] ?? 0) / total : 0;
  return { label: best.label, share };
}

const captionClassName =
  "max-w-full truncate text-muted-foreground text-[clamp(0.625rem,8cqw,1.125rem)]";

function renderPopulationCenter({ datum, totals, values }: RadialCenterState) {
  const state = datum as UsStateAgeDatum | null;
  const source = state ? values : totals;
  const total = Object.values(source).reduce((sum, v) => sum + v, 0);
  const top = largestBand(source);
  return (
    <>
      <ChartStatFlow
        formatOptions={populationFormat}
        label={state ? state.name : "US population"}
        labelClassName={`mt-[3cqw] ${captionClassName}`}
        value={total}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,18cqw,3rem)]"
      />
      <span className="mt-[2cqw] max-w-full truncate font-medium text-[clamp(0.625rem,7cqw,1rem)] text-foreground/70 tabular-nums">
        {state
          ? `Largest: ${top.label} · ${Math.round(top.share * 100)}%`
          : "50 states + DC"}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function PopulationStackedBarExample() {
  return (
    <RadialChart
      angleType="band"
      data={usStateAgeData}
      maxValue="stacked"
      series={ageSeries}
      xDataKey="state"
    >
      <RadialBar fadedOpacity={0.3} />
      {/* After the bars so the value rings and labels read on top (as in d3's original) */}
      <RadialAxis
        showCircle={false}
        valueTickFormat={formatPopulation}
        valueTicks={VALUE_TICKS}
      />
      <RadialCenter>{renderPopulationCenter}</RadialCenter>
      <RadialLegend showValues={false} />
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "under14", label: "Under 14" },
  { dataKey: "age14to24", label: "14–24" },
  { dataKey: "age25to44", label: "25–44" },
  { dataKey: "age45to64", label: "45–64" },
  { dataKey: "age65plus", label: "65+" },
]; // colors default to --chart-1 … --chart-5 by position

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

<RadialChart
  angleType="band"
  data={states} // sorted by total, largest first
  xDataKey="state"
  series={series}
  maxValue="stacked"
>
  <RadialBar />
  {/* after the bars, so value rings + labels sit on top */}
  <RadialAxis
    showCircle={false}
    valueTicks={[10e6, 20e6, 30e6, 40e6]}
    valueTickFormat={(v) => compact.format(v)}
  />
  <RadialCenter>
    {({ datum, totals, values }) => {
      const counts = datum ? values : totals;
      return (
        <ChartStatFlow
          value={Object.values(counts).reduce((a, b) => a + b, 0)}
          formatOptions={{ notation: "compact", maximumFractionDigits: 1 }}
          label={datum ? String(datum.name) : "US population"}
        />
      );
    }}
  </RadialCenter>
  <RadialLegend showValues={false} />
</RadialChart>`;

const dataSnippet = `// 50 states + DC (ACS 2008), sorted by total population.
const states = [
  { state: "CA", name: "California", under14: 7205000, age14to24: 6014000, age25to44: 10605000, age45to64: 8819000, age65plus: 4114000 },
  { state: "TX", name: "Texas", under14: 5305000, age14to24: 3875000, age25to44: 7018000, age45to64: 5657000, age65plus: 2472000 },
  // …
  { state: "WY", name: "Wyoming", under14: 99000, age14to24: 83000, age25to44: 137000, age45to64: 147000, age65plus: 66000 },
];`;

export const radialPopulationStackedBarVariant: RadialGalleryVariant = {
  title: "Radial Chart - Population by State",
  description:
    "US state populations stacked by age band around the circle, sorted by total, with rotated state labels and compact value rings on a radial scale",
  code,
  data: dataSnippet,
  footer:
    "Hover a state for its total and largest age band; hover the legend to isolate a band. Data: US Census ACS 2008 via d3's radial stacked bar chart.",
  render: () => <PopulationStackedBarExample />,
};
