"use client";

import {
  Area,
  AreaChart,
  type ChartMarker,
  ChartMarkers,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  MarkerTooltipContent,
  useActiveMarkers,
  XAxis,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeEventMarkers } from "../recipe-data";

const markers: ChartMarker[] = recipeEventMarkers;

function ActiveMarkers({ items }: { items: ChartMarker[] }) {
  const active = useActiveMarkers(items);
  if (active.length === 0) {
    return null;
  }
  return <MarkerTooltipContent markers={active} />;
}

function MarkersLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <Line dataKey="visitors" strokeWidth={2} />
      <ChartMarkers items={markers} />
      <XAxis />
      <ChartTooltip>
        <ActiveMarkers items={markers} />
      </ChartTooltip>
    </LineChart>
  );
}

function MarkersArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
      <ChartMarkers items={markers} />
      <XAxis />
      <ChartTooltip>
        <ActiveMarkers items={markers} />
      </ChartTooltip>
    </AreaChart>
  );
}

const MARKERS_DATA = `// Dates must land on the same calendar day as a data row.
const markers: ChartMarker[] = [
  {
    date: new Date(2026, 0, 10),
    icon: "🚀",
    title: "v2.0 launch",
    description: "New dashboard shipped",
  },
  {
    date: new Date(2026, 0, 18),
    icon: "📣",
    title: "Newsletter",
    description: "Monthly send to 40k readers",
  },
  // Same day as the newsletter → one badge with a count that fans out on hover
  {
    date: new Date(2026, 0, 18),
    icon: "🐛",
    title: "Hotfix",
    description: "Checkout bug fixed",
  },
];

function ActiveMarkers({ items }: { items: ChartMarker[] }) {
  const active = useActiveMarkers(items);
  if (active.length === 0) {
    return null;
  }
  return <MarkerTooltipContent markers={active} />;
}`;

const MARKERS_IMPORT = `import {
  type ChartMarker,
  ChartMarkers,
  MarkerTooltipContent,
  useActiveMarkers,
} from "@/components/charts/markers";`;

const STEPS = (root: string, series: string) => [
  "Build a `ChartMarker[]` from the project's real events (releases, campaigns, incidents) — `{ date, icon, title, description? }`, with an emoji or small SVG as `icon`. Ask me where the events come from if it isn't obvious; don't invent production data. Each `date` must fall on the same calendar day as a data row; markers that share a day group into one badge with a count.",
  `Add \`<ChartMarkers items={markers} />\` (from \`@/components/charts/markers\`) inside \`<${root}>\`, after the ${series} and before \`<XAxis />\`. It pins a round icon badge above the plot with a dashed guide line down to the baseline; grouped badges fan out on hover.`,
  "Add the small `ActiveMarkers` component from the reference and render it **inside** `<ChartTooltip>` as a child, so hovering a marker's day lists its events under the tooltip rows.",
  "Keep at least 22px of `margin.top` (the default 40px is fine) so badges aren't clipped.",
];

export const eventMarkers: Recipe = {
  id: "event-markers",
  title: "Event markers",
  category: "hover-annotations",
  description:
    "Pin launches and incidents to the timeline with icon badges, guide lines and tooltip details.",
  look: "release / campaign / incident events are pinned to their dates with round icon badges sitting just above the plot, each with a dashed guide line down through the chart. Events on the same day collapse into one badge with a count that fans out radially on hover, and when the crosshair reaches an event's day the tooltip lists the events under the usual value rows.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: MarkersLine,
      install: ["markers"],
      steps: STEPS("LineChart", "`<Line>`s"),
      code: `"use client";

import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
${MARKERS_IMPORT}
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${MARKERS_DATA}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="visitors" strokeWidth={2} />
      <ChartMarkers items={markers} />
      <XAxis />
      <ChartTooltip>
        <ActiveMarkers items={markers} />
      </ChartTooltip>
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: MarkersArea,
      install: ["markers"],
      steps: STEPS("AreaChart", "`<Area>`s"),
      code: `"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
${MARKERS_IMPORT}
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${MARKERS_DATA}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
      <ChartMarkers items={markers} />
      <XAxis />
      <ChartTooltip>
        <ActiveMarkers items={markers} />
      </ChartTooltip>
    </AreaChart>
  );
}
`,
    },
  ],
};
