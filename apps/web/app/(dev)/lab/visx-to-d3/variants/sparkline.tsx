"use client";

import {
  AreaSparkline,
  BarSparkline,
  LineSparkline,
  type SparklineCrosshair,
  useSparklineHover,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  eachSparklineSvg,
  type KpiPoint,
  latency,
  orders,
  profitLoss,
  recipeDailyData,
  recipeKpiData,
  recipeMonthlyData,
  revenue,
  type SparkPoint,
  seats,
  sparkData,
  tableRows,
  visitors,
} from "./sparkline-data";
import type { LabVariant } from "./types";

const GALLERY = "sparkline-gallery-examples.tsx";
const DOCS = "docs/sparkline-demo.tsx";
const KPI_RECIPE = "recipes/definitions/kpi-sparklines.tsx";
const QUIET_RECIPE = "recipes/definitions/quiet-sparkline.tsx";
const PROPS = "content/docs/components/sparkline.mdx props table";

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function percentChange(data: SparkPoint[], value: number) {
  const first = data[0]?.value ?? 0;
  return first === 0 ? 0 : ((value - first) / first) * 100;
}

function ChangeBadge({ change }: { change: number }) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        change >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      )}
    >
      {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

/** Fixed-width stand-in for the sources' `max-w-*` + `sm:` grid shells. */
function Shell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full px-2 py-4", className)}>{children}</div>;
}

function KpiCard({
  label,
  data,
  children,
}: {
  label: string;
  data: SparkPoint[];
  children: (
    props: ReturnType<typeof useSparklineHover<SparkPoint>>
  ) => ReactNode;
}) {
  const hover = useSparklineHover<SparkPoint>();
  const shown = hover.datum ?? data.at(-1);
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs/5">
      <div className="flex items-baseline justify-between gap-2 text-muted-foreground text-xs">
        <span>{label}</span>
        <span className="tabular-nums">{shown?.day}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl tabular-nums">
          {shown ? compact.format(shown.value) : "—"}
        </span>
        {shown ? (
          <ChangeBadge change={percentChange(data, shown.value)} />
        ) : null}
      </div>
      {children(hover)}
    </div>
  );
}

function KpiCards() {
  return (
    <Shell className="grid grid-cols-3 gap-3">
      <KpiCard data={revenue} label="Revenue">
        {(hover) => (
          <AreaSparkline
            data={revenue}
            dataKey="value"
            height={40}
            {...hover.sparklineProps}
          />
        )}
      </KpiCard>
      <KpiCard data={visitors} label="Visitors">
        {(hover) => (
          <LineSparkline
            color="var(--chart-2)"
            data={visitors}
            dataKey="value"
            endDot
            height={40}
            {...hover.sparklineProps}
          />
        )}
      </KpiCard>
      <KpiCard data={orders} label="Orders">
        {(hover) => (
          <BarSparkline
            color="var(--chart-3)"
            data={orders}
            dataKey="value"
            height={40}
            {...hover.sparklineProps}
          />
        )}
      </KpiCard>
    </Shell>
  );
}

