"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const people = [
  { height: 158, weight: 54 },
  { height: 165, weight: 61 },
  { height: 171, weight: 68 },
  { height: 176, weight: 74 },
  { height: 182, weight: 80 },
  { height: 190, weight: 88 },
];

export function HeightWeight() {
  return (
    <ResponsiveContainer height={320} width="100%">
      <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
        <CartesianGrid />
        <XAxis dataKey="height" name="Height" type="number" unit="cm" />
        <YAxis dataKey="weight" name="Weight" type="number" unit="kg" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={people} fill="#0ea5e9" name="People" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
