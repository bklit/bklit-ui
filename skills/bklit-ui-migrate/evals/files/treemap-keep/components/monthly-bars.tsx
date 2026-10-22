"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from "recharts";

const data = [
  { name: "Jan", revenue: 12_000 },
  { name: "Feb", revenue: 15_500 },
  { name: "Mar", revenue: 11_000 },
  { name: "Apr", revenue: 18_500 },
];

export function MonthlyBars() {
  return (
    <BarChart data={data} height={240} width={480}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="name" />
      <Tooltip />
      <Bar dataKey="revenue" fill="var(--chart-1)" />
    </BarChart>
  );
}
