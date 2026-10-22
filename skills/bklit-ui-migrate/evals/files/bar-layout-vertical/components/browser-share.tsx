"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 },
  { browser: "Other", visitors: 90 },
];

export function BrowserShare() {
  return (
    <ResponsiveContainer aspect={4 / 3} width="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid horizontal={false} />
        <XAxis hide type="number" />
        <YAxis dataKey="browser" type="category" width={72} />
        <Tooltip cursor={false} />
        <Bar barSize={18} dataKey="visitors" fill="#6366f1" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
