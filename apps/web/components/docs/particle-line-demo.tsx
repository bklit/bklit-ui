"use client";

import {
  ChartTooltip,
  LineChart,
  PARTICLE_LINE_GOLD,
  ParticleLine,
  type ParticleLineEffect,
  XAxis,
} from "@bklitui/ui/charts";

/** One series' look: four colours cycled left → right, plus its tooltip colour. */
export interface ParticleLineTone {
  name: string;
  colors: readonly string[];
  stroke: string;
}

/** Primary + secondary tones per effect, shared by docs, gallery and recipe. */
export const PARTICLE_LINE_TONES: Record<
  ParticleLineEffect,
  { primary: ParticleLineTone; secondary: ParticleLineTone }
> = {
  assemble: {
    primary: { name: "gold", colors: PARTICLE_LINE_GOLD, stroke: "#ffd45e" },
    secondary: {
      name: "silver",
      colors: ["#7d8594", "#b4bcc9", "#8d95a3", "#d5dbe4"],
      stroke: "#b4bcc9",
    },
  },
  comet: {
    primary: {
      name: "ice blue",
      colors: ["#2b7fff", "#5cc8ff", "#3aa0ff", "#c8f0ff"],
      stroke: "#5cc8ff",
    },
    secondary: {
      name: "violet",
      colors: ["#7c4dff", "#b39dff", "#9575ff", "#e3d9ff"],
      stroke: "#b39dff",
    },
  },
  stardust: {
    primary: {
      name: "rose",
      colors: ["#ff3d7f", "#ff8fb8", "#ff5c9a", "#ffd6e6"],
      stroke: "#ff8fb8",
    },
    secondary: {
      name: "teal",
      colors: ["#13b5a6", "#6fe3d3", "#2fc9b8", "#c9fff6"],
      stroke: "#6fe3d3",
    },
  },
};

/** 28 days of visitors (with last period) — a gentle trend and weekly rhythm. */
export const particleLineDocsData = Array.from({ length: 28 }, (_, index) => {
  const trend = 1400 + index * 38;
  const weekly = Math.sin((index / 7) * Math.PI * 2) * 180;
  const noise = Math.sin(index * 2.3) * 90 + Math.cos(index * 1.1) * 60;
  const visitors = Math.round(trend + weekly + noise);
  return {
    date: new Date(2026, 0, 5 + index),
    visitors,
    previous: Math.round(visitors * 0.78 + Math.cos(index * 0.9) * 110),
  };
});

const MARGIN = { top: 28, right: 24, bottom: 36, left: 24 };

export function ParticleLineDemo({
  effect = "assemble",
  data = particleLineDocsData,
}: {
  effect?: ParticleLineEffect;
  data?: typeof particleLineDocsData;
}) {
  const { primary, secondary } = PARTICLE_LINE_TONES[effect];
  return (
    <LineChart data={data} margin={MARGIN}>
      <ParticleLine
        colors={secondary.colors}
        dataKey="previous"
        density={3}
        effect={effect}
        spread={110}
        stroke={secondary.stroke}
        strokeWidth={1.5}
      />
      <ParticleLine
        colors={primary.colors}
        dataKey="visitors"
        effect={effect}
        stroke={primary.stroke}
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

const list = (colors: readonly string[]) =>
  `[${colors.map((color) => `"${color}"`).join(", ")}]`;

/** Snippet for one effect — installed-project imports. */
export function particleLineSnippet(
  effect: ParticleLineEffect,
  component = "ParticleLineChart"
): string {
  const { primary, secondary } = PARTICLE_LINE_TONES[effect];
  return `"use client";

import { LineChart } from "@/components/charts/line-chart";
import { ParticleLine } from "@/components/charts/particle-line";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

const PRIMARY = ${list(primary.colors)};
const SECONDARY = ${list(secondary.colors)};

export function ${component}({
  data,
}: {
  data: { date: Date; visitors: number; previous: number }[];
}) {
  return (
    <LineChart
      data={data}
      margin={{ top: 28, right: 24, bottom: 36, left: 24 }}
    >
      <ParticleLine
        colors={SECONDARY}
        dataKey="previous"
        density={3}
        effect="${effect}"
        spread={110}
        stroke="${secondary.stroke}"
        strokeWidth={1.5}
      />
      <ParticleLine
        colors={PRIMARY}
        dataKey="visitors"
        effect="${effect}"
        stroke="${primary.stroke}"
      />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`;
}

export const particleLineColorList = list;
