"use client";

import {
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  Grid,
  LinearGradient,
  PatternLines,
} from "@bklitui/ui/charts";

const chartData = [
  { month: "Jan", revenue: 12_000, profit: 4500 },
  { month: "Feb", revenue: 15_500, profit: 5200 },
  { month: "Mar", revenue: 11_000, profit: 3800 },
  { month: "Apr", revenue: 18_500, profit: 7100 },
  { month: "May", revenue: 16_800, profit: 5400 },
  { month: "Jun", revenue: 21_200, profit: 8800 },
];

const stackedData = [
  { month: "Jan", desktop: 4000, mobile: 2400 },
  { month: "Feb", desktop: 5000, mobile: 3000 },
  { month: "Mar", desktop: 3500, mobile: 2800 },
  { month: "Apr", desktop: 4200, mobile: 3200 },
  { month: "May", desktop: 3800, mobile: 2600 },
  { month: "Jun", desktop: 5500, mobile: 3800 },
];

const browserData = [
  { browser: "Chrome", users: 275 },
  { browser: "Safari", users: 200 },
  { browser: "Firefox", users: 187 },
  { browser: "Edge", users: 173 },
  { browser: "Other", users: 90 },
];

// Generate consistent daily data (using seed-like approach)
const dailyData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2026, 0, 1);
  date.setDate(date.getDate() + i);
  // Use a deterministic pattern instead of Math.random()
  const baseValue = 50 + Math.sin(i / 7) * 30;
  const variation = ((i * 7) % 37) - 18; // Pseudo-random variation
  return {
    day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.floor(baseValue + variation),
  };
});

export function BarChartStackedDemo() {
  return (
    <div className="w-full">
      <BarChart data={stackedData} stacked stackGap={3} xDataKey="month">
        <Grid horizontal />
        <Bar
          dataKey="desktop"
          fill="hsl(217, 91%, 60%)"
          lineCap={4}
          stackGap={3}
        />
        <Bar
          dataKey="mobile"
          fill="hsl(217, 91%, 75%)"
          lineCap={4}
          stackGap={3}
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartHorizontalDemo() {
  return (
    <div className="w-full">
      <BarChart
        aspectRatio="4 / 3"
        data={browserData}
        margin={{ left: 80 }}
        orientation="horizontal"
        xDataKey="browser"
      >
        <Grid fadeVertical horizontal={false} vertical />
        <Bar dataKey="users" fill="hsl(217, 91%, 60%)" lineCap={4} />
        <BarYAxis />
        <ChartTooltip showCrosshair={false} />
      </BarChart>
    </div>
  );
}

export function BarChart90DaysDemo() {
  return (
    <div className="w-full">
      <BarChart barGap={0.1} data={dailyData} xDataKey="day">
        <Grid horizontal />
        <Bar dataKey="value" lineCap="butt" />
        <BarXAxis maxLabels={8} />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartGradientDemo() {
  return (
    <div className="w-full">
      <BarChart data={chartData} xDataKey="month">
        <LinearGradient
          from="hsl(217, 91%, 60%)"
          id="barGradient"
          to="hsl(280, 87%, 65%)"
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#barGradient)"
          lineCap={4}
          stroke="hsl(217, 91%, 60%)"
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}

export function BarChartPatternDemo() {
  return (
    <div className="w-full">
      <BarChart data={chartData} xDataKey="month">
        <PatternLines
          height={8}
          id="barPattern"
          orientation={["diagonal"]}
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={2}
          width={8}
        />
        <Grid horizontal />
        <Bar
          dataKey="revenue"
          fill="url(#barPattern)"
          lineCap={4}
          stroke="hsl(217, 91%, 60%)"
        />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </div>
  );
}
