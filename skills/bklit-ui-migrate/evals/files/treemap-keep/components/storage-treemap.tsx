"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

const data = [
  {
    name: "Media",
    children: [
      { name: "Photos", size: 4200 },
      { name: "Videos", size: 9800 },
    ],
  },
  {
    name: "Documents",
    children: [
      { name: "PDF", size: 1200 },
      { name: "Sheets", size: 640 },
    ],
  },
];

export function StorageTreemap() {
  return (
    <ResponsiveContainer height={320} width="100%">
      <Treemap
        aspectRatio={4 / 3}
        data={data}
        dataKey="size"
        fill="#8884d8"
        stroke="#fff"
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}
