"use client";

import { areaY, defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";

interface Row {
  period: string;
  value: number;
}

const rows: readonly Row[] = [
  { period: "Mon", value: 12_400 },
  { period: "Tue", value: 13_100 },
  { period: "Wed", value: 12_800 },
  { period: "Thu", value: 14_900 },
  { period: "Fri", value: 15_600 },
  { period: "Sat", value: 14_200 },
  { period: "Sun", value: 16_300 },
];

const revenueSparkline = defineChart({
  marks: [
    areaY(rows, {
      x: "period",
      y: "value",
      fill: "url(#revenue-fill)",
      curve: "monotoneX",
    }),
    lineY(rows, {
      x: "period",
      y: "value",
      stroke: "var(--chart-1)",
      strokeWidth: 1.5,
      curve: "monotoneX",
    }),
  ],
  scales: {
    x: { scale: () => scalePoint<string>(), axis: false },
    y: { scale: () => scaleLinear().domain([10_000, 17_000]), axis: false },
  },
  gradients: [
    {
      id: "revenue-fill",
      stops: [
        { offset: 0, color: "var(--chart-1)", opacity: 0.3 },
        { offset: 1, color: "var(--chart-1)", opacity: 0 },
      ],
    },
  ],
  margin: { top: 4, right: 0, bottom: 4, left: 0 },
  guides: false,
  svgAnimation: true,
  tooltip: false,
});

export function RevenueKpi() {
  const latest = rows.at(-1)?.value ?? 0;
  return (
    <div className="rounded-xl border p-4">
      <p className="text-muted-foreground text-sm">Revenue</p>
      <p className="font-semibold text-2xl">${latest.toLocaleString()}</p>
      <Chart
        ariaLabel="Revenue over the last 7 days"
        definition={revenueSparkline}
        height={40}
        idPrefix="revenue-kpi"
        width={160}
      />
    </div>
  );
}
