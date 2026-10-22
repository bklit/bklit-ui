"use client";

import {
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
  PatternLines,
  PieCenter,
  PieChart,
  PieSlice,
  Ring,
  RingCenter,
  RingChart,
} from "@bklitui/ui/charts";
import { useId, useState } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipePieData, recipeRingData } from "../recipe-data";
import { RADIAL_SHELL_CLASS } from "./shared";

const ORIENTATIONS = [
  "diagonal",
  "horizontal",
  "vertical",
  "diagonalRightToLeft",
] as const;

/* -------------------------------------------------------------------------- */
/* Patterned slices                                                           */
/* -------------------------------------------------------------------------- */

function PatternedPie({ donut }: { donut: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className={RADIAL_SHELL_CLASS}>
      <PieChart
        cornerRadius={4}
        data={recipePieData}
        innerRadius={donut ? 60 : 0}
        padAngle={0.03}
      >
        {recipePieData.map((item, index) => (
          <PatternLines
            height={6}
            id={`${uid}-p${index}`}
            key={`pattern-${item.label}`}
            orientation={[
              ORIENTATIONS[index % ORIENTATIONS.length] ?? "diagonal",
            ]}
            stroke={item.color}
            strokeWidth={1.25}
            width={6}
          />
        ))}
        {recipePieData.map((item, index) => (
          <PieSlice
            fill={`url(#${uid}-p${index})`}
            index={index}
            key={item.label}
          />
        ))}
        {donut ? <PieCenter defaultLabel="Visits" /> : null}
      </PieChart>
    </div>
  );
}

function PatternedPieFull() {
  return <PatternedPie donut={false} />;
}

function PatternedDonut() {
  return <PatternedPie donut />;
}

const PATTERN_SOURCE = (donut: boolean) => `"use client";

import { useId } from "react";
import {
  PatternLines,
  type PatternOrientationType,
} from "@/components/charts/patterns";
${donut ? 'import { PieCenter } from "@/components/charts/pie-center";\n' : ""}import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";

const orientations: PatternOrientationType[] = [
  "diagonal",
  "horizontal",
  "vertical",
  "diagonalRightToLeft",
];

export function TrafficSources({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const uid = useId().replace(/:/g, "");
  // \`color\` keeps the hover glow${donut ? " and the centre label" : ""} in step with each pattern.
  const slices = data.map((item, index) => ({
    ...item,
    color: \`var(--chart-\${(index % 5) + 1})\`,
  }));

  return (
    <div className="mx-auto aspect-square w-full max-w-[280px]">
      <PieChart
        cornerRadius={4}
        data={slices}${donut ? "\n        innerRadius={60}" : ""}
        padAngle={0.03}
      >
        {slices.map((item, index) => (
          <PatternLines
            height={6}
            id={\`\${uid}-p\${index}\`}
            key={\`pattern-\${item.label}\`}
            orientation={[orientations[index % orientations.length] ?? "diagonal"]}
            stroke={item.color}
            strokeWidth={1.25}
            width={6}
          />
        ))}
        {slices.map((item, index) => (
          <PieSlice
            fill={\`url(#\${uid}-p\${index})\`}
            index={index}
            key={item.label}
          />
        ))}${donut ? '\n        <PieCenter defaultLabel="Visits" />' : ""}
      </PieChart>
    </div>
  );
}
`;

const PATTERN_STEPS = (donut: boolean) => [
  "Give every datum a `color` of `var(--chart-N)` (cycling 1–5) if it doesn't have one — the hover glow and centre label read it.",
  "Inside `<PieChart>`, render one `<PatternLines>` (from `@/components/charts/patterns`) per slice **before** the slices: `width={6} height={6} strokeWidth={1.25}`, `stroke` = that slice's `color`, cycling orientations `diagonal`, `horizontal`, `vertical`, `diagonalRightToLeft`, and an `id` made unique with `useId()`.",
  'Set `fill="url(#<that id>)"` on each `<PieSlice>`.',
  "On `<PieChart>` add `padAngle={0.03}` and `cornerRadius={4}` so the hatched slices separate cleanly.",
  donut
    ? 'Keep (or add) `innerRadius={60}` and a `<PieCenter defaultLabel="…" />` after the slices for the total.'
    : "Keep it a full pie (no `innerRadius`) — use the Donut version for a hollow centre.",
];

