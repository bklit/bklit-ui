"use client";

import {
  BarChart,
  BarLollipop,
  ChartTooltip,
  Grid,
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendValue,
  YAxis,
} from "@bklitui/ui/charts";
import { useState } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipeServiceBudgetData } from "../recipe-data";

/* -------------------------------------------------------------------------- */
/* Live preview                                                                */
/* -------------------------------------------------------------------------- */

interface Tier {
  label: string;
  color: string;
  /** Rows with `value >= min` belong to this tier (checked top-down). */
  min: number;
}

const EXHAUSTED: Tier = {
  label: "Exhausted",
  color: "var(--color-red-400)",
  min: Number.NEGATIVE_INFINITY,
};

const TIERS: Tier[] = [
  { label: "Healthy", color: "var(--color-emerald-400)", min: 30 },
  { label: "At Risk", color: "var(--color-amber-400)", min: 0 },
  EXHAUSTED,
];

function tierFor(value: number): Tier {
  return TIERS.find((tier) => value >= tier.min) ?? EXHAUSTED;
}

function formatChange(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/** One tooltip row: the tier colour + name, and the signed change. */
function tooltipRows(point: Record<string, unknown>) {
  const value = Number(point.change ?? 0);
  const tier = tierFor(value);
  return [{ color: tier.color, label: tier.label, value: formatChange(value) }];
}

/** Legend items: one per tier, valued by how many rows fall in it. */
function tierLegendItems(values: number[]) {
  return TIERS.map((tier) => ({
    label: tier.label,
    color: tier.color,
    value: values.filter((value) => tierFor(value) === tier).length,
  }));
}

const rows = recipeServiceBudgetData.map((row) => ({
  ...row,
  color: tierFor(row.change).color,
}));
const legendItems = tierLegendItems(rows.map((row) => row.change));

const MARGIN = { top: 20, right: 12, bottom: 16, left: 48 };

function LollipopPreview() {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const activeTier = hoveredTier === null ? undefined : TIERS[hoveredTier];
  return (
    <div className="flex flex-col gap-3">
      <BarChart data={rows} margin={MARGIN} xDataKey="service">
        <Grid horizontal strokeDasharray="3,4" />
        <BarLollipop
          colorKey="color"
          dataKey="change"
          dimRow={
            activeTier
              ? (row) => tierFor(Number(row.change)) !== activeTier
              : undefined
          }
        />
        <ChartTooltip
          rows={tooltipRows}
          showCrosshair={false}
          showDots={false}
        />
        <YAxis formatValue={(value) => `${value > 0 ? "+" : ""}${value}%`} />
      </BarChart>
      <Legend
        className="flex-row flex-wrap gap-x-1 gap-y-1"
        hoveredIndex={hoveredTier}
        items={legendItems}
        onHoverChange={setHoveredTier}
      >
        <LegendItemComponent className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel className="text-legend-muted-foreground text-sm" />
          <LegendValue className="font-medium text-legend-foreground text-sm tabular-nums" />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reference code                                                              */
/* -------------------------------------------------------------------------- */

const CODE = `"use client";

import { useState } from "react";
import { BarChart } from "@/components/charts/bar-chart";
import { BarLollipop } from "@/components/charts/bar-lollipop";
import { Grid } from "@/components/charts/grid";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendValue,
} from "@/components/charts/legend";
import { ChartTooltip } from "@/components/charts/tooltip";
import { YAxis } from "@/components/charts/y-axis";

interface Tier {
  label: string;
  color: string;
  /** Rows with \`value >= min\` belong to this tier (checked top-down). */
  min: number;
}

const EXHAUSTED: Tier = {
  label: "Exhausted",
  color: "var(--color-red-400)",
  min: Number.NEGATIVE_INFINITY,
};

const TIERS: Tier[] = [
  { label: "Healthy", color: "var(--color-emerald-400)", min: 30 },
  { label: "At Risk", color: "var(--color-amber-400)", min: 0 },
  EXHAUSTED,
];

function tierFor(value: number): Tier {
  return TIERS.find((tier) => value >= tier.min) ?? EXHAUSTED;
}

function formatChange(value: number) {
  return \`\${value > 0 ? "+" : ""}\${value.toFixed(1)}%\`;
}

function tooltipRows(point: Record<string, unknown>) {
  const value = Number(point.change ?? 0);
  const tier = tierFor(value);
  return [{ color: tier.color, label: tier.label, value: formatChange(value) }];
}

export function ErrorBudgetChart({
  data,
}: {
  data: { service: string; change: number }[];
}) {
  // Sort ascending so the lollipops ramp from worst to best, and colour by tier.
  const rows = [...data]
    .sort((a, b) => a.change - b.change)
    .map((row) => ({ ...row, color: tierFor(row.change).color }));
  const legendItems = TIERS.map((tier) => ({
    label: tier.label,
    color: tier.color,
    value: rows.filter((row) => tierFor(row.change) === tier).length,
  }));
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const activeTier = hoveredTier === null ? undefined : TIERS[hoveredTier];

  return (
    <div className="flex flex-col gap-3">
      <BarChart
        data={rows}
        margin={{ top: 20, right: 12, bottom: 16, left: 48 }}
        xDataKey="service"
      >
        <Grid horizontal strokeDasharray="3,4" />
        <BarLollipop
          colorKey="color"
          dataKey="change"
          dimRow={
            activeTier
              ? (row) => tierFor(Number(row.change)) !== activeTier
              : undefined
          }
        />
        <ChartTooltip rows={tooltipRows} showCrosshair={false} showDots={false} />
        <YAxis formatValue={(value) => \`\${value > 0 ? "+" : ""}\${value}%\`} />
      </BarChart>
      <Legend
        className="flex-row flex-wrap gap-x-1 gap-y-1"
        hoveredIndex={hoveredTier}
        items={legendItems}
        onHoverChange={setHoveredTier}
      >
        <LegendItem className="flex items-center gap-1.5">
          <LegendMarker />
          <LegendLabel className="text-legend-muted-foreground text-sm" />
          <LegendValue className="font-medium text-legend-foreground text-sm tabular-nums" />
        </LegendItem>
      </Legend>
    </div>
  );
}
`;

export const lollipopPnl: Recipe = {
  id: "lollipop-pnl",
  title: "Lollipop profit / loss",
  category: "color-shape",
  description:
    "Bars become dashed hairline stems with a status-coloured dot on the end — a diverging ranking around zero.",
  look: "a diverging lollipop chart: rows sorted ascending so they ramp from the worst negative on the left to the best positive on the right. Each bar is a thin dashed muted stem from the solid zero baseline to a solid round dot, coloured by tier (red below zero, amber 0–30%, green above). Dashed horizontal grid lines and signed % y-axis labels. Hovering a column shows a soft full-height rounded pill behind it, enlarges the dot with a halo, darkens its stem and opens the standard chart tooltip titled with the row name, showing the tier colour, tier name and signed value. The standard legend underneath lists each tier with its count; hovering a tier fades the other tiers' lollipops.",
  charts: [
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarChart",
      Preview: LollipopPreview,
      install: ["bar-chart", "y-axis", "legend"],
      steps: [
        "Sort the rows ascending by the value so the chart reads as a ramp. Values should be signed (negative = loss / over budget).",
        "Add the `TIERS` table and `tierFor` helper from the reference (adjust thresholds and colours to the project's status model, e.g. Healthy / At Risk / Exhausted), and map each row to include `color: tierFor(row.change).color`.",
        'Replace the `<Bar>` with `<BarLollipop dataKey="change" colorKey="color" />` (from `@/components/charts/bar-lollipop`, part of the `bar-chart` item). It draws the dashed stems, dots, zero baseline and hover pill, and includes negatives in the y-domain. Remove any `<BarXAxis>`.',
        "Render `<ChartTooltip rows={tooltipRows} showCrosshair={false} showDots={false} />` — the hover pill replaces the crosshair and the enlarged dot replaces the tooltip dot. `tooltipRows` returns one row with the tier colour, tier name and signed value.",
        'Use `margin={{ top: 20, right: 12, bottom: 16, left: 48 }}`, `<Grid horizontal strokeDasharray="3,4" />` and a `<YAxis>` whose `formatValue` prints signed percentages (`+50%`, `0%`, `-50%`).',
        'Under the chart render `<Legend items={legendItems} className="flex-row flex-wrap gap-x-1 gap-y-1">` (from `@/components/charts/legend`) with one item per tier valued by its count, and `<LegendItem className="flex items-center gap-1.5"><LegendMarker /><LegendLabel className="text-legend-muted-foreground text-sm" /><LegendValue className="font-medium text-legend-foreground text-sm tabular-nums" /></LegendItem>`.',
        "Keep the legend's `hoveredIndex` in state and pass `dimRow={(row) => tierFor(row.change) !== hoveredTier}` to `<BarLollipop>` while a tier is hovered, so the other tiers fade.",
      ],
      code: CODE,
    },
  ],
};
