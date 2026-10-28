"use client";

import { type ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from "./chart-center-typography";
import { ChartStatFlow, type ChartStatFlowFormat } from "./chart-stat-flow";
import { radialNumberAt, useRadialChart } from "./radial-chart";

export interface RadialCenterState {
  /** Hovered bin, or null at rest */
  index: number | null;
  /** Hovered datum, or null at rest */
  datum: Record<string, unknown> | null;
  /** Hovered bin's x label (e.g. "09:15"), or null at rest */
  label: string | null;
  /** True when the hovered bin has no series values (future / ghost bin) */
  isFuture: boolean;
  /** Per-series totals over every non-future bin */
  totals: Record<string, number>;
  /** Per-series values of the hovered bin (0 when missing / at rest) */
  values: Record<string, number>;
}

export interface RadialCenterProps {
  /** Label under the value at rest. Default: "Total" */
  defaultLabel?: string;
  formatOptions?: ChartStatFlowFormat;
  prefix?: string;
  suffix?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  /** Full control over the center content (at rest and while hovering) */
  children?: (state: RadialCenterState) => ReactNode;
}

/**
 * Center content of {@link RadialChart}, drawn as HTML over the SVG hole
 * (same approach as `PieCenter`). Shows the sum of every series' total at
 * rest and the hovered bin's sum while scrubbing; pass `children` for custom
 * content.
 */
export function RadialCenter({
  defaultLabel = "Total",
  formatOptions,
  prefix,
  suffix,
  className,
  valueClassName = chartCenterValueClassName,
  labelClassName = chartCenterLabelClassName,
  children,
}: RadialCenterProps) {
  const { data, series, xDataKey, hoveredIndex, futureBins, totals } =
    useRadialChart();

  const state = useMemo((): RadialCenterState => {
    const datum = hoveredIndex === null ? null : (data[hoveredIndex] ?? null);
    const values: Record<string, number> = {};
    for (const s of series) {
      values[s.dataKey] = radialNumberAt(datum, s.dataKey) ?? 0;
    }
    const rawLabel = datum?.[xDataKey];
    return {
      index: hoveredIndex,
      datum,
      label: rawLabel === undefined ? null : String(rawLabel),
      isFuture:
        hoveredIndex === null ? false : Boolean(futureBins[hoveredIndex]),
      totals,
      values,
    };
  }, [data, series, xDataKey, hoveredIndex, futureBins, totals]);

  const containerClassName = cn(
    chartCenterContainerClassName,
    "flex flex-col items-center justify-center text-center",
    className
  );

  if (children) {
    return <div className={containerClassName}>{children(state)}</div>;
  }

  const source = state.datum ? state.values : state.totals;
  const value = Object.values(source).reduce((sum, v) => sum + v, 0);

  return (
    <div className={containerClassName}>
      <ChartStatFlow
        formatOptions={formatOptions}
        label={state.label ?? defaultLabel}
        labelClassName={labelClassName}
        prefix={prefix}
        suffix={suffix}
        value={value}
        valueClassName={valueClassName}
      />
    </div>
  );
}

RadialCenter.displayName = "RadialCenter";

export default RadialCenter;