export const patternedSlices: Recipe = {
  id: "patterned-slices",
  title: "Patterned slices",
  category: "pie-ring",
  description:
    "Hatch every slice in its own direction — readable without relying on colour alone.",
  look: "each slice is filled with a fine line hatch in its palette colour, and every slice uses a different hatch direction (diagonal, horizontal, vertical, reverse diagonal) so categories stay distinguishable in greyscale or for colour-blind readers. Slices are separated by a small gap with softly rounded corners; the donut version shows the total in the centre, switching to the hovered slice.",
  charts: [
    {
      id: "pie",
      label: "Pie",
      rootComponent: "PieChart",
      Preview: PatternedPieFull,
      install: ["pie-chart", "patterns"],
      steps: PATTERN_STEPS(false),
      code: PATTERN_SOURCE(false),
    },
    {
      id: "donut",
      label: "Donut",
      rootComponent: "PieChart",
      Preview: PatternedDonut,
      install: ["pie-chart", "patterns"],
      steps: PATTERN_STEPS(true),
      code: PATTERN_SOURCE(true),
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Linked legend                                                              */
/* -------------------------------------------------------------------------- */

function LegendDonut() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-6 sm:gap-10">
      <div className="aspect-square w-36 shrink-0 sm:w-56">
        <PieChart
          data={recipePieData}
          hoveredIndex={hoveredIndex}
          innerRadius={50}
          onHoverChange={setHoveredIndex}
        >
          {recipePieData.map((item, index) => (
            <PieSlice hoverEffect="grow" index={index} key={item.label} />
          ))}
          <PieCenter defaultLabel="Visits" />
        </PieChart>
      </div>
      <Legend
        className="min-w-0 flex-1"
        hoveredIndex={hoveredIndex}
        items={recipePieData}
        onHoverChange={setHoveredIndex}
      >
        <LegendItemComponent className="flex items-center gap-2">
          <LegendMarker />
          <LegendLabel className="flex-1 text-xs" />
          <LegendValue className="text-xs" showPercentage />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

function LegendRing() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-6 sm:gap-10">
      <div className="aspect-square w-36 shrink-0 sm:w-56">
        <RingChart
          data={recipeRingData}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
        >
          {recipeRingData.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      </div>
      <Legend
        className="min-w-0 flex-1"
        hoveredIndex={hoveredIndex}
        items={recipeRingData}
        onHoverChange={setHoveredIndex}
      >
        <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
          <LegendValue className="text-xs" showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

const LEGEND_LAYOUT_STEP =
  'Lay the chart and legend out side by side: a flex row (`flex items-center gap-6 sm:gap-10`) with the chart in a fixed square (`aspect-square w-36 sm:w-56 shrink-0`) and `<Legend className="min-w-0 flex-1">` next to it.';

export const linkedLegend: Recipe = {
  id: "linked-legend",
  title: "Linked legend",
  category: "pie-ring",
  description:
    "A legend beside the chart that shares its hover state — highlight from either side.",
  look: "the chart sits beside a compact legend that lists every category with its colour marker, label and share. Hover is linked both ways: hovering a slice or ring highlights its legend row and hovering a legend row highlights the slice/ring, with the centre label switching to the hovered value. Donut slices grow outward on hover; ring rows also show a thin progress bar.",
  charts: [
    {
      id: "donut",
      label: "Donut",
      rootComponent: "PieChart",
      Preview: LegendDonut,
      install: ["pie-chart", "legend"],
      steps: [
        "Give every datum a `color` (`var(--chart-N)`) — the legend marker paints `item.color`.",
        "Lift hover into the parent: `const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)`, and pass `hoveredIndex` / `onHoverChange={setHoveredIndex}` to both `<PieChart>` and `<Legend>`.",
        'Make it a donut (`innerRadius={50}`), set `hoverEffect="grow"` on every `<PieSlice>`, and add `<PieCenter defaultLabel="…" />`.',
        LEGEND_LAYOUT_STEP,
        'Legend rows (from `@/components/charts/legend`): `<Legend items={data} …><LegendItem className="flex items-center gap-2"><LegendMarker /><LegendLabel className="flex-1 text-xs" /><LegendValue className="text-xs" showPercentage /></LegendItem></Legend>`.',
      ],
      code: `"use client";

import { useState } from "react";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendValue,
} from "@/components/charts/legend";
import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";

export function TrafficSources({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-6 sm:gap-10">
      <div className="aspect-square w-36 shrink-0 sm:w-56">
        <PieChart
          data={data}
          hoveredIndex={hoveredIndex}
          innerRadius={50}
          onHoverChange={setHoveredIndex}
        >
          {data.map((item, index) => (
            <PieSlice hoverEffect="grow" index={index} key={item.label} />
          ))}
          <PieCenter defaultLabel="Visits" />
        </PieChart>
      </div>
      <Legend
        className="min-w-0 flex-1"
        hoveredIndex={hoveredIndex}
        items={data}
        onHoverChange={setHoveredIndex}
      >
        <LegendItem className="flex items-center gap-2">
          <LegendMarker />
          <LegendLabel className="flex-1 text-xs" />
          <LegendValue className="text-xs" showPercentage />
        </LegendItem>
      </Legend>
    </div>
  );
}
`,
    },
    {
      id: "ring",
      label: "Ring",
      rootComponent: "RingChart",
      Preview: LegendRing,
      install: ["ring-chart", "legend"],
      steps: [
        "Give every datum a `color` (`var(--chart-N)`) and a `maxValue`.",
        "Lift hover into the parent: `const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)`, and pass `hoveredIndex` / `onHoverChange={setHoveredIndex}` to both `<RingChart>` and `<Legend>`.",
        'Keep one `<Ring index={i} />` per datum and add `<RingCenter defaultLabel="…" />`.',
        LEGEND_LAYOUT_STEP,
        'Legend rows (from `@/components/charts/legend`): `<LegendItem className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5"><LegendMarker /><LegendLabel className="text-xs" /><LegendValue className="text-xs" showPercentage /><div className="col-span-full"><LegendProgress /></div></LegendItem>` — the progress bar mirrors each ring.',
      ],
      code: `"use client";

import { useState } from "react";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
} from "@/components/charts/legend";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";

export function ChannelGoals({
  data,
}: {
  data: { label: string; value: number; maxValue: number; color: string }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-6 sm:gap-10">
      <div className="aspect-square w-36 shrink-0 sm:w-56">
        <RingChart
          data={data}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
        >
          {data.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter defaultLabel="Sessions" />
        </RingChart>
      </div>
      <Legend
        className="min-w-0 flex-1"
        hoveredIndex={hoveredIndex}
        items={data}
        onHoverChange={setHoveredIndex}
      >
        <LegendItem className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5">
          <LegendMarker />
          <LegendLabel className="text-xs" />
          <LegendValue className="text-xs" showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItem>
      </Legend>
    </div>
  );
}
`,
    },
  ],
};
