// biome-ignore-all lint/performance/noNamespaceImport: fixture mirrors the shadcn example
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
];

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const [range, setRange] = React.useState<"all" | "last4">("all");
  const filteredData = range === "all" ? chartData : chartData.slice(-4);

  return (
    <div className="rounded-xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Total Visitors</h2>
        <button
          onClick={() => setRange(range === "all" ? "last4" : "all")}
          type="button"
        >
          {range === "all" ? "Last 4 days" : "All"}
        </button>
      </div>
      <ChartContainer
        className="aspect-auto h-[250px] w-full"
        config={chartConfig}
      >
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id="fillDesktop" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            minTickGap={32}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            tickLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(value) =>
                  new Date(String(value)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
            }
            cursor={false}
          />
          <Area
            dataKey="mobile"
            fill="url(#fillMobile)"
            stackId="a"
            stroke="var(--color-mobile)"
            type="natural"
          />
          <Area
            dataKey="desktop"
            fill="url(#fillDesktop)"
            stackId="a"
            stroke="var(--color-desktop)"
            type="natural"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
