"use client";

import {
  ChartStatFlow,
  RadialAxis,
  RadialCenter,
  type RadialCenterState,
  RadialChart,
  RadialLegend,
  RadialRingBar,
  type RadialSeries,
} from "@bklitui/ui/charts";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

// ---------------------------------------------------------------------------
// Data — storage used per device, by content type (GB)
// ---------------------------------------------------------------------------

interface DeviceStorage extends Record<string, unknown> {
  device: string;
  capacity: number;
  photos: number;
  apps: number;
  documents: number;
  system: number;
}

const storageSeries: RadialSeries[] = [
  { dataKey: "photos", label: "Photos", color: "var(--chart-1)" },
  { dataKey: "apps", label: "Apps", color: "var(--chart-2)" },
  { dataKey: "documents", label: "Documents", color: "var(--chart-3)" },
  { dataKey: "system", label: "System", color: "var(--chart-4)" },
];

/** Innermost ring first. */
const storageData: DeviceStorage[] = [
  {
    device: "Phone",
    capacity: 256,
    photos: 118,
    apps: 54,
    documents: 9,
    system: 22,
  },
  {
    device: "Laptop",
    capacity: 1024,
    photos: 212,
    apps: 168,
    documents: 236,
    system: 74,
  },
  {
    device: "Cloud",
    capacity: 2048,
    photos: 846,
    apps: 0,
    documents: 412,
    system: 0,
  },
];

const KEYS = ["photos", "apps", "documents", "system"] as const;

/** Each ring is drawn as % of its own device's capacity. */
const storageShareData = storageData.map((d) => {
  const share: Record<string, unknown> = { ...d };
  for (const key of KEYS) {
    share[key] = (100 * d[key]) / d.capacity;
  }
  return share;
});

const totalCapacity = storageData.reduce((sum, d) => sum + d.capacity, 0);
const totalUsed = storageData.reduce(
  (sum, d) => sum + KEYS.reduce((s, key) => s + d[key], 0),
  0
);

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------

const gbFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const percentFormat = { maximumFractionDigits: 0 };

function renderStorageCenter({ index }: RadialCenterState) {
  const device = index === null ? null : (storageData[index] ?? null);
  const used = device ? KEYS.reduce((s, key) => s + device[key], 0) : totalUsed;
  const capacity = device ? device.capacity : totalCapacity;
  return (
    <>
      <ChartStatFlow
        formatOptions={percentFormat}
        label={device ? `${device.device} used` : "used across devices"}
        labelClassName="mt-[3cqw] text-muted-foreground text-[clamp(0.625rem,7.5cqw,1.125rem)]"
        suffix="%"
        value={(100 * used) / capacity}
        valueClassName="font-bold leading-none tracking-tight text-[clamp(1.25rem,19cqw,3rem)] [&_number-flow-react::part(suffix)]:text-[0.5em] [&_number-flow-react::part(suffix)]:text-muted-foreground"
      />
      <span className="mt-[1.5cqw] text-[clamp(0.625rem,6.5cqw,1rem)] text-muted-foreground tabular-nums">
        {gbFormat.format(used)} of {gbFormat.format(capacity)} GB
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Example
// ---------------------------------------------------------------------------

export function RadialStorageSemicircleExample() {
  return (
    <RadialChart
      data={storageShareData}
      endAngle={90}
      maxValue={100}
      orientation="angular"
      ringGap={0.18}
      series={storageSeries}
      startAngle={-90}
      xDataKey="device"
    >
      <RadialAxis
        showCircle={false}
        valueTickFormat={(v) => `${v}%`}
        valueTicks={[0, 25, 50, 75, 100]}
      />
      <RadialRingBar cornerRadius={3} segmentGap={3} />
      {/* The hole sits on the arc's center: lift the content into the half-disc */}
      <RadialCenter className="-translate-y-[30%]">
        {renderStorageCenter}
      </RadialCenter>
      <RadialLegend className="mt-8" showValues={false} />
    </RadialChart>
  );
}

const code = `const series = [
  { dataKey: "photos", label: "Photos", color: "var(--chart-1)" },
  { dataKey: "apps", label: "Apps", color: "var(--chart-2)" },
  { dataKey: "documents", label: "Documents", color: "var(--chart-3)" },
  { dataKey: "system", label: "System", color: "var(--chart-4)" },
];

<RadialChart
  data={chartData}
  xDataKey="device"
  series={series}
  orientation="angular"
  startAngle={-90}
  endAngle={90}
  maxValue={100}
  ringGap={0.18}
>
  <RadialAxis
    showCircle={false}
    valueTicks={[0, 25, 50, 75, 100]}
    valueTickFormat={(v) => \`\${v}%\`}
  />
  <RadialRingBar cornerRadius={3} segmentGap={3} />
  {/* The hole sits on the arc's center: lift the content into the half-disc */}
  <RadialCenter className="-translate-y-[30%]">
    {({ datum }) => (
      <ChartStatFlow
        value={datum ? percentUsed(datum) : overallUsed}
        formatOptions={{ maximumFractionDigits: 0 }}
        suffix="%"
        label={datum ? \`\${datum.device} used\` : "used across devices"}
      />
    )}
  </RadialCenter>
  <RadialLegend className="mt-8" showValues={false} />
</RadialChart>`;

const dataSnippet = `// One ring per device, innermost first. Values are % of that device's
// capacity, stacked end to end along the arc.
const chartData = [
  { device: "Phone", capacity: 256, photos: 46.1, apps: 21.1, documents: 3.5, system: 8.6 },
  { device: "Laptop", capacity: 1024, photos: 20.7, apps: 16.4, documents: 23, system: 7.2 },
  { device: "Cloud", capacity: 2048, photos: 41.3, apps: 0, documents: 20.1, system: 0 },
];

// % of one device in use
const percentUsed = (d) => d.photos + d.apps + d.documents + d.system;

// Shown in the center at rest: % of all capacity (GB) in use
const totalCapacity = chartData.reduce((total, d) => total + d.capacity, 0);
const overallUsed =
  chartData.reduce((total, d) => total + percentUsed(d) * d.capacity, 0) /
  totalCapacity;`;

export const radialStorageSemicircleVariant: RadialGalleryVariant = {
  title: "Radial Chart - Semicircle Stacked Rings",
  description:
    "Stacked ring bars on a half circle — one ring per device, content types stacked end to end as a share of its capacity, with % ticks along the arc",
  code,
  data: dataSnippet,
  footer:
    "Hover a ring to see that device's usage; hover the legend to isolate a content type.",
  render: () => <RadialStorageSemicircleExample />,
};
