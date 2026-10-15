"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

// Raw scores out of 150 — not normalised.
const data = [
  { subject: "Math", alice: 120, bob: 110 },
  { subject: "Chinese", alice: 98, bob: 130 },
  { subject: "English", alice: 86, bob: 130 },
  { subject: "Geography", alice: 99, bob: 100 },
  { subject: "Physics", alice: 85, bob: 90 },
  { subject: "History", alice: 65, bob: 85 },
];

export function SkillsRadar() {
  return (
    <ResponsiveContainer height={360} width="100%">
      <RadarChart cx="50%" cy="50%" data={data} outerRadius="80%">
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 150]} />
        <Radar
          dataKey="alice"
          fill="#8884d8"
          fillOpacity={0.6}
          name="Alice"
          stroke="#8884d8"
        />
        <Radar
          dataKey="bob"
          fill="#82ca9d"
          fillOpacity={0.6}
          name="Bob"
          stroke="#82ca9d"
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
