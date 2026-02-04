"use client";

import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";

const chartData = [
  {
    date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    users: 1200,
    pageviews: 4500,
  },
  {
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    users: 1450,
    pageviews: 5100,
  },
  {
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    users: 1380,
    pageviews: 4900,
  },
  {
    date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    users: 1620,
    pageviews: 5800,
  },
  {
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    users: 1850,
    pageviews: 6800,
  },
  {
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    users: 1750,
    pageviews: 6400,
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    users: 2100,
    pageviews: 7800,
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    users: 2320,
    pageviews: 8700,
  },
];

const barData = [
  { month: "Jan", revenue: 12_000 },
  { month: "Feb", revenue: 15_500 },
  { month: "Mar", revenue: 11_000 },
  { month: "Apr", revenue: 18_500 },
  { month: "May", revenue: 16_800 },
  { month: "Jun", revenue: 21_200 },
];

export function TooltipDefaultDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function TooltipCrosshairOnlyDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip showDatePill={false} showDots={false} />
      </LineChart>
    </div>
  );
}

export function TooltipMinimalDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip
          showCrosshair={false}
          showDatePill={false}
          showDots={false}
        />
      </LineChart>
    </div>
  );
}

export function TooltipCustomRowsDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
        <XAxis />
        <ChartTooltip
          rows={(point) => [
            {
              color: "var(--chart-line-primary)",
              label: "Active Users",
              value: (point.users as number)?.toLocaleString() ?? "0",
            },
            {
              color: "var(--chart-line-secondary)",
              label: "Page Views",
              value: (point.pageviews as number)?.toLocaleString() ?? "0",
            },
          ]}
        />
      </LineChart>
    </div>
  );
}

export function TooltipBarChartDemo() {
  return (
    <div className="w-full">
      <BarChart data={barData} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="var(--chart-line-primary)"
          lineCap="round"
        />
        <BarXAxis />
        <ChartTooltip
          rows={(point) => [
            {
              color: "var(--chart-line-primary)",
              label: "Revenue",
              value: `$${((point.revenue as number) ?? 0).toLocaleString()}`,
            },
          ]}
        />
      </BarChart>
    </div>
  );
}

export function TooltipCustomContentDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <Line dataKey="users" stroke="var(--chart-line-primary)" />
        <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
        <XAxis />
        <ChartTooltip
          content={({ point }) => {
            const date = point.date as Date | undefined;
            const users = (point.users as number) ?? 0;
            const pageviews = (point.pageviews as number) ?? 0;
            return (
              <div className="flex flex-col gap-2 p-3">
                <div className="font-medium text-sm">
                  {date != null
                    ? (date instanceof Date
                        ? date
                        : new Date(date as number | string)
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-zinc-400">Users</span>
                  <span className="font-mono">{users.toLocaleString()}</span>
                  <span className="text-zinc-400">Views</span>
                  <span className="font-mono">
                    {pageviews.toLocaleString()}
                  </span>
                  <span className="text-zinc-400">Ratio</span>
                  <span className="font-mono">
                    {users > 0 ? (pageviews / users).toFixed(2) : "—"}x
                  </span>
                </div>
              </div>
            );
          }}
        />
      </LineChart>
    </div>
  );
}
