"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { intFmt } from "./chart-formatters";
import { Legend } from "./legend/legend";
import { useLegendItem } from "./legend/legend-context";
import { LegendItem } from "./legend/legend-item";
import { LegendLabel } from "./legend/legend-label";
import { LegendMarker } from "./legend/legend-marker";
import { useRadialChart } from "./radial-chart";
import { radialSeriesColor } from "./radial-series-color";

function RadialLegendValue({
  formatValue,
}: {
  formatValue: (value: number) => string;
}) {
  const { series } = useRadialChart();
  const { item, index } = useLegendItem();
  const emphasize = series[index]?.emphasize;
  return (
    <span
      className="font-semibold text-foreground tabular-nums"
      style={emphasize ? { color: item.color } : undefined}
    >
      {formatValue(item.value)}
    </span>
  );
}

export interface RadialLegendProps {
  className?: string;
  /** Format the per-series totals. Default: en-US integer */
  formatValue?: (value: number) => string;
  /**
   * Show each series' total after its label. Turn off when totals are
   * meaningless (e.g. temperatures). Default: true
   */
  showValues?: boolean;
}

/**
 * Inline legend for {@link RadialChart}: dot, muted label and the series
 * total (tinted for `emphasize` series). Hovering an item sets
 * `hoveredSeries` so layers can dim the other series.
 */
export function RadialLegend({
  className,
  formatValue = intFmt,
  showValues = true,
}: RadialLegendProps) {
  const { series, totals, hoveredSeries, setHoveredSeries } = useRadialChart();
  const items = useMemo(
    () =>
      series.map((s, i) => ({
        label: s.label ?? s.dataKey,
        value: totals[s.dataKey] ?? 0,
        color: radialSeriesColor(s, i),
      })),
    [series, totals]
  );

  return (
    <Legend
      className={cn(
        "mt-2 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1",
        className
      )}
      hoveredIndex={hoveredSeries}
      items={items}
      onHoverChange={setHoveredSeries}
    >
      <LegendItem className="flex items-center gap-2">
        <LegendMarker className="size-2" />
        <LegendLabel className="text-muted-foreground text-sm" />
        {showValues ? <RadialLegendValue formatValue={formatValue} /> : null}
      </LegendItem>
    </Legend>
  );
}

RadialLegend.displayName = "RadialLegend";

export default RadialLegend;
