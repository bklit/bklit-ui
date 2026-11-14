"use client";

import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import type { CSSProperties } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData } from "../recipe-data";

const SERIES = "var(--chart-line-primary)";

/** Dot grid over a faint chart-1 → chart-2 wash: texture for the glass to bend. */
const GLASS_BACKDROP: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1.6px)",
    "linear-gradient(135deg, color-mix(in oklab, var(--chart-1) 12%, transparent), transparent 45%, transparent 55%, color-mix(in oklab, var(--chart-2) 12%, transparent))",
  ].join(", "),
  backgroundSize: "12px 12px, 100% 100%",
  backgroundPosition: "center",
};

const GLASS_BACKDROP_CODE = `const GLASS_BACKDROP: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1.6px)",
    "linear-gradient(135deg, color-mix(in oklab, var(--chart-1) 12%, transparent), transparent 45%, transparent 55%, color-mix(in oklab, var(--chart-2) 12%, transparent))",
  ].join(", "),
  backgroundSize: "12px 12px, 100% 100%",
  backgroundPosition: "center",
};`;

function GlassLine() {
  return (
    <div className="rounded-lg" style={GLASS_BACKDROP}>
      <LineChart data={recipeDailyData}>
        <Line dataKey="visitors" stroke={SERIES} strokeWidth={2} />
        <XAxis />
        <ChartTooltip datePillVariant="glass" datePillVelocity />
      </LineChart>
    </div>
  );
}

function GlassArea() {
  return (
    <div className="rounded-lg" style={GLASS_BACKDROP}>
      <AreaChart data={recipeDailyData}>
        <Area
          dataKey="visitors"
          fadeBottom={100}
          fill={SERIES}
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip datePillVariant="glass" datePillVelocity />
      </AreaChart>
    </div>
  );
}

const GLASS_STEPS = (root: string) => [
  `Wrap \`<${root}>\` in a \`<div className="rounded-lg">\` with a subtle patterned background: a 12px dot grid (\`radial-gradient\` of \`--foreground\` at 16%) over a faint 135° wash from \`--chart-1\` to \`--chart-2\` at 12%. The date pill rides in the x-axis band below the plot, so the texture must be on the wrapper — \`<Background>\` only fills the plot.`,
  "Remove `<Grid>` (and any `<Background>`) so the dots are the only backdrop.",
  'Set `<ChartTooltip datePillVariant="glass" datePillVelocity />`. `glass` refracts the dots at the pill\'s rim (Chromium; a frosted blur elsewhere); `datePillVelocity` makes the pill swell and stretch with speed, then spring back.',
  "Keep `<XAxis />` as is — its labels fade out under the pill.",
];

const glassCode = (chart: string, body: string) => `"use client";

import type { CSSProperties } from "react";
${chart}
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${GLASS_BACKDROP_CODE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <div className="rounded-lg" style={GLASS_BACKDROP}>
${body}
    </div>
  );
}
`;

export const glassDatePill: Recipe = {
  id: "glass-date-pill",
  title: "Glass date pill",
  category: "hover-annotations",
  description:
    "A liquid-glass date pill that bends a dotted backdrop and swells with speed, like an iOS glass menu.",
  look: "no grid: the chart sits on a soft dot grid over a faint indigo-to-amber diagonal wash. On hover a clear glass capsule rides the x-axis under the crosshair — a bright specular rim, a soft shadow, and the dots bending and fringing red/blue at its edge. Moving quickly makes the capsule grow and stretch sideways, and it springs back when the pointer stops. Axis labels fade out where the capsule passes.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: GlassLine,
      install: ["line-chart", "x-axis", "chart-tooltip"],
      steps: GLASS_STEPS("LineChart"),
      code: glassCode(
        'import { Line, LineChart } from "@/components/charts/line-chart";',
        `      <LineChart data={data}>
        <Line dataKey="visitors" stroke="var(--chart-line-primary)" strokeWidth={2} />
        <XAxis />
        <ChartTooltip datePillVariant="glass" datePillVelocity />
      </LineChart>`
      ),
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: GlassArea,
      install: ["area-chart", "x-axis", "chart-tooltip"],
      steps: GLASS_STEPS("AreaChart"),
      code: glassCode(
        'import { Area, AreaChart } from "@/components/charts/area-chart";',
        `      <AreaChart data={data}>
        <Area
          dataKey="visitors"
          fadeBottom={100}
          fill="var(--chart-line-primary)"
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip datePillVariant="glass" datePillVelocity />
      </AreaChart>`
      ),
    },
  ],
};

function SpotlightLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <Line dataKey="visitors" stroke={SERIES} strokeWidth={2} />
      <XAxis activeLabelColor={SERIES} highlightRadius={120} />
      <ChartTooltip showDatePill={false} />
    </LineChart>
  );
}

function SpotlightArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fadeBottom={100}
        fill={SERIES}
        fillOpacity={0.18}
        strokeWidth={2}
      />
      <XAxis
        activeLabelColor={SERIES}
        highlightRadius={140}
        labelClassName="font-medium"
        nearbyLabelColor="var(--foreground)"
      />
      <ChartTooltip showDatePill={false} />
    </AreaChart>
  );
}

const SPOTLIGHT_STEPS = (nearbyStep: string) => [
  'Hide the date pill: `<ChartTooltip showDatePill={false} />`. With no pill, `XAxis` switches from fading labels to highlighting them (its default `hoverEffect` is `"auto"`).',
  'Colour the hovered row\'s axis label like the series: `<XAxis activeLabelColor="<series colour>" />`.',
  nearbyStep,
  "Keep the rest of the tooltip (panel, dots, crosshair) unchanged.",
];

export const axisSpotlight: Recipe = {
  id: "axis-spotlight",
  title: "Axis spotlight",
  category: "hover-annotations",
  description:
    "Drop the date pill and let the x-axis answer instead: labels near the crosshair light up in the series colour.",
  look: "no date pill under the crosshair. Instead the x-axis labels react to the pointer: the label for the hovered day turns the series colour, and labels near the crosshair warm toward it with distance, fading back to the muted label colour further away. Nothing on the axis disappears.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: SpotlightLine,
      install: ["line-chart", "x-axis", "chart-tooltip"],
      steps: SPOTLIGHT_STEPS(
        "Widen the glow so neighbouring labels pick it up too: `highlightRadius={120}` (px either side of the crosshair)."
      ),
      code: `"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

const SERIES = "var(--chart-line-primary)";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="visitors" stroke={SERIES} strokeWidth={2} />
      <XAxis activeLabelColor={SERIES} highlightRadius={120} />
      <ChartTooltip showDatePill={false} />
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: SpotlightArea,
      install: ["area-chart", "x-axis", "chart-tooltip"],
      steps: SPOTLIGHT_STEPS(
        'Two-tone it: neighbours blend toward the foreground instead of the accent — `nearbyLabelColor="var(--foreground)" highlightRadius={140} labelClassName="font-medium"`.'
      ),
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

const SERIES = "var(--chart-line-primary)";

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area
        dataKey="visitors"
        fadeBottom={100}
        fill={SERIES}
        fillOpacity={0.18}
        strokeWidth={2}
      />
      <XAxis
        activeLabelColor={SERIES}
        highlightRadius={140}
        labelClassName="font-medium"
        nearbyLabelColor="var(--foreground)"
      />
      <ChartTooltip showDatePill={false} />
    </AreaChart>
  );
}
`,
    },
  ],
};
