import type { RadialSeries } from "./radial-chart";

const PALETTE_SIZE = 5;

/**
 * Resolved color for a {@link RadialChart} series: its `color`, else the
 * chart palette by position (`--chart-1` … `--chart-5`, cycling). Layers that
 * are not a chart series (`series` undefined) fall back to var(--foreground).
 */
export function radialSeriesColor(
  series: Pick<RadialSeries, "color"> | undefined,
  index: number
): string {
  if (!series) {
    return "var(--foreground)";
  }
  return (
    series.color ?? `var(--chart-${(Math.max(0, index) % PALETTE_SIZE) + 1})`
  );
}
