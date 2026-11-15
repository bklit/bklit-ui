"use client";

import {
  BarChart,
  BarLollipop,
  BarXAxis,
  ChartTooltip,
  Grid,
} from "@bklitui/ui/charts";

const revenueData = [
  { month: "Jan", revenue: 12_000 },
  { month: "Feb", revenue: 15_500 },
  { month: "Mar", revenue: 11_000 },
  { month: "Apr", revenue: 18_500 },
  { month: "May", revenue: 16_000 },
  { month: "Jun", revenue: 21_000 },
  { month: "Jul", revenue: 19_500 },
  { month: "Aug", revenue: 24_000 },
];

const profitLossData = [
  { month: "Jan", profit: 4200 },
  { month: "Feb", profit: -1800 },
  { month: "Mar", profit: 2600 },
  { month: "Apr", profit: -3400 },
  { month: "May", profit: 5100 },
  { month: "Jun", profit: -900 },
  { month: "Jul", profit: 3800 },
  { month: "Aug", profit: 6200 },
].map((row) => ({
  ...row,
  color: row.profit >= 0 ? "var(--chart-positive)" : "var(--chart-negative)",
}));

/** Lollipop series: dashed stems with a dot at each value. */
export function BarLollipopDemo() {
  return (
    <div className="w-full">
      <BarChart data={revenueData} xDataKey="month">
        <Grid horizontal strokeDasharray="3,4" />
        <BarLollipop dataKey="revenue" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </BarChart>
    </div>
  );
}

/** Diverging lollipops, dots colored per row with `colorKey`. */
export function BarLollipopProfitLossDemo() {
  return (
    <div className="w-full">
      <BarChart data={profitLossData} xDataKey="month">
        <Grid horizontal strokeDasharray="3,4" />
        <BarLollipop colorKey="color" dataKey="profit" />
        <BarXAxis />
        <ChartTooltip showCrosshair={false} showDots={false} />
      </BarChart>
    </div>
  );
}
