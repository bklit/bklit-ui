"use client";

import {
  BarChart,
  BarColumnTrack,
  BarSquares,
  BarXAxis,
  ChartTooltip,
  PatternLines,
} from "@bklitui/ui/charts";
import { useId, useMemo } from "react";
import { BENCH_LIBRARY_COLORS } from "./benchmark-format";
import type { BenchLibraryId } from "./types";

const LIBRARY_IDS = Object.keys(BENCH_LIBRARY_COLORS) as BenchLibraryId[];

export interface BenchMetricDatum {
  /** x category: the library name. */
  library: string;
  /** Picks the library's identity color for its column. */
  libraryId: BenchLibraryId;
  /** Primary value (solid squares in the library color). */
  value: number;
  /** Optional secondary value (patterned squares), e.g. the fastest sample. */
  secondary?: number;
}

/**
 * Per-library comparison bars in the gallery's square-column style: patterned
 * column track, an optional patterned series, and a solid series with a
 * ring tooltip indicator snapped to the squares.
 */
export function BenchmarkMetricChart({
  data,
  valueLabel,
  secondaryLabel,
  format,
}: {
  data: BenchMetricDatum[];
  valueLabel: string;
  /** Set to show the patterned secondary series. */
  secondaryLabel?: string;
  format: (value: number) => string;
}) {
  // Several of these charts share the page: pattern ids must be unique.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const trackId = `bench-track-${uid}`;
  const secondaryId = `bench-secondary-${uid}`;
  const hasSecondary = secondaryLabel != null;
  const secondaryPatternId = (library: BenchLibraryId) =>
    `${secondaryId}-${library}`;

  // Each column takes its library's color: solid squares for the primary
  // series, that color's diagonal pattern for the secondary one.
  const chartData = useMemo(
    () =>
      data.map((datum) => ({
        ...datum,
        color: BENCH_LIBRARY_COLORS[datum.libraryId],
        secondaryFill: `url(#${secondaryId}-${datum.libraryId})`,
      })),
    [data, secondaryId]
  );

  return (
    <BarChart
      aspectRatio="16 / 9"
      // Three wide bands would make each square tens of px tall, so a column
      // could only show a couple of squares. Narrow bars keep squares small
      // enough for the column height to read as a value.
      barGap={hasSecondary ? 0.7 : 0.85}
      data={chartData as unknown as Record<string, unknown>[]}
      margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
      squareSnap={{ squareGap: 3, groupGap: 4 }}
      xDataKey="library"
    >
      <PatternLines
        height={6}
        id={trackId}
        orientation={["diagonal"]}
        stroke="var(--chart-grid)"
        strokeWidth={1}
        width={6}
      />
      <BarColumnTrack
        fill={`url(#${trackId})`}
        groupGap={4}
        opacity={0.65}
        squareGap={3}
        squareRadius={0.25}
      />
      {hasSecondary
        ? LIBRARY_IDS.map((library) => (
            <PatternLines
              height={6}
              id={secondaryPatternId(library)}
              key={library}
              orientation={["diagonal"]}
              stroke={BENCH_LIBRARY_COLORS[library]}
              strokeWidth={1}
              width={6}
            />
          ))
        : null}
      {hasSecondary ? (
        <BarSquares
          colorKey="secondaryFill"
          dataKey="secondary"
          groupGap={4}
          squareGap={3}
          squareRadius={0.25}
        />
      ) : null}
      <BarSquares
        colorKey="color"
        dataKey="value"
        groupGap={4}
        squareGap={3}
        squareRadius={0.25}
      />
      <BarXAxis />
      <ChartTooltip
        dotColor="oklch(1 0.002 186.385 / 0.7)"
        dotScale={1.05}
        dotVariant="ring"
        rows={(point) => [
          ...(hasSecondary && typeof point.secondary === "number"
            ? [
                {
                  color: String(point.color),
                  label: secondaryLabel,
                  value: format(point.secondary),
                },
              ]
            : []),
          {
            color: String(point.color),
            label: valueLabel,
            value: format(Number(point.value)),
          },
        ]}
        showCrosshair={false}
      />
    </BarChart>
  );
}
