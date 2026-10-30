"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LinearGradient,
  LineChart,
  PatternLines,
  useChart,
  XAxis,
} from "@bklitui/ui/charts";
import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipeDailyData, recipeHalfYearData } from "../recipe-data";
import { BAR_MARGIN } from "./shared";

/* -------------------------------------------------------------------------- */
/* Spotlight beam (line / area)                                               */
/* -------------------------------------------------------------------------- */

function SpotlightIndicator({
  seriesKey,
  color = "var(--chart-1)",
  width = 28,
}: {
  /** Series to follow. Not named `dataKey`, or the chart would treat this layer as a series. */
  seriesKey: string;
  color?: string;
  width?: number;
}) {
  const { tooltipData, innerHeight } = useChart();
  const id = useId().replace(/:/g, "");
  const x = useSpring(0, { stiffness: 380, damping: 36 });
  const top = useSpring(innerHeight, { stiffness: 380, damping: 36 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });
  const height = useTransform(top, (value) => Math.max(0, innerHeight - value));
  const visible = useRef(false);

  const targetX = tooltipData?.x;
  const targetY = tooltipData?.yPositions[seriesKey];

  useEffect(() => {
    if (targetX === undefined || targetY === undefined) {
      visible.current = false;
      opacity.set(0);
      return;
    }
    if (visible.current) {
      x.set(targetX);
      top.set(targetY);
    } else {
      // Appear in place instead of sliding in from the left edge.
      x.jump(targetX);
      top.jump(targetY);
    }
    visible.current = true;
    opacity.set(1);
  }, [targetX, targetY, x, top, opacity]);

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor={color} stopOpacity={0.32} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.rect
        fill={`url(#${id}-beam)`}
        height={height}
        rx={4}
        style={{ x, y: top, opacity }}
        width={width}
        x={-width / 2}
      />
    </g>
  );
}

function SpotlightLine() {
  return (
    <LineChart data={recipeDailyData}>
      <Grid horizontal />
      <SpotlightIndicator seriesKey="visitors" />
      <Line dataKey="visitors" strokeWidth={2} />
      <XAxis />
      <ChartTooltip showCrosshair={false} />
    </LineChart>
  );
}

function SpotlightArea() {
  return (
    <AreaChart data={recipeDailyData}>
      <Grid horizontal />
      <SpotlightIndicator seriesKey="visitors" />
      <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
      <XAxis />
      <ChartTooltip showCrosshair={false} />
    </AreaChart>
  );
}

/* -------------------------------------------------------------------------- */
/* Rising line (bar)                                                          */
/* -------------------------------------------------------------------------- */

function RisingLine({
  x,
  width,
  top,
  bottom,
  active,
}: {
  x: number;
  width: number;
  top: number;
  bottom: number;
  active: boolean;
}) {
  const y = useSpring(bottom, { stiffness: 300, damping: 30 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    y.set(active ? top : bottom);
    opacity.set(active ? 1 : 0);
  }, [active, top, bottom, y, opacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{ y, opacity }}
      width={width}
      x={x}
    />
  );
}

function RisingBarIndicator({ dataKeys }: { dataKeys: string[] }) {
  const {
    data,
    barScale,
    bandWidth,
    barXAccessor,
    yScale,
    innerHeight,
    hoveredBarIndex,
  } = useChart();

  if (!(barScale && bandWidth && barXAccessor)) {
    return null;
  }

  const width = bandWidth / dataKeys.length;

  return (
    <g pointerEvents="none">
      {data.flatMap((row, index) =>
        dataKeys.map((key, keyIndex) => (
          <RisingLine
            active={hoveredBarIndex === index}
            bottom={innerHeight}
            key={`${barXAccessor(row)}-${key}`}
            top={yScale(Number(row[key]) || 0) ?? innerHeight}
            width={width}
            x={(barScale(barXAccessor(row)) ?? 0) + keyIndex * width}
          />
        ))
      )}
    </g>
  );
}

// Render above the bars and outside the reveal clip.
RisingBarIndicator.__isPostOverlay = true;

function RisingBar() {
  const uid = useId().replace(/:/g, "");
  return (
    <BarChart
      barGap={0}
      data={recipeHalfYearData}
      margin={BAR_MARGIN}
      xDataKey="month"
    >
      <LinearGradient
        from="var(--chart-1)"
        id={`${uid}-fill`}
        to="var(--chart-1)"
        toOpacity={0.08}
      />
      <PatternLines
        height={6}
        id={`${uid}-hatch`}
        orientation={["diagonal"]}
        stroke="var(--chart-3)"
        strokeWidth={1.5}
        width={6}
      />
      <Grid horizontal />
      <Bar
        dataKey="revenue"
        fill={`url(#${uid}-fill)`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-1)"
      />
      <Bar
        dataKey="previous"
        fill={`url(#${uid}-hatch)`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-3)"
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} showDots={false} />
      <RisingBarIndicator dataKeys={["revenue", "previous"]} />
    </BarChart>
  );
}

