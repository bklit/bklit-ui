"use client";

import {
  PieChart as D3PieChart,
  PieSlice as D3PieSlice,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendValue,
  PatternLines,
  PieCenter,
  type PieData,
  RadialGradient,
} from "@bklitui/ui/charts";
import { LegacyPieChart, LegacyPieSlice } from "@bklitui/ui/charts/legacy-visx";
import { useId, useState } from "react";
import { chartExampleRadialShellClassName } from "@/components/charts/chart-example-preview";
import { RADIAL_SHELL_CLASS } from "@/components/recipes/definitions/shared";
import { recipePieData } from "@/components/recipes/recipe-data";
import type { LabSide, LabVariant } from "./types";

const PARTS = {
  before: { PieChart: LegacyPieChart, PieSlice: LegacyPieSlice },
  after: { PieChart: D3PieChart, PieSlice: D3PieSlice },
} as const;

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/pie-chart-demo.tsx";
const RECIPES = "recipes/definitions/pie-recipes.tsx";

// Data copied verbatim from the sources.
const pieData: PieData[] = [
  { label: "Chrome", value: 275, color: "var(--chart-1)" },
  { label: "Safari", value: 200, color: "var(--chart-2)" },
  { label: "Firefox", value: 187, color: "var(--chart-3)" },
  { label: "Edge", value: 173, color: "var(--chart-4)" },
  { label: "Other", value: 90, color: "var(--chart-5)" },
];

const piePatternData: PieData[] = [
  { label: "Category A", value: 35 },
  { label: "Category B", value: 25 },
  { label: "Category C", value: 20 },
  { label: "Category D", value: 20 },
];

const pieGradientData: PieData[] = [
  { label: "Segment A", value: 40 },
  { label: "Segment B", value: 30 },
  { label: "Segment C", value: 30 },
];

const salesData: PieData[] = [
  { label: "Electronics", value: 4250, color: "#0ea5e9" },
  { label: "Clothing", value: 3120, color: "#a855f7" },
  { label: "Food", value: 2100, color: "#f59e0b" },
  { label: "Home", value: 1580, color: "#10b981" },
  { label: "Other", value: 1050, color: "#ef4444" },
];

const RECIPE_ORIENTATIONS = [
  "diagonal",
  "horizontal",
  "vertical",
  "diagonalRightToLeft",
] as const;

function legendItems(data: PieData[]) {
  return data.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.color || "",
  }));
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className={chartExampleRadialShellClassName}>{children}</div>;
}

/** Four line patterns shared by "Pie Chart - Patterns" / "Donut Chart - Patterns". */
function ExamplePatterns({ prefix }: { prefix: string }) {
  return (
    <>
      <PatternLines
        height={6}
        id={`${prefix}-p1`}
        orientation={["diagonal"]}
        stroke="var(--chart-1)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id={`${prefix}-p2`}
        orientation={["horizontal"]}
        stroke="var(--chart-2)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={6}
        id={`${prefix}-p3`}
        orientation={["vertical"]}
        stroke="var(--chart-3)"
        strokeWidth={1}
        width={6}
      />
      <PatternLines
        height={8}
        id={`${prefix}-p4`}
        orientation={["diagonalRightToLeft"]}
        stroke="var(--chart-4)"
        strokeWidth={1}
        width={8}
      />
    </>
  );
}

function PieDonutInteractive({ side }: { side: LabSide }) {
  const { PieChart, PieSlice } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <Shell>
      <PieChart
        data={pieData}
        hoveredIndex={hoveredIndex}
        innerRadius={60}
        onHoverChange={setHoveredIndex}
      >
        {pieData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter defaultLabel="Total" />
      </PieChart>
    </Shell>
  );
}

function PieWithLegend({ side }: { side: LabSide }) {
  const { PieChart, PieSlice } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <Shell>
      <div className="flex flex-col items-center gap-4">
        <PieChart
          data={pieData}
          hoveredIndex={hoveredIndex}
          innerRadius={55}
          onHoverChange={setHoveredIndex}
        >
          {pieData.map((item, index) => (
            <PieSlice index={index} key={item.label} />
          ))}
          <PieCenter defaultLabel="Browsers" />
        </PieChart>
        <Legend
          className="flex-row flex-wrap justify-center gap-x-4 gap-y-1"
          hoveredIndex={hoveredIndex}
          items={legendItems(pieData)}
          onHoverChange={setHoveredIndex}
        >
          <LegendItemComponent className="flex items-center gap-1.5">
            <LegendMarker />
            <LegendLabel className="text-xs" />
          </LegendItemComponent>
        </Legend>
      </div>
    </Shell>
  );
}

