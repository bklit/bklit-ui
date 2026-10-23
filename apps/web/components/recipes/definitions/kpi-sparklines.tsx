"use client";

import {
  AreaSparkline,
  BarSparkline,
  LineSparkline,
  useSparklineHover,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";
import type { Recipe } from "@/lib/recipes/types";
import { recipeKpiData } from "../recipe-data";

interface KpiPoint {
  date: Date;
  value: number;
}

interface KpiMetric {
  label: string;
  data: KpiPoint[];
  color?: string;
  format?: (value: number) => string;
}

type SparklineHoverProps = ReturnType<
  typeof useSparklineHover<KpiPoint>
>["sparklineProps"];

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const metrics: KpiMetric[] = [
  { label: "Visitors", data: recipeKpiData.visitors, color: "var(--chart-1)" },
  { label: "Signups", data: recipeKpiData.signups, color: "var(--chart-2)" },
  {
    label: "Revenue",
    data: recipeKpiData.revenue,
    color: "var(--chart-3)",
    format: currency.format,
  },
];

/** Change from the previous point, in %. `null` for the first point. */
function percentChange(data: KpiPoint[], index: number): number | null {
  const current = data[index]?.value;
  const previous = data[index - 1]?.value;
  if (current === undefined || !previous) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function KpiCard({
  metric,
  index,
  children,
}: {
  metric: KpiMetric;
  /** Hovered index, or `null` to show the latest point. */
  index: number | null;
  children: ReactNode;
}) {
  const i = index ?? metric.data.length - 1;
  const point = metric.data[i];
  const change = percentChange(metric.data, i);
  const format = metric.format ?? compact.format;

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
        <span>{metric.label}</span>
        <span className="tabular-nums">
          {point ? day.format(point.date) : null}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl tabular-nums tracking-tight">
          {point ? format(point.value) : "—"}
        </span>
        {change === null ? null : (
          <span
            className={
              change >= 0
                ? "text-emerald-600 text-xs tabular-nums dark:text-emerald-400"
                : "text-rose-600 text-xs tabular-nums dark:text-rose-400"
            }
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

type RenderSparkline = (
  metric: KpiMetric,
  hoverProps: SparklineHoverProps
) => ReactNode;

/** Preview-only: two cards on narrow screens so the row fits the panel. */
const GRID_CLASS =
  "grid gap-3 sm:grid-cols-3 [&>*:nth-child(3)]:hidden sm:[&>*:nth-child(3)]:flex";

function HoverKpiCard({
  metric,
  render,
}: {
  metric: KpiMetric;
  render: RenderSparkline;
}) {
  const hover = useSparklineHover<KpiPoint>();
  return (
    <KpiCard index={hover.index} metric={metric}>
      {render(metric, hover.sparklineProps)}
    </KpiCard>
  );
}

function IndependentRow({ render }: { render: RenderSparkline }) {
  return (
    <div className={GRID_CLASS}>
      {metrics.map((metric) => (
        <HoverKpiCard key={metric.label} metric={metric} render={render} />
      ))}
    </div>
  );
}

function SyncedRow({ render }: { render: RenderSparkline }) {
  const hover = useSparklineHover<KpiPoint>();
  return (
    <div className={GRID_CLASS}>
      {metrics.map((metric) => (
        <KpiCard index={hover.index} key={metric.label} metric={metric}>
          {render(metric, hover.sparklineProps)}
        </KpiCard>
      ))}
    </div>
  );
}

const renderLine: RenderSparkline = (metric, hoverProps) => (
  <LineSparkline
    color={metric.color}
    data={metric.data}
    dataKey="value"
    endDot
    height={40}
    {...hoverProps}
  />
);

const renderArea: RenderSparkline = (metric, hoverProps) => (
  <AreaSparkline
    color={metric.color}
    data={metric.data}
    dataKey="value"
    height={40}
    {...hoverProps}
  />
);

const renderBar: RenderSparkline = (metric, hoverProps) => (
  <BarSparkline
    color={metric.color}
    data={metric.data}
    dataKey="value"
    height={40}
    {...hoverProps}
  />
);

function KpiLine() {
  return <IndependentRow render={renderLine} />;
}

function KpiArea() {
  return <SyncedRow render={renderArea} />;
}

function KpiBar() {
  return <SyncedRow render={renderBar} />;
}

/* -------------------------------------------------------------------------- */
/* Reference code                                                             */
/* -------------------------------------------------------------------------- */

const KPI_CARD_SOURCE = `export interface KpiPoint {
  date: Date;
  value: number;
}

export interface KpiMetric {
  label: string;
  data: KpiPoint[];
  color?: string;
  format?: (value: number) => string;
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** Change from the previous point, in %. \`null\` for the first point. */
function percentChange(data: KpiPoint[], index: number): number | null {
  const current = data[index]?.value;
  const previous = data[index - 1]?.value;
  if (current === undefined || !previous) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function KpiCard({
  metric,
  index,
  children,
}: {
  metric: KpiMetric;
  /** Hovered index, or \`null\` to show the latest point. */
  index: number | null;
  children: ReactNode;
}) {
  const i = index ?? metric.data.length - 1;
  const point = metric.data[i];
  const change = percentChange(metric.data, i);
  const format = metric.format ?? compact.format;

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
        <span>{metric.label}</span>
        <span className="tabular-nums">
          {point ? day.format(point.date) : null}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl tabular-nums tracking-tight">
          {point ? format(point.value) : "—"}
        </span>
        {change === null ? null : (
          <span
            className={
              change >= 0
                ? "text-emerald-600 text-xs tabular-nums dark:text-emerald-400"
                : "text-rose-600 text-xs tabular-nums dark:text-rose-400"
            }
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}`;

function sparklineJsx(component: string, extraProps: string[]): string {
  const props = [
    "color={metric.color}",
    "data={metric.data}",
    'dataKey="value"',
    ...extraProps,
    "height={40}",
    "{...hover.sparklineProps}",
  ];
  return [`<${component}`, ...props.map((prop) => `  ${prop}`), "/>"].join(
    "\n"
  );
}

function indent(source: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return source
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

function sparklineImport(component: string): string {
  const oneLine = `import { ${component}, useSparklineHover } from "@/components/charts/sparkline";`;
  return oneLine.length <= 80
    ? oneLine
    : `import {\n  ${component},\n  useSparklineHover,\n} from "@/components/charts/sparkline";`;
}

function independentCode(component: string, extraProps: string[]): string {
  return `"use client";

import type { ReactNode } from "react";
${sparklineImport(component)}

${KPI_CARD_SOURCE}

/** Each card owns its hover state, so only the hovered card changes. */
function HoverKpiCard({ metric }: { metric: KpiMetric }) {
  const hover = useSparklineHover<KpiPoint>();
  return (
    <KpiCard index={hover.index} metric={metric}>
${indent(sparklineJsx(component, extraProps), 6)}
    </KpiCard>
  );
}

export function KpiSparklines({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <HoverKpiCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
`;
}

function syncedCode(component: string, extraProps: string[]): string {
  return `"use client";

import type { ReactNode } from "react";
${sparklineImport(component)}

${KPI_CARD_SOURCE}

/**
 * One hover state for the whole row: hovering any card moves every
 * crosshair and swaps every value. All series must share the same dates.
 */
export function KpiSparklines({ metrics }: { metrics: KpiMetric[] }) {
  const hover = useSparklineHover<KpiPoint>();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <KpiCard index={hover.index} key={metric.label} metric={metric}>
${indent(sparklineJsx(component, extraProps), 10)}
        </KpiCard>
      ))}
    </div>
  );
}
`;
}

const CARD_STEPS = [
  "Build a `KpiCard` like the reference: a muted label and date on top, a large `tabular-nums` value with a coloured percent change next to it, and the sparkline (`height={40}`) underneath. Map existing stat cards onto it rather than duplicating them.",
  "`KpiCard` takes `index: number | null` — the hovered point, or `null` for the latest. Read the value and date from `data[index ?? data.length - 1]` and compute the change against the previous point, so the whole card reads from one index.",
];

const INDEPENDENT_STEP =
  "Give each card its own `const hover = useSparklineHover<KpiPoint>()` (in a small wrapper component) and spread `hover.sparklineProps` onto its sparkline; pass `hover.index` to `KpiCard`. There is no tooltip — the card's own value is the readout.";

const SYNCED_STEP =
  "Call `useSparklineHover<KpiPoint>()` once in the row and spread the same `hover.sparklineProps` onto every card's sparkline, passing `hover.index` to each `KpiCard`. Hovering any card moves every crosshair and swaps every value. All series must share the same dates (same length and order).";

export const kpiSparklines: Recipe = {
  id: "kpi-sparklines",
  title: "KPI sparklines",
  category: "hover-annotations",
  description:
    "Stat cards whose big number follows the cursor — hover a sparkline to read any day, or sync a whole row.",
  look: "a row of compact KPI cards, each with a small label and date, a large tabular value with a green/red percent change, and a 40px sparkline underneath. Hovering a sparkline moves a dashed crosshair and dot and swaps the card's value, date and change to the hovered point; leaving snaps back to the latest point. No tooltips.",
  charts: [
    {
      id: "line",
      label: "Line",
      rootComponent: "LineSparkline",
      Preview: KpiLine,
      install: ["sparkline"],
      steps: [
        ...CARD_STEPS,
        "Use `<LineSparkline endDot />` so the latest point is marked while nothing is hovered.",
        INDEPENDENT_STEP,
      ],
      code: independentCode("LineSparkline", ["endDot"]),
    },
    {
      id: "area",
      label: "Area",
      rootComponent: "AreaSparkline",
      Preview: KpiArea,
      install: ["sparkline"],
      steps: [
        ...CARD_STEPS,
        "Use `<AreaSparkline />` with its default gradient fill, coloured per metric (`var(--chart-1)`, `var(--chart-2)`, …).",
        SYNCED_STEP,
      ],
      code: syncedCode("AreaSparkline", []),
    },
    {
      id: "bar",
      label: "Bar",
      rootComponent: "BarSparkline",
      Preview: KpiBar,
      install: ["sparkline"],
      steps: [
        ...CARD_STEPS,
        "Use `<BarSparkline />` — hovering dims the other bars so the active day stands out.",
        SYNCED_STEP,
      ],
      code: syncedCode("BarSparkline", []),
    },
  ],
};
