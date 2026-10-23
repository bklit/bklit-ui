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

export interface SparklineGalleryPoint {
  day: string;
  value: number;
}

/** Deterministic wavy series so SSR and client render the same paths. */
export function sparklineGalleryData(
  seed: number,
  length = 24,
  base = 100,
  trend = 1.5
): SparklineGalleryPoint[] {
  return Array.from({ length }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.round(
      base +
        trend * i +
        Math.sin(i * 0.7 + seed) * base * 0.12 +
        Math.cos(i * 1.9 + seed * 2) * base * 0.06
    ),
  }));
}

const revenue = sparklineGalleryData(1, 24, 4200, 40);
const visitors = sparklineGalleryData(2, 24, 1800, -12);
const orders = sparklineGalleryData(3, 18, 120, 2);
const latency = sparklineGalleryData(5, 32, 240, 0);

/** Daily profit / loss — swings across zero. */
const profitLoss: SparklineGalleryPoint[] = Array.from(
  { length: 20 },
  (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.round(Math.sin(i * 0.9) * 420 + Math.cos(i * 2.3) * 180 + 40),
  })
);

/** Plan tier changes — step curve reads as discrete levels. */
const seats: SparklineGalleryPoint[] = [
  5, 5, 5, 8, 8, 8, 8, 12, 12, 10, 10, 15, 15, 15, 20, 20, 18, 25,
].map((value, i) => ({ day: `Week ${i + 1}`, value }));

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function percentChange(data: SparklineGalleryPoint[], value: number) {
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

function GalleryShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl px-2 py-6", className)}>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  data,
  children,
}: {
  label: string;
  data: SparklineGalleryPoint[];
  children: (
    props: ReturnType<typeof useSparklineHover<SparklineGalleryPoint>>
  ) => ReactNode;
}) {
  const hover = useSparklineHover<SparklineGalleryPoint>();
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

export function SparklineKpiCardsExample() {
  return (
    <GalleryShell className="grid gap-3 sm:grid-cols-3">
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
    </GalleryShell>
  );
}

export function SparklineLineExample() {
  return (
    <GalleryShell className="max-w-md">
      <LineSparkline data={revenue} dataKey="value" height={56} />
    </GalleryShell>
  );
}

export function SparklineAreaExample({ fill }: { fill: "gradient" | "solid" }) {
  return (
    <GalleryShell className="max-w-md">
      <AreaSparkline
        color={fill === "solid" ? "var(--chart-2)" : undefined}
        data={visitors}
        dataKey="value"
        fill={fill}
        fillOpacity={fill === "solid" ? 0.2 : undefined}
        height={56}
      />
    </GalleryShell>
  );
}

export function SparklineBarExample() {
  return (
    <GalleryShell className="max-w-md">
      <BarSparkline
        barGap={2}
        barRadius={2}
        color="var(--chart-3)"
        data={orders}
        dataKey="value"
        height={56}
      />
    </GalleryShell>
  );
}

export function SparklineNegativeBarsExample() {
  const hover = useSparklineHover<SparklineGalleryPoint>();
  const shown = hover.datum ?? profitLoss.at(-1);
  const value = shown?.value ?? 0;
  return (
    <GalleryShell className="flex max-w-md flex-col gap-2">
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
    </GalleryShell>
  );
}

const crosshairs: Exclude<SparklineCrosshair, false>[] = [
  "dashed",
  "solid",
  "gradient",
];

export function SparklineCrosshairsExample() {
  return (
    <GalleryShell className="grid gap-6 sm:grid-cols-3">
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
    </GalleryShell>
  );
}

const hoverFeels = [
  { label: "Spring (default)", props: {} },
  {
    label: "Snappy — stiffness 600, damping 45",
    props: { springConfig: { stiffness: 600, damping: 45 } },
  },
  { label: "No spring", props: { hoverTransition: false } },
] as const;

export function SparklineHoverFeelExample() {
  return (
    <GalleryShell className="grid gap-6 sm:grid-cols-3">
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
    </GalleryShell>
  );
}

export function SparklineNoSpringExample() {
  const hover = useSparklineHover<SparklineGalleryPoint>();
  const shown = hover.datum ?? visitors.at(-1);
  return (
    <GalleryShell className="flex max-w-md flex-col gap-3">
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
    </GalleryShell>
  );
}

export function SparklineEndDotExample() {
  const last = latency.at(-1)?.value ?? 0;
  return (
    <GalleryShell className="flex max-w-md items-center gap-4">
      <div className="flex shrink-0 flex-col">
        <span className="text-muted-foreground text-xs">p95 latency</span>
        <span className="font-semibold text-lg tabular-nums">{last}ms</span>
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
    </GalleryShell>
  );
}

export function SparklineStepExample() {
  return (
    <GalleryShell className="max-w-md">
      <AreaSparkline
        color="var(--chart-5)"
        curve="step"
        data={seats}
        dataKey="value"
        endDot
        height={56}
        yDomain={[0]}
      />
    </GalleryShell>
  );
}

export function SparklineSyncedExample() {
  const hover = useSparklineHover<SparklineGalleryPoint>();
  const series = [
    { label: "Revenue", data: revenue, color: "var(--chart-1)" },
    { label: "Visitors", data: visitors, color: "var(--chart-2)" },
    {
      label: "Orders",
      data: sparklineGalleryData(3, 24, 120, 2),
      color: "var(--chart-3)",
    },
  ];
  return (
    <GalleryShell className="flex max-w-md flex-col gap-3">
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
    </GalleryShell>
  );
}

const tableRows = [
  { name: "Starter", data: sparklineGalleryData(11, 16, 320, 6) },
  { name: "Pro", data: sparklineGalleryData(12, 16, 880, 18) },
  { name: "Team", data: sparklineGalleryData(13, 16, 540, -9) },
  { name: "Enterprise", data: sparklineGalleryData(14, 16, 1260, 4) },
];

export function SparklineTableExample() {
  return (
    <GalleryShell className="max-w-lg">
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
    </GalleryShell>
  );
}

const gridVariants = [AreaSparkline, LineSparkline, BarSparkline] as const;

/** 64 sparklines sharing one ResizeObserver. */
export function SparklineDenseGridExample() {
  return (
    <GalleryShell className="grid grid-cols-4 gap-x-4 gap-y-3 sm:grid-cols-8">
      {Array.from({ length: 64 }, (_, i) => {
        const data = sparklineGalleryData(i, 20, 100, (i % 7) - 3);
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
    </GalleryShell>
  );
}