function PieCustomCenter({ side }: { side: LabSide }) {
  const { PieChart, PieSlice } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = pieData.reduce((s, d) => s + d.value, 0);
  return (
    <Shell>
      <PieChart
        data={pieData}
        hoveredIndex={hoveredIndex}
        innerRadius={65}
        onHoverChange={setHoveredIndex}
      >
        {pieData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
        <PieCenter>
          {({ value, label, isHovered, data: d }) => (
            <div className="text-center">
              <div
                className="font-bold text-xl"
                style={{ color: isHovered ? d.color : undefined }}
              >
                {value.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs">{label}</div>
              {isHovered && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {((d.value / total) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </PieCenter>
      </PieChart>
    </Shell>
  );
}

function PieChartDemo({ side }: { side: LabSide }) {
  const { PieChart, PieSlice } = PARTS[side];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-8 lg:w-auto lg:flex-row lg:gap-12">
      <PieChart
        data={salesData}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        size={280}
      >
        {salesData.map((item, index) => (
          <PieSlice index={index} key={item.label} />
        ))}
      </PieChart>
      <Legend
        hoveredIndex={hoveredIndex}
        items={legendItems(salesData)}
        onHoverChange={setHoveredIndex}
        title="Sales by Category"
      >
        <LegendItemComponent className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue showPercentage />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

function PatternedPie({ side, donut }: { side: LabSide; donut: boolean }) {
  const { PieChart, PieSlice } = PARTS[side];
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
              RECIPE_ORIENTATIONS[index % RECIPE_ORIENTATIONS.length] ??
                "diagonal",
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

function LegendDonut({ side }: { side: LabSide }) {
  const { PieChart, PieSlice } = PARTS[side];
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

export const PIE_VARIANTS: LabVariant[] = [
  {
    id: "default",
    label: "Pie",
    source: `${EXAMPLES}: Pie Chart (also ${DOCS}: PieChartBasicDemo)`,
    exercises: "Solid pie, parent-sized, default translate hover",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <Shell>
          <PieChart data={pieData}>
            {pieData.map((item, index) => (
              <PieSlice index={index} key={item.label} />
            ))}
          </PieChart>
        </Shell>
      );
    },
  },
  {
    id: "donut",
    label: "Donut",
    source: `${EXAMPLES}: Pie Chart - Donut (also ${DOCS}: PieChartDonutDemo)`,
    exercises: "innerRadius 60, controlled hoveredIndex, PieCenter",
    render: (side) => (
      <Shell>
        <PieDonutInteractive side={side} />
      </Shell>
    ),
  },
  {
    id: "legend",
    label: "Legend",
    source: `${EXAMPLES}: Pie Chart - Legend`,
    exercises: "Donut 55 + linked Legend (shared hover state)",
    height: 400,
    render: (side) => <PieWithLegend side={side} />,
  },
  {
    id: "patterns",
    label: "Patterns",
    source: `${EXAMPLES}: Pie Chart - Patterns (also ${DOCS}: PieChartPatternsDemo)`,
    exercises: "PatternLines fills (4 orientations), no slice colors",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <Shell>
          <PieChart data={piePatternData}>
            <ExamplePatterns prefix="pie-ex" />
            <PieSlice fill="url(#pie-ex-p1)" index={0} />
            <PieSlice fill="url(#pie-ex-p2)" index={1} />
            <PieSlice fill="url(#pie-ex-p3)" index={2} />
            <PieSlice fill="url(#pie-ex-p4)" index={3} />
          </PieChart>
        </Shell>
      );
    },
  },
  {
    id: "gradients",
    label: "Gradients",
    source: `${EXAMPLES}: Pie Chart - Gradients (also ${DOCS}: PieChartGradientsDemo)`,
    exercises: "RadialGradient fills",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <Shell>
          <PieChart data={pieGradientData}>
            <RadialGradient
              from="#0ea5e9"
              fromOffset="0%"
              id="pie-ex-g1"
              to="#06b6d4"
              toOffset="100%"
            />
            <RadialGradient
              from="#a855f7"
              fromOffset="0%"
              id="pie-ex-g2"
              to="#ec4899"
              toOffset="100%"
            />
            <RadialGradient
              from="#f59e0b"
              fromOffset="0%"
              id="pie-ex-g3"
              to="#ef4444"
              toOffset="100%"
            />
            <PieSlice fill="url(#pie-ex-g1)" index={0} />
            <PieSlice fill="url(#pie-ex-g2)" index={1} />
            <PieSlice fill="url(#pie-ex-g3)" index={2} />
          </PieChart>
        </Shell>
      );
    },
  },
  {
    id: "grow-hover",
    label: "Grow hover",
    source: `${EXAMPLES}: Pie Chart - Grow Hover`,
    exercises: 'hoverEffect="grow" on a solid pie',
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      // Gallery wraps PieGrowHover (itself a shell) in a second shell.
      return (
        <Shell>
          <Shell>
            <PieChart data={pieData}>
              {pieData.map((item, index) => (
                <PieSlice hoverEffect="grow" index={index} key={item.label} />
              ))}
            </PieChart>
          </Shell>
        </Shell>
      );
    },
  },
  {
    id: "custom-center",
    label: "Custom center",
    source: `${EXAMPLES}: Pie Chart - Custom Center (also ${DOCS}: PieChartCustomCenterDemo)`,
    exercises: "innerRadius 65, PieCenter render prop",
    render: (side) => (
      <Shell>
        <PieCustomCenter side={side} />
      </Shell>
    ),
  },
  {
    id: "donut-patterns",
    label: "Donut patterns",
    source: `${EXAMPLES}: Donut Chart - Patterns`,
    exercises: "Pattern fills on a donut + PieCenter",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <Shell>
          <PieChart data={piePatternData} innerRadius={55}>
            <ExamplePatterns prefix="donut-ex" />
            <PieSlice fill="url(#donut-ex-p1)" index={0} />
            <PieSlice fill="url(#donut-ex-p2)" index={1} />
            <PieSlice fill="url(#donut-ex-p3)" index={2} />
            <PieSlice fill="url(#donut-ex-p4)" index={3} />
            <PieCenter defaultLabel="Total" />
          </PieChart>
        </Shell>
      );
    },
  },
  {
    id: "donut-grow-hover",
    label: "Donut grow",
    source: `${EXAMPLES}: Donut Chart - Grow Hover`,
    exercises: 'hoverEffect="grow" on a donut',
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <Shell>
          <PieChart data={pieData} innerRadius={55}>
            {pieData.map((item, index) => (
              <PieSlice hoverEffect="grow" index={index} key={item.label} />
            ))}
            <PieCenter defaultLabel="Browsers" />
          </PieChart>
        </Shell>
      );
    },
  },
  {
    id: "docs-hero",
    label: "Docs hero",
    source: `${DOCS}: PieChartDemo (pie-chart.mdx)`,
    exercises: "Fixed size={280}, controlled hover + Legend with values",
    width: 680,
    height: 360,
    render: (side) => <PieChartDemo side={side} />,
  },
  {
    id: "recipe-patterned-pie",
    label: "Recipe: patterned pie",
    source: `${RECIPES}: Patterned slices / Pie`,
    exercises: "padAngle 0.03 + cornerRadius 4 + useId pattern fills",
    render: (side) => <PatternedPie donut={false} side={side} />,
  },
  {
    id: "recipe-patterned-donut",
    label: "Recipe: patterned donut",
    source: `${RECIPES}: Patterned slices / Donut`,
    exercises: "padAngle + cornerRadius + innerRadius 60 + PieCenter",
    render: (side) => <PatternedPie donut side={side} />,
  },
  {
    id: "recipe-linked-legend",
    label: "Recipe: linked legend",
    source: `${RECIPES}: Linked legend / Donut`,
    exercises: "Grow donut (innerRadius 50) in a w-56 box + Legend",
    width: 560,
    height: 320,
    render: (side) => <LegendDonut side={side} />,
  },
  {
    id: "hover-none",
    label: 'hoverEffect "none"',
    source: `pie-chart.mdx PieSlice props (${DOCS}: PieChartHoverEffectDemo "None")`,
    exercises: 'hoverEffect="none": hover only fades siblings',
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <PieChart data={salesData} size={280}>
          {salesData.map((item, index) => (
            <PieSlice hoverEffect="none" index={index} key={item.label} />
          ))}
        </PieChart>
      );
    },
  },
  {
    id: "glow-offset",
    label: "Glow + offset",
    source: "pie-chart.mdx PieSlice props: showGlow, hoverOffset",
    exercises: "showGlow + hoverOffset={18} translate distance",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <PieChart data={salesData} innerRadius={60} size={260}>
          {salesData.map((item, index) => (
            <PieSlice
              hoverOffset={18}
              index={index}
              key={item.label}
              showGlow
            />
          ))}
        </PieChart>
      );
    },
  },
  {
    id: "half-arc",
    label: "Half arc",
    source: "pie-chart.mdx PieChart props: startAngle, endAngle",
    exercises: "startAngle -π/2 … endAngle π/2 (semicircle donut)",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <PieChart
          data={pieData}
          endAngle={Math.PI / 2}
          innerRadius={70}
          size={280}
          startAngle={-Math.PI / 2}
        >
          {pieData.map((item, index) => (
            <PieSlice index={index} key={item.label} />
          ))}
          <PieCenter defaultLabel="Browsers" />
        </PieChart>
      );
    },
  },
  {
    id: "no-animate",
    label: "animate={false}",
    source: "pie-chart.mdx PieSlice props: animate",
    exercises: "Static slices (no enter tween), hover still on",
    render: (side) => {
      const { PieChart, PieSlice } = PARTS[side];
      return (
        <PieChart data={pieData} innerRadius={55} size={260}>
          {pieData.map((item, index) => (
            <PieSlice animate={false} index={index} key={item.label} />
          ))}
        </PieChart>
      );
    },
  },
];
