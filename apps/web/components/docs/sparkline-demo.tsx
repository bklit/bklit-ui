"use client";

import {
  AreaSparkline,
  BarSparkline,
  LineSparkline,
  type SparklineCrosshair,
  useSparklineHover,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";

export interface SparkPoint {
  day: string;
  value: number;
}

/** Deterministic wavy series so SSR and client render the same paths. */
export function makeSparkData(
  seed: number,
  length = 24,
  base = 100,
  trend = 1.5
): SparkPoint[] {
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

const revenue = makeSparkData(1, 24, 4200, 40);
const visitors = makeSparkData(2, 24, 1800, -12);
const orders = makeSparkData(3, 18, 120, 2);

const formatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

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
  const first = data[0]?.value ?? 0;
  const change = shown ? ((shown.value - first) / first) * 100 : 0;
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2 text-muted-foreground text-xs">
        <span>{label}</span>
        <span className="tabular-nums">{shown?.day}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl tabular-nums">
          {shown ? formatter.format(shown.value) : "—"}
        </span>
        <span
          className={
            change >= 0
              ? "text-emerald-600 text-xs tabular-nums dark:text-emerald-400"
              : "text-rose-600 text-xs tabular-nums dark:text-rose-400"
          }
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      {children(hover)}
    </div>
  );
}

export function SparklineDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 py-4 sm:grid-cols-3">
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
    </div>
  );
}

const crosshairs: Exclude<SparklineCrosshair, false>[] = [
  "dashed",
  "solid",
  "gradient",
];

export function SparklineCrosshairDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6 py-4 sm:grid-cols-3">
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
    </div>
  );
}

const hoverFeels = [
  { label: "Spring (default)", props: {} },
  {
    label: "Snappy",
    props: { springConfig: { stiffness: 600, damping: 45 } },
  },
  { label: "No spring", props: { hoverTransition: false } },
] as const;

export function SparklineHoverFeelDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6 py-4 sm:grid-cols-3">
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
      <BarSparkline
        className="sm:col-span-3"
        color="var(--chart-3)"
        data={orders}
        dataKey="value"
        height={40}
        hoverTransition={false}
      />
    </div>
  );
}

export function SparklineSyncedDemo() {
  const hover = useSparklineHover<SparkPoint>();
  const series = [
    { label: "Revenue", data: revenue, color: "var(--chart-1)" },
    { label: "Visitors", data: visitors, color: "var(--chart-2)" },
    {
      label: "Orders",
      data: makeSparkData(3, 24, 120, 2),
      color: "var(--chart-3)",
    },
  ];
  return (
    <div className="flex w-full max-w-md flex-col gap-3 py-4">
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
            {formatter.format(
              s.data[hover.index ?? s.data.length - 1]?.value ?? 0
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

const gridVariants = [AreaSparkline, LineSparkline, BarSparkline] as const;

/** 200 sparklines — a quick way to eyeball mount and hover cost. */
export function SparklineGridDemo() {
  return (
    <div className="grid w-full grid-cols-4 gap-x-4 gap-y-2 py-4 sm:grid-cols-8">
      {Array.from({ length: 200 }, (_, i) => {
        const data = makeSparkData(i, 20, 100, (i % 7) - 3);
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
    </div>
  );
}
