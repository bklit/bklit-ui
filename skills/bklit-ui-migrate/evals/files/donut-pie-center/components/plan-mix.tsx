"use client";

import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";

const plans = [
  { plan: "Free", seats: 540, fill: "#a1a1aa" },
  { plan: "Pro", seats: 310, fill: "#6366f1" },
  { plan: "Team", seats: 120, fill: "#22c55e" },
  { plan: "Enterprise", seats: 30, fill: "#f59e0b" },
];

const total = plans.reduce((sum, p) => sum + p.seats, 0);

export function PlanMix() {
  return (
    <PieChart height={260} width={260}>
      <Tooltip />
      <Pie
        data={plans}
        dataKey="seats"
        innerRadius={70}
        nameKey="plan"
        outerRadius={110}
        paddingAngle={2}
      >
        {plans.map((p) => (
          <Cell fill={p.fill} key={p.plan} />
        ))}
        <Label position="center" value={`${total} seats`} />
      </Pie>
    </PieChart>
  );
}
