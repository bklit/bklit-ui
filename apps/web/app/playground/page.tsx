"use client";

import {
  weeklyVisitorsDashFromIndex,
  weeklyVisitorsData,
} from "@/lib/weekly-visitors-demo-data";
import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";

export default function PlaygroundPage() {
  const data = weeklyVisitorsData as unknown as Record<string, unknown>[];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-12">
      <header className="space-y-2">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
          Playground
        </p>
        <h1 className="font-heading font-semibold text-3xl tracking-tight">
          Line &amp; Area markers + dashed tail
        </h1>
        <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Experimental chart options: scatter-style ring markers on each point,
          and a dashed stroke from a chosen index for incomplete periods (e.g.
          yesterday through today).
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="font-medium text-lg">Area chart</h2>
          <p className="text-muted-foreground text-sm">
            Solid through yesterday; dashed projection for today. Markers use the
            same ring styling as Scatter.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <AreaChart
            aspectRatio="2.2 / 1"
            className="h-[320px]"
            data={data}
            xDataKey="date"
          >
            <Grid horizontal />
            <Area
              dashArray="6,4"
              dashFromIndex={weeklyVisitorsDashFromIndex}
              dataKey="visitors"
              fill="var(--chart-line-primary)"
              fillOpacity={0.35}
              showMarkers
              stroke="var(--chart-line-primary)"
            />
            <XAxis tickMode="data" />
            <ChartTooltip
              rows={(point) => [
                {
                  color: "var(--chart-line-primary)",
                  label: point.projected ? "Visitors (in progress)" : "Visitors",
                  value: Number(point.visitors),
                },
              ]}
            />
          </AreaChart>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-medium text-lg">Line chart</h2>
          <p className="text-muted-foreground text-sm">
            Same weekly visitors series with ring markers and a dashed tail for
            the in-progress day.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <LineChart
            aspectRatio="2.2 / 1"
            className="h-[320px]"
            data={data}
            xDataKey="date"
          >
            <Grid horizontal />
            <Line
              dashArray="6,4"
              dashFromIndex={weeklyVisitorsDashFromIndex}
              dataKey="visitors"
              showMarkers
              stroke="var(--chart-line-primary)"
              strokeWidth={2.5}
            />
            <XAxis tickMode="data" />
            <ChartTooltip
              rows={(point) => [
                {
                  color: "var(--chart-line-primary)",
                  label: "Visitors",
                  value: Number(point.visitors),
                },
              ]}
            />
          </LineChart>
        </div>
      </section>
    </div>
  );
}