function NegativeBars() {
  const hover = useSparklineHover<SparkPoint>();
  const shown = hover.datum ?? profitLoss.at(-1);
  const value = shown?.value ?? 0;
  return (
    <Shell className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">Daily P&amp;L</span>
        <span
          className={cn(
            "font-medium tabular-nums",
            value >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          {shown?.day} · {value >= 0 ? "+" : "−"}${Math.abs(value)}
        </span>
      </div>
      <BarSparkline
        data={profitLoss}
        dataKey="value"
        height={56}
        {...hover.sparklineProps}
      />
    </Shell>
  );
}

const crosshairs: Exclude<SparklineCrosshair, false>[] = [
  "dashed",
  "solid",
  "gradient",
];

const hoverFeels = [
  { label: "Spring (default)", props: {} },
  {
    label: "Snappy — stiffness 600, damping 45",
    props: { springConfig: { stiffness: 600, damping: 45 } },
  },
  { label: "No spring", props: { hoverTransition: false } },
] as const;

function NoSpring() {
  const hover = useSparklineHover<SparkPoint>();
  const shown = hover.datum ?? visitors.at(-1);
  return (
    <Shell className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-xs">Visitors</span>
        <span className="font-semibold text-lg tabular-nums">
          {shown?.value.toLocaleString("en")}
        </span>
      </div>
      <AreaSparkline
        color="var(--chart-2)"
        data={visitors}
        dataKey="value"
        height={48}
        hoverTransition={false}
        {...hover.sparklineProps}
      />
      <BarSparkline
        color="var(--chart-2)"
        data={visitors}
        dataKey="value"
        height={32}
        hoverTransition={false}
        {...hover.sparklineProps}
      />
    </Shell>
  );
}

function Synced() {
  const hover = useSparklineHover<SparkPoint>();
  const series = [
    { label: "Revenue", data: revenue, color: "var(--chart-1)" },
    { label: "Visitors", data: visitors, color: "var(--chart-2)" },
    {
      label: "Orders",
      data: sparkData(3, 24, 120, 2),
      color: "var(--chart-3)",
    },
  ];
  return (
    <Shell className="flex flex-col gap-3">
      {series.map((s) => (
        <div
          className="grid grid-cols-[5rem_1fr_4rem] items-center gap-3"
          key={s.label}
        >
          <span className="text-muted-foreground text-xs">{s.label}</span>
          <LineSparkline
            color={s.color}
            data={s.data}
            dataKey="value"
            height={28}
            {...hover.sparklineProps}
          />
          <span className="text-right text-sm tabular-nums">
            {compact.format(
              s.data[hover.index ?? s.data.length - 1]?.value ?? 0
            )}
          </span>
        </div>
      ))}
    </Shell>
  );
}

function Table() {
  return (
    <Shell>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground text-xs">
            <th className="pb-2 font-medium">Plan</th>
            <th className="pb-2 font-medium">Last 16 weeks</th>
            <th className="pb-2 text-right font-medium">MRR</th>
            <th className="pb-2 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row) => {
            const last = row.data.at(-1)?.value ?? 0;
            const change = percentChange(row.data, last);
            return (
              <tr className="border-b last:border-0" key={row.name}>
                <td className="py-2 pr-3">{row.name}</td>
                <td className="py-2 pr-3">
                  <LineSparkline
                    color={
                      change >= 0
                        ? "var(--chart-positive)"
                        : "var(--chart-negative)"
                    }
                    data={row.data}
                    dataKey="value"
                    height={24}
                    strokeWidth={1.5}
                    width={120}
                  />
                </td>
                <td className="py-2 text-right tabular-nums">
                  ${compact.format(last)}
                </td>
                <td className="py-2 text-right">
                  <ChangeBadge change={change} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Shell>
  );
}

const gridVariants = [AreaSparkline, LineSparkline, BarSparkline] as const;

// KPI recipe: synced rows of cards reading one hover index.
const recipeCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const recipeCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const recipeDayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

interface KpiMetric {
  label: string;
  data: KpiPoint[];
  color?: string;
  format?: (value: number) => string;
}

const metrics: KpiMetric[] = [
  { label: "Visitors", data: recipeKpiData.visitors, color: "var(--chart-1)" },
  { label: "Signups", data: recipeKpiData.signups, color: "var(--chart-2)" },
  {
    label: "Revenue",
    data: recipeKpiData.revenue,
    color: "var(--chart-3)",
    format: recipeCurrency.format,
  },
];

function recipeChange(data: KpiPoint[], index: number): number | null {
  const current = data[index]?.value;
  const previous = data[index - 1]?.value;
  if (current === undefined || !previous) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function RecipeKpiCard({
  metric,
  index,
  children,
}: {
  metric: KpiMetric;
  index: number | null;
  children: ReactNode;
}) {
  const i = index ?? metric.data.length - 1;
  const point = metric.data[i];
  const change = recipeChange(metric.data, i);
  const format = metric.format ?? recipeCompact.format;
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
        <span>{metric.label}</span>
        <span className="tabular-nums">
          {point ? recipeDayFormat.format(point.date) : null}
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

function RecipeSyncedRow({ kind }: { kind: "area" | "bar" }) {
  const hover = useSparklineHover<KpiPoint>();
  const Sparkline = kind === "area" ? AreaSparkline : BarSparkline;
  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((metric) => (
        <RecipeKpiCard index={hover.index} key={metric.label} metric={metric}>
          <Sparkline
            color={metric.color}
            data={metric.data}
            dataKey="value"
            height={40}
            {...hover.sparklineProps}
          />
        </RecipeKpiCard>
      ))}
    </div>
  );
}

const KPI_FRAME = { width: 720, height: 200 } as const;

export const SPARKLINE_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "kpi-cards",
    label: "KPI cards",
    source: `${GALLERY}: Sparkline - KPI cards (makeSparklineHero; also ${DOCS}: SparklineDemo)`,
    exercises:
      "area (gradient) + line (endDot) + bar in cards, each with useSparklineHover; fixed 3-column grid",
    ...KPI_FRAME,
    render: () => <KpiCards />,
  },
  {
    kind: "single",
    id: "line",
    label: "Line",
    source: `${GALLERY}: Sparkline - Line`,
    exercises: "default LineSparkline (monotone, dashed crosshair, highlight)",
    render: () => (
      <Shell>
        <LineSparkline data={revenue} dataKey="value" height={56} />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "area-gradient",
    label: "Area gradient",
    source: `${GALLERY}: Sparkline - Area gradient`,
    exercises: 'AreaSparkline fill="gradient", downward trend',
    render: () => (
      <Shell>
        <AreaSparkline
          data={visitors}
          dataKey="value"
          fill="gradient"
          height={56}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "area-solid",
    label: "Area solid",
    source: `${GALLERY}: Sparkline - Area solid`,
    exercises: 'fill="solid", fillOpacity 0.2, custom color',
    render: () => (
      <Shell>
        <AreaSparkline
          color="var(--chart-2)"
          data={visitors}
          dataKey="value"
          fill="solid"
          fillOpacity={0.2}
          height={56}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "bar",
    label: "Bar",
    source: `${GALLERY}: Sparkline - Bar`,
    exercises: "BarSparkline barGap 2, barRadius 2, hover dims other bars",
    render: () => (
      <Shell>
        <BarSparkline
          barGap={2}
          barRadius={2}
          color="var(--chart-3)"
          data={orders}
          dataKey="value"
          height={56}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "negative-bars",
    label: "Negative bars",
    source: `${GALLERY}: Sparkline - Negative bars`,
    exercises: "bars across zero (negative values), hover readout via hook",
    render: () => <NegativeBars />,
  },
  {
    kind: "single",
    id: "crosshairs",
    label: "Crosshair styles",
    source: `${GALLERY}: Sparkline - Crosshair styles (also ${DOCS}: SparklineCrosshairDemo)`,
    exercises:
      'crosshair "dashed" / "solid" / "gradient" — one hover step on each',
    width: 720,
    hoverTargets: eachSparklineSvg([0.25, 0.5, 0.75]),
    render: () => (
      <Shell className="grid grid-cols-3 gap-6">
        {crosshairs.map((crosshair) => (
          <div className="flex flex-col gap-2" key={crosshair}>
            <span className="text-muted-foreground text-xs">{crosshair}</span>
            <LineSparkline
              crosshair={crosshair}
              data={revenue}
              dataKey="value"
              height={48}
            />
          </div>
        ))}
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "hover-feel",
    label: "Hover feel",
    source: `${GALLERY}: Sparkline - Hover feel (also ${DOCS}: SparklineHoverFeelDemo, whose extra no-spring bar is covered by no-spring)`,
    exercises:
      "default spring vs springConfig 600/45 vs hoverTransition false — one hover step on each",
    width: 720,
    hoverTargets: eachSparklineSvg([0.3, 0.55, 0.8]),
    render: () => (
      <Shell className="grid grid-cols-3 gap-6">
        {hoverFeels.map((feel) => (
          <div className="flex flex-col gap-2" key={feel.label}>
            <span className="text-muted-foreground text-xs">{feel.label}</span>
            <LineSparkline
              data={revenue}
              dataKey="value"
              height={48}
              {...feel.props}
            />
          </div>
        ))}
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "no-spring",
    label: "No spring",
    source: `${GALLERY}: Sparkline - No spring`,
    exercises:
      "hoverTransition false on area + bar sharing one useSparklineHover",
    height: 180,
    render: () => <NoSpring />,
  },
  {
    kind: "single",
    id: "end-dot",
    label: "End dot",
    source: `${GALLERY}: Sparkline - End dot`,
    exercises: 'curve="natural", endDot, interactive={false} (no hover)',
    hover: false,
    render: () => (
      <Shell className="flex items-center gap-4">
        <div className="flex shrink-0 flex-col">
          <span className="text-muted-foreground text-xs">p95 latency</span>
          <span className="font-semibold text-lg tabular-nums">
            {latency.at(-1)?.value ?? 0}ms
          </span>
        </div>
        <LineSparkline
          className="min-w-0 flex-1"
          color="var(--chart-4)"
          curve="natural"
          data={latency}
          dataKey="value"
          endDot
          height={40}
          interactive={false}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "step",
    label: "Step",
    source: `${GALLERY}: Sparkline - Step`,
    exercises: 'AreaSparkline curve="step", endDot, yDomain [0]',
    render: () => (
      <Shell>
        <AreaSparkline
          color="var(--chart-5)"
          curve="step"
          data={seats}
          dataKey="value"
          endDot
          height={56}
          yDomain={[0]}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "synced",
    label: "Synced hover",
    source: `${GALLERY}: Sparkline - Synced hover (also ${DOCS}: SparklineSyncedDemo)`,
    exercises:
      "three lines sharing one useSparklineHover; hovering the first moves all crosshairs",
    width: 480,
    render: () => <Synced />,
  },
  {
    kind: "single",
    id: "table",
    label: "Table",
    source: `${GALLERY}: Sparkline - Table`,
    exercises:
      "fixed width 120 (no ResizeObserver), height 24, strokeWidth 1.5, positive/negative colors",
    width: 520,
    height: 220,
    render: () => <Table />,
  },
  {
    kind: "single",
    id: "dense-grid",
    label: "Dense grid",
    source: `${GALLERY}: Sparkline - Dense grid (also ${DOCS}: SparklineGridDemo with 200)`,
    exercises:
      "64 mixed area/line/bar sparklines sharing one ResizeObserver, fixed 8 columns",
    width: 720,
    height: 260,
    render: () => (
      <Shell className="grid grid-cols-8 gap-x-4 gap-y-3">
        {Array.from({ length: 64 }, (_, i) => {
          const data = sparkData(i, 20, 100, (i % 7) - 3);
          const Component = gridVariants[i % 3] ?? LineSparkline;
          return (
            <Component
              color={`var(--chart-${(i % 5) + 1})`}
              data={data}
              dataKey="value"
              height={24}
              key={`spark-${i}`}
            />
          );
        })}
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "kpi-recipe-area-synced",
    label: "KPI recipe: synced areas",
    source: `${KPI_RECIPE}: Area (KpiArea / SyncedRow)`,
    exercises:
      "Date-keyed data, three areas synced through one hook (hover on the first)",
    ...KPI_FRAME,
    render: () => (
      <Shell>
        <RecipeSyncedRow kind="area" />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "kpi-recipe-bar-synced",
    label: "KPI recipe: synced bars",
    source: `${KPI_RECIPE}: Bar (KpiBar / SyncedRow); Line (independent cards) is covered by kpi-cards`,
    exercises: "three bar sparklines synced through one hook",
    ...KPI_FRAME,
    render: () => (
      <Shell>
        <RecipeSyncedRow kind="bar" />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "quiet",
    label: "Quiet sparkline (recipe)",
    source: `${QUIET_RECIPE}: Line / Area / Bar previews`,
    exercises:
      "height 72: line strokeWidth 2, area fillOpacity 0.2, bar barGap 6 — one hover step on each",
    width: 576,
    height: 280,
    hoverTargets: eachSparklineSvg([0.3, 0.5, 0.7]),
    render: () => (
      <Shell className="flex flex-col gap-4">
        <LineSparkline
          data={recipeDailyData}
          dataKey="visitors"
          height={72}
          strokeWidth={2}
        />
        <AreaSparkline
          data={recipeDailyData}
          dataKey="visitors"
          fillOpacity={0.2}
          height={72}
        />
        <BarSparkline
          barGap={6}
          barRadius={2}
          data={recipeMonthlyData}
          dataKey="revenue"
          height={72}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "line-linear-negative",
    label: "Linear, negative, no highlight",
    source: PROPS,
    exercises:
      'line across zero, curve="linear", showHighlight false, solid crosshair, padding 8',
    render: () => (
      <Shell>
        <LineSparkline
          crosshair="solid"
          curve="linear"
          data={profitLoss}
          dataKey="value"
          height={56}
          padding={8}
          showHighlight={false}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "area-negative-gradient-crosshair",
    label: "Area across zero",
    source: PROPS,
    exercises:
      "AreaSparkline with negative values, gradient crosshair, no hover dot, inactiveOpacity 0.2, asymmetric padding",
    render: () => (
      <Shell>
        <AreaSparkline
          color="var(--chart-4)"
          crosshair="gradient"
          data={profitLoss}
          dataKey="value"
          dot={false}
          height={56}
          inactiveOpacity={0.2}
          padding={{ top: 8, bottom: 2, left: 6, right: 6 }}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "bar-flat",
    label: "Bar flat, no gap",
    source: PROPS,
    exercises:
      "barGap 0, barRadius 0, inactiveOpacity 0.15, crosshair false, short animationDuration",
    render: () => (
      <Shell>
        <BarSparkline
          animationDuration={300}
          barGap={0}
          barRadius={0}
          crosshair={false}
          data={revenue}
          dataKey="value"
          height={56}
          inactiveOpacity={0.15}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "no-animate",
    label: "No enter animation",
    source: PROPS,
    exercises: "animate={false} on line, area and bar (static first paint)",
    height: 200,
    hoverTargets: eachSparklineSvg([0.3, 0.5, 0.7]),
    render: () => (
      <Shell className="flex flex-col gap-3">
        <LineSparkline
          animate={false}
          data={revenue}
          dataKey="value"
          height={40}
        />
        <AreaSparkline
          animate={false}
          data={visitors}
          dataKey="value"
          height={40}
        />
        <BarSparkline
          animate={false}
          data={orders}
          dataKey="value"
          height={40}
        />
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "controlled-hover",
    label: "Controlled hoverIndex",
    source: PROPS,
    exercises:
      "hoverIndex fixed (6 / 12 / 9) without a pointer: crosshair, dot, highlight and bar dimming at rest",
    height: 200,
    hover: false,
    render: () => (
      <Shell className="flex flex-col gap-3">
        <LineSparkline
          data={revenue}
          dataKey="value"
          height={40}
          hoverIndex={6}
        />
        <AreaSparkline
          data={visitors}
          dataKey="value"
          height={40}
          hoverIndex={12}
        />
        <BarSparkline
          data={orders}
          dataKey="value"
          height={40}
          hoverIndex={9}
        />
      </Shell>
    ),
  },
];
