"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const weeks = [
  { week: "W1", signups: 240, revenue: 4000, orders: 24 },
  { week: "W2", signups: 139, revenue: 3000, orders: 13 },
  { week: "W3", signups: 380, revenue: 2000, orders: 98 },
  { week: "W4", signups: 390, revenue: 2780, orders: 39 },
  { week: "W5", signups: 480, revenue: 1890, orders: 48 },
  { week: "W6", signups: 380, revenue: 2390, orders: 38 },
  { week: "W7", signups: 430, revenue: 3490, orders: 43 },
];

// Recharts 3 "Tiny Line Chart" style.
export function SignupsSparkline() {
  return (
    <LineChart
      data={weeks}
      responsive
      style={{
        width: "100%",
        maxWidth: 100,
        maxHeight: 50,
        aspectRatio: 1.618,
      }}
    >
      <Line dataKey="signups" dot={false} stroke="#2563eb" strokeWidth={2} />
    </LineChart>
  );
}

// Recharts 2 style: ResponsiveContainer with a small height and a tooltip.
export function RevenueSparkline() {
  return (
    <ResponsiveContainer height={48} width="100%">
      <AreaChart data={weeks} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <Tooltip cursor={false} />
        <Area
          dataKey="revenue"
          fill="#16a34a"
          fillOpacity={0.2}
          isAnimationActive={false}
          stroke="#16a34a"
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Fixed-size tiny bar chart.
export function OrdersSparkline() {
  return (
    <BarChart data={weeks} height={40} width={120}>
      <Bar dataKey="orders" fill="var(--chart-3)" radius={2} />
    </BarChart>
  );
}
