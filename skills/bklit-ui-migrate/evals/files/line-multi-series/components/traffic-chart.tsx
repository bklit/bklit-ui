"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { date: "2025-01-06", users: 1200, sessions: 1840 },
  { date: "2025-01-07", users: 1350, sessions: 2010 },
  { date: "2025-01-08", users: 1100, sessions: 1720 },
  { date: "2025-01-09", users: 1450, sessions: 2240 },
  { date: "2025-01-10", users: 1380, sessions: 2105 },
  { date: "2025-01-11", users: 1520, sessions: 2390 },
];

export function TrafficChart() {
  return (
    <ResponsiveContainer height={300} width="100%">
      <LineChart
        data={data}
        margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
        <Tooltip />
        <Legend />
        <Line
          dataKey="users"
          dot={false}
          name="Users"
          stroke="#2563eb"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="sessions"
          dot={false}
          name="Sessions"
          stroke="#16a34a"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
