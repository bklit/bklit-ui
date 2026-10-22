"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Line,
  LineChart,
  Weekends,
  XAxis,
} from "@bklitui/ui/charts";
import {
  VERTICAL_FADE_SOURCE,
  VERTICAL_FADE_STEP,
} from "@/lib/recipes/snippets";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData } from "../recipe-data";
import { VerticalFade } from "../vertical-fade";
import { BAR_MARGIN } from "./shared";

function WeekendLine() {
  return (
    <LineChart data={recipeDailyData}>
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Line dataKey="visitors" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}

function WeekendArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Area dataKey="visitors" fillOpacity={0.3} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}

function WeekendBar() {
  return (
    <BarChart data={recipeDailyData} margin={BAR_MARGIN} xDataKey="date">
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Bar dataKey="visitors" lineCap={2} />
      <BarXAxis maxLabels={7} />
      <ChartTooltip />
    </BarChart>
  );
}

const WRAP_STEP =
  "Add `<VerticalFade><Weekends /></VerticalFade>` as the **first** child of the chart so the stripes paint behind the series. `Weekends` comes from `@/components/charts/weekends`; its defaults are Sat + Sun in local time — pass `utc` if the data's dates are UTC midnights, or `weekendDays={[5, 6]}` for Fri/Sat weekends. Each stripe column is then solid only through the middle third of the plot and fades out towards the top and bottom.";

const FADE_IMPORTS = `import { type ReactNode, useId } from "react";
import { useChartStable } from "@/components/charts/chart-context";`;

export const weekendStripes: Recipe = {
  id: "weekend-stripes",
  title: "Weekend stripes",
  category: "backgrounds",
  description:
    "Drop the grid on daily charts and let faded, hatched weekend columns set the rhythm.",
  look: "no grid lines; every Saturday and Sunday is shaded with a muted diagonal-stripe column (`var(--chart-foreground-muted)`) behind the series, so the weekly cycle is the only reference texture. The stripes fade to transparent over the top 33% and bottom 33% of the plot, solid only through the middle. Only for charts whose x values are dates with daily granularity.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: WeekendLine,
      install: ["weekends"],
      steps: [
        "Only convert line charts with a daily `Date` x axis; skip hourly, weekly or monthly ones (weekend columns don't read there).",
        "Remove the `<Grid />` child of `<LineChart>` and its import.",
        VERTICAL_FADE_STEP,
        WRAP_STEP,
        "Leave `<Line>`, `<XAxis />` and `<ChartTooltip />` unchanged.",
      ],
      code: `"use client";

${FADE_IMPORTS}
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { Weekends } from "@/components/charts/weekends";
import { XAxis } from "@/components/charts/x-axis";

${VERTICAL_FADE_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Line dataKey="visitors" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
`,
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaChart",
      Preview: WeekendArea,
      install: ["weekends"],
      steps: [
        "Only convert area charts with a daily `Date` x axis.",
        "Remove the `<Grid />` child of `<AreaChart>` and its import.",
        VERTICAL_FADE_STEP,
        WRAP_STEP,
        "Lower each `<Area>` to `fillOpacity={0.3}` so the stripes stay visible under the fill. Keep stroke colours.",
      ],
      code: `"use client";

${FADE_IMPORTS}
import { Area, AreaChart } from "@/components/charts/area-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { Weekends } from "@/components/charts/weekends";
import { XAxis } from "@/components/charts/x-axis";

${VERTICAL_FADE_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Area dataKey="visitors" fillOpacity={0.3} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
`,
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: WeekendBar,
      install: ["weekends"],
      steps: [
        'Only convert bar charts whose `xDataKey` holds a `Date` or `"YYYY-MM-DD"` string per day; skip category bar charts.',
        "Remove the `<Grid />` child of `<BarChart>` and its import.",
        VERTICAL_FADE_STEP,
        `${WRAP_STEP} On bar charts \`Weekends\` shades whole weekend columns; if the date lives in a field other than \`xDataKey\`, pass \`dateKey\`.`,
        "Use `lineCap={2}` on each `<Bar>` and `<BarXAxis maxLabels={7} />` so roughly one label per week shows.",
      ],
      code: `"use client";

${FADE_IMPORTS}
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { Weekends } from "@/components/charts/weekends";

${VERTICAL_FADE_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <BarChart
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="date"
    >
      <VerticalFade>
        <Weekends />
      </VerticalFade>
      <Bar dataKey="visitors" lineCap={2} />
      <BarXAxis maxLabels={7} />
      <ChartTooltip />
    </BarChart>
  );
}
`,
    },
  ],
};
