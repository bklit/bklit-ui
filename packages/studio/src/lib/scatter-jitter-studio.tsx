"use client";

import { TooltipContent } from "@bklitui/ui/charts";
import { SCATTER_JITTER_SERIES } from "./demo-data";

const shortMonthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const locFmt = new Intl.NumberFormat("en-US");

/** X-axis labels for the monthly PR sample ("Jan", "Feb", …). */
export const formatScatterJitterMonth = (date: Date) =>
  shortMonthFmt.format(date);

/** Compact LOC ticks: 500, 1k, 1.5k, … */
export const formatScatterJitterLoc = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value);

/** Tooltip body: month title + the hovered PR's series and "N LOC". */
export function ScatterJitterTooltipContent({
  point,
  colors,
}: {
  point: Record<string, unknown>;
  colors: readonly string[];
}) {
  const rows = SCATTER_JITTER_SERIES.flatMap((series, index) => {
    const value = point[series.dataKey];
    return typeof value === "number"
      ? [
          {
            color: colors[index] ?? "var(--chart-1)",
            label: series.label,
            value: `${locFmt.format(value)} LOC`,
          },
        ]
      : [];
  });
  return (
    <TooltipContent
      rows={rows}
      title={monthYearFmt.format(point.date as Date)}
    />
  );
}