/* -------------------------------------------------------------------------- */
/* Recipe                                                                     */
/* -------------------------------------------------------------------------- */

const SPOTLIGHT_SOURCE = `function SpotlightIndicator({
  seriesKey,
  color = "var(--chart-1)",
  width = 28,
}: {
  /** Series to follow. Not named \`dataKey\`, or the chart would treat this layer as a series. */
  seriesKey: string;
  color?: string;
  width?: number;
}) {
  const { tooltipData, innerHeight } = useChart();
  const id = useId().replace(/:/g, "");
  const x = useSpring(0, { stiffness: 380, damping: 36 });
  const top = useSpring(innerHeight, { stiffness: 380, damping: 36 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });
  const height = useTransform(top, (value) => Math.max(0, innerHeight - value));
  const visible = useRef(false);

  const targetX = tooltipData?.x;
  const targetY = tooltipData?.yPositions[seriesKey];

  useEffect(() => {
    if (targetX === undefined || targetY === undefined) {
      visible.current = false;
      opacity.set(0);
      return;
    }
    if (visible.current) {
      x.set(targetX);
      top.set(targetY);
    } else {
      // Appear in place instead of sliding in from the left edge.
      x.jump(targetX);
      top.jump(targetY);
    }
    visible.current = true;
    opacity.set(1);
  }, [targetX, targetY, x, top, opacity]);

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={\`\${id}-beam\`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor={color} stopOpacity={0.32} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.rect
        fill={\`url(#\${id}-beam)\`}
        height={height}
        rx={4}
        style={{ x, y: top, opacity }}
        width={width}
        x={-width / 2}
      />
    </g>
  );
}`;

const SPOTLIGHT_IMPORTS = `import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { useChart } from "@/components/charts/chart-context";`;

const SPOTLIGHT_STEPS = (root: string, series: string) => [
  "Add the `SpotlightIndicator` component from the reference (next to the chart, or in `components/charts/spotlight-indicator.tsx`). It reads `tooltipData` (`x` and `yPositions[seriesKey]`) and `innerHeight` from `useChart()` and springs a soft, rounded column from the hovered point down to the baseline, filled with a vertical gradient of the series colour (32% → 0% opacity).",
  `Render \`<SpotlightIndicator seriesKey="…" />\` inside \`<${root}>\` **before** the ${series} so the beam paints behind it. Pass the headline series' \`dataKey\` as \`seriesKey\` (don't name the prop \`dataKey\` — the chart would mistake the layer for a series), and its colour as \`color\` if it isn't \`var(--chart-1)\`.`,
  "Set `showCrosshair={false}` on `<ChartTooltip />` — the beam replaces the crosshair line; keep the tooltip dots and panel.",
  "`motion` is already installed with the charts; don't add global mouse listeners — everything comes from `useChart()`.",
];

const RISING_SOURCE = `function RisingLine({
  x,
  width,
  top,
  bottom,
  active,
}: {
  x: number;
  width: number;
  top: number;
  bottom: number;
  active: boolean;
}) {
  const y = useSpring(bottom, { stiffness: 300, damping: 30 });
  const opacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    y.set(active ? top : bottom);
    opacity.set(active ? 1 : 0);
  }, [active, top, bottom, y, opacity]);

  return (
    <motion.rect
      fill="var(--chart-indicator-color)"
      height={2}
      style={{ y, opacity }}
      width={width}
      x={x}
    />
  );
}

function RisingBarIndicator({ dataKeys }: { dataKeys: string[] }) {
  const {
    data,
    barScale,
    bandWidth,
    barXAccessor,
    yScale,
    innerHeight,
    hoveredBarIndex,
  } = useChart();

  if (!(barScale && bandWidth && barXAccessor)) {
    return null;
  }

  const width = bandWidth / dataKeys.length;

  return (
    <g pointerEvents="none">
      {data.flatMap((row, index) =>
        dataKeys.map((key, keyIndex) => (
          <RisingLine
            active={hoveredBarIndex === index}
            bottom={innerHeight}
            key={\`\${barXAccessor(row)}-\${key}\`}
            top={yScale(Number(row[key]) || 0) ?? innerHeight}
            width={width}
            x={(barScale(barXAccessor(row)) ?? 0) + keyIndex * width}
          />
        ))
      )}
    </g>
  );
}

// Render above the bars and outside the reveal clip.
RisingBarIndicator.__isPostOverlay = true;`;

