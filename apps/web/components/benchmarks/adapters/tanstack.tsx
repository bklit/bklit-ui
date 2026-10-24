"use client";

import {
  areaY,
  barY,
  crosshair,
  defineChart,
  dot,
  group,
  lineY,
} from "@tanstack/charts";
import { d3Curve } from "@tanstack/charts/d3/shape";
import { decorative } from "@tanstack/charts/mark/decorative";
import { motion } from "@tanstack/charts/motion";
import { Chart } from "@tanstack/charts/react";
import { Chart as RendererChart } from "@tanstack/charts/react/core";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { scaleTime } from "d3-scale";
import { curveMonotoneX } from "d3-shape";
import { useMemo } from "react";
import type { BenchChartProps, BenchLibraryAdapter, BenchRow } from "../types";

/** Same palette as the bklit and Recharts adapters. */
const SERIES_COLORS = [
  "var(--chart-line-primary)",
  "var(--chart-line-secondary)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** `motion()` renderer default: 1,100 ms tween (docs/reference/motion.md). */
const TANSTACK_MOTION_ENTER_MS = 1100;

const monotoneCurve = d3Curve(curveMonotoneX);
const dateTick = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
});

function seriesKeys(seriesCount: number) {
  return Array.from(
    { length: seriesCount },
    (_, index) => `s${index}` as `s${number}`
  );
}

function seriesColor(index: number) {
  return SERIES_COLORS[index % SERIES_COLORS.length] as string;
}

const timeX = {
  scale: scaleTime,
  axis: { ticks: { format: (value: Date) => dateTick.format(value) } },
};

/** Horizontal grid, no y-axis labels (matches the bklit chart chrome). */
const gridY = {
  scale: scaleLinear,
  nice: true,
  grid: true,
  axis: false as const,
};

/**
 * Hover guides snap instead of inheriting the motion() renderer's 1,100 ms
 * tween (docs: guides/tooltips-and-focus.md "fast pointer inspection"), the
 * way bklit and Recharts tooltips follow the pointer. No-ops on the static
 * renderer.
 */
const tooltipOptions = { use: tooltip, motion: false as const };

type Definition = Parameters<typeof Chart>[0]["definition"];

/**
 * `animate: true` mounts the optional `motion()` renderer (entrance + update
 * motion, the closest equivalent to bklit's enter animation). `animate: false`
 * uses the default SVG `Chart`, which has no entrance animation.
 */
function TanStackHost({
  definition,
  width,
  height,
  animate,
}: {
  definition: Definition;
  width: number;
  height: number;
  animate: boolean;
}) {
  const renderer = useMemo(() => (animate ? motion() : null), [animate]);
  if (renderer) {
    return (
      <RendererChart
        ariaLabel="Benchmark chart"
        definition={definition}
        height={height}
        renderer={renderer}
        width={width}
      />
    );
  }
  return (
    <Chart
      ariaLabel="Benchmark chart"
      definition={definition}
      height={height}
      width={width}
    />
  );
}

const rowDate = (row: BenchRow) => row.date;

function TanStackLine({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          crosshair({ x: true, y: false, motion: false }),
          ...seriesKeys(seriesCount).map((key, index) =>
            lineY(data, {
              id: key,
              x: rowDate,
              y: key,
              stroke: seriesColor(index),
              curve: monotoneCurve,
            })
          ),
        ],
        scales: { x: timeX, y: gridY },
        focus: "group-x",
        maxFocusDistance: Number.POSITIVE_INFINITY,
        tooltip: tooltipOptions,
      }),
    [data, seriesCount]
  );
  return (
    <TanStackHost
      animate={animate}
      definition={definition}
      height={height}
      width={width}
    />
  );
}

function TanStackArea({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          crosshair({ x: true, y: false, motion: false }),
          ...seriesKeys(seriesCount).flatMap((key, index) => [
            // Explicit baseline: overlapping (not stacked) areas, like bklit.
            areaY(data, {
              id: `${key}-area`,
              x: rowDate,
              y1: 0,
              y2: key,
              fill: seriesColor(index),
              curve: monotoneCurve,
            }),
            // Areas don't stroke their top edge; the line is visual only so
            // each series contributes one tooltip row.
            decorative(
              lineY(data, {
                id: `${key}-line`,
                x: rowDate,
                y: key,
                stroke: seriesColor(index),
                curve: monotoneCurve,
              })
            ),
          ]),
        ],
        scales: { x: timeX, y: gridY },
        focus: "group-x",
        maxFocusDistance: Number.POSITIVE_INFINITY,
        tooltip: tooltipOptions,
      }),
    [data, seriesCount]
  );
  return (
    <TanStackHost
      animate={animate}
      definition={definition}
      height={height}
      width={width}
    />
  );
}

interface LongBarRow {
  label: string;
  series: string;
  value: number;
}

function TanStackBar({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  const definition = useMemo(() => {
    const keys = seriesKeys(seriesCount);
    // Grouped bars take one row per (category, series): TanStack's documented
    // shape for `layout: group()`. The reshape is part of the measured work.
    const rows: LongBarRow[] = [];
    for (const row of data) {
      for (const key of keys) {
        rows.push({ label: row.label, series: key, value: row[key] ?? 0 });
      }
    }
    return defineChart({
      marks: [
        crosshair({ x: true, y: false, motion: false }),
        barY(rows, {
          x: "label",
          y: "value",
          z: "series",
          color: "series",
          layout: group(),
        }),
      ],
      scales: {
        x: { scale: () => scaleBand().padding(0.2) },
        y: gridY,
      },
      color: {
        domain: keys,
        range: keys.map((_, index) => seriesColor(index)),
      },
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: tooltipOptions,
    });
  }, [data, seriesCount]);
  return (
    <TanStackHost
      animate={animate}
      definition={definition}
      height={height}
      width={width}
    />
  );
}

function TanStackScatter({
  data,
  seriesCount,
  width,
  height,
  animate,
}: BenchChartProps) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          crosshair({ motion: false }),
          ...seriesKeys(seriesCount).map((key, index) =>
            dot(data, {
              id: key,
              x: rowDate,
              y: key,
              fill: seriesColor(index),
            })
          ),
        ],
        scales: { x: timeX, y: gridY },
        tooltip: tooltipOptions,
      }),
    [data, seriesCount]
  );
  return (
    <TanStackHost
      animate={animate}
      definition={definition}
      height={height}
      width={width}
    />
  );
}

export const tanstackAdapter: BenchLibraryAdapter = {
  id: "tanstack",
  name: "TanStack Charts",
  version: "1.1.0",
  charts: {
    line: TanStackLine,
    area: TanStackArea,
    bar: TanStackBar,
    scatter: TanStackScatter,
  },
  initialAnimationMs: TANSTACK_MOTION_ENTER_MS,
  notes:
    'SVG. Animation off uses the default Chart (no entrance animation); animation on uses the opt-in motion() renderer (1,100 ms tween), with tooltip and crosshair motion off so hover snaps. focus: "group-x" scans every point per move (a spatialIndex is not consulted for group-x). The motion() renderer pre-renders one hidden focus ring <circle> per point, raising DOM nodes when animated. Time x uses d3-scale scaleTime; curves via d3Curve(curveMonotoneX).',
};