export const customIndicators: Recipe = {
  id: "custom-indicators",
  title: "Custom indicators",
  category: "hover-annotations",
  description:
    "Replace the stock crosshair with your own spring-animated hover indicator built on useChart.",
  look: "the default crosshair line is gone. On line and area charts a soft, rounded spotlight column (the series colour, fading from ~32% opacity at the hovered point to transparent at the baseline) springs between points behind the series. On bar charts the bars sit flush (no gaps) — the headline series in a `--chart-1` gradient that fades almost to transparent, comparisons in a diagonal hatch — and a 2px line rises from the baseline to the top of each bar in the hovered group. Both indicators are custom SVG layers driven by `useChart()` and `motion` springs.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineChart",
      Preview: SpotlightLine,
      install: ["line-chart"],
      steps: SPOTLIGHT_STEPS("LineChart", "`<Line>`s"),
      code: `"use client";

${SPOTLIGHT_IMPORTS}
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${SPOTLIGHT_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <SpotlightIndicator seriesKey="visitors" />
      <Line dataKey="visitors" strokeWidth={2} />
      <XAxis />
      <ChartTooltip showCrosshair={false} />
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
      install: ["area-chart"],
      steps: SPOTLIGHT_STEPS("AreaChart", "`<Area>`s"),
      code: `"use client";

${SPOTLIGHT_IMPORTS}
import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";

${SPOTLIGHT_SOURCE}

export function VisitorsChart({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <SpotlightIndicator seriesKey="visitors" />
      <Area dataKey="visitors" fillOpacity={0.25} strokeWidth={2} />
      <XAxis />
      <ChartTooltip showCrosshair={false} />
    </AreaChart>
  );
}
`,
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: RisingBar,
      install: ["bar-chart", "patterns"],
      steps: [
        "Only convert vertical, non-stacked `BarChart`s.",
        'Set `barGap={0}` on `<BarChart>` and `groupGap={0}` + `lineCap="butt"` on every `<Bar>` so each group is one flush block.',
        'Fill the headline `<Bar>` with a vertical `<LinearGradient>` (from `@/components/charts/gradients`) from its colour to the same colour at `toOpacity={0.08}` (`fill="url(#…)"`, `stroke` = the solid colour); fill comparison bars with a `<PatternLines orientation={["diagonal"]} strokeWidth={1.5} />` hatch in their colour. Make each `id` unique with `useId()`.',
        "Add the `RisingLine` + `RisingBarIndicator` components from the reference. `RisingBarIndicator` reads `data`, `barScale`, `bandWidth`, `barXAccessor`, `yScale`, `innerHeight` and `hoveredBarIndex` from `useChart()` and, for the hovered group, springs a 2px `var(--chart-indicator-color)` line from the baseline to each bar's top. Keep the `RisingBarIndicator.__isPostOverlay = true` flag so it draws above the bars.",
        "Render `<RisingBarIndicator dataKeys={[…every Bar dataKey, in order]} />` after `<ChartTooltip showCrosshair={false} showDots={false} />`.",
      ],
      code: `"use client";

import { motion, useSpring } from "motion/react";
import { useEffect, useId } from "react";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { useChart } from "@/components/charts/chart-context";
import { LinearGradient } from "@/components/charts/gradients";
import { Grid } from "@/components/charts/grid";
import { PatternLines } from "@/components/charts/patterns";
import { ChartTooltip } from "@/components/charts/tooltip";

${RISING_SOURCE}

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; previous: number }[];
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <BarChart
      barGap={0}
      data={data}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      xDataKey="month"
    >
      <LinearGradient
        from="var(--chart-1)"
        id={\`\${uid}-fill\`}
        to="var(--chart-1)"
        toOpacity={0.08}
      />
      <PatternLines
        height={6}
        id={\`\${uid}-hatch\`}
        orientation={["diagonal"]}
        stroke="var(--chart-3)"
        strokeWidth={1.5}
        width={6}
      />
      <Grid horizontal />
      <Bar
        dataKey="revenue"
        fill={\`url(#\${uid}-fill)\`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-1)"
      />
      <Bar
        dataKey="previous"
        fill={\`url(#\${uid}-hatch)\`}
        groupGap={0}
        lineCap="butt"
        stroke="var(--chart-3)"
      />
      <BarXAxis />
      <ChartTooltip showCrosshair={false} showDots={false} />
      <RisingBarIndicator dataKeys={["revenue", "previous"]} />
    </BarChart>
  );
}
`,
    },
  ],
};
