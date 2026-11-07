"use client";

import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  PATTERN_PRESETS,
  PatternArea,
  PatternPreset,
  type PatternPresetFamily,
  type PatternPresetKey,
  type PatternPresetMeta,
  type PatternPresetOptions,
  PatternTile,
  XAxis,
} from "@bklitui/ui/charts";
import { useId } from "react";

const FAMILY_LABELS: Record<PatternPresetFamily, string> = {
  lines: "Lines",
  grids: "Grids",
  dashed: "Dashed & dotted lines",
  dots: "Dots",
  circles: "Circles",
  tiles: "Tiles",
};

const FAMILIES = [
  ...new Set(PATTERN_PRESETS.map((preset) => preset.family)),
] as PatternPresetFamily[];

function PatternSwatch({
  preset,
  label,
  caption,
  options,
}: {
  preset: PatternPresetKey;
  label: string;
  caption?: string;
  options?: PatternPresetOptions;
}) {
  const patternId = `docs-pattern-${preset}-${useId().replace(/:/g, "")}`;
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-2">
      <svg
        aria-label={label}
        className="block aspect-square w-full rounded-md border border-border bg-background"
        role="img"
      >
        <PatternPreset
          color="var(--chart-1)"
          id={patternId}
          preset={preset}
          {...options}
        />
        <rect fill={`url(#${patternId})`} height="100%" width="100%" />
      </svg>
      <figcaption className="flex min-w-0 flex-col gap-0.5">
        <code className="truncate font-mono text-foreground text-xs">
          {label}
        </code>
        {caption ? (
          <span className="truncate text-muted-foreground text-xs">
            {caption}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

function presetsInFamily(family: PatternPresetFamily): PatternPresetMeta[] {
  return PATTERN_PRESETS.filter((preset) => preset.family === family);
}

/** Every preset in `PATTERN_PRESETS`, grouped by family, as a swatch grid. */
export function PatternPresetGrid() {
  return (
    <div className="flex w-full flex-col gap-6">
      {FAMILIES.map((family) => (
        <section className="flex flex-col gap-3" key={family}>
          <h4 className="m-0 font-medium text-muted-foreground text-sm">
            {FAMILY_LABELS[family]}
          </h4>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {presetsInFamily(family).map((preset) => (
              <PatternSwatch
                caption={`${preset.size}px tile`}
                key={preset.id}
                label={preset.id}
                preset={preset.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** One preset with different `scale`, `strokeWidth`, `opacity` and `tileBackground`. */
export function PatternPresetOptionsDemo() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
      <PatternSwatch label="default" preset="diagonal-up" />
      <PatternSwatch
        label="scale={2}"
        options={{ scale: 2 }}
        preset="diagonal-up"
      />
      <PatternSwatch
        label="strokeWidth={2}"
        options={{ strokeWidth: 2 }}
        preset="diagonal-up"
      />
      <PatternSwatch
        label="opacity={0.4}"
        options={{ opacity: 0.4 }}
        preset="diagonal-up"
      />
      <PatternSwatch
        label="tileBackground"
        options={{
          tileBackground:
            "color-mix(in oklch, var(--chart-1) 12%, transparent)",
        }}
        preset="diagonal-up"
      />
    </div>
  );
}

const chartData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 173, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 264, mobile: 140 },
];

/** Two area series, each filled with a different preset. */
export function PatternsAreaDemo() {
  return (
    <div className="w-full">
      <AreaChart data={chartData}>
        <PatternPreset
          color="var(--chart-1)"
          id="patterns-doc-desktop"
          preset="diagonal-up"
        />
        <PatternPreset
          color="var(--chart-3)"
          id="patterns-doc-mobile"
          preset="dots"
        />
        <Grid horizontal />
        <PatternArea dataKey="desktop" fill="url(#patterns-doc-desktop)" />
        <Area
          dataKey="desktop"
          fill="var(--chart-1)"
          fillOpacity={0}
          strokeWidth={2}
        />
        <PatternArea dataKey="mobile" fill="url(#patterns-doc-mobile)" />
        <Area
          dataKey="mobile"
          fill="var(--chart-3)"
          fillOpacity={0}
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}

/** A custom `PatternTile`: a plus sign drawn in a 12×12 cell. */
export function PatternTileDemo() {
  const patternId = `docs-pattern-tile-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-label="Custom plus-sign pattern tile"
      className="block h-40 w-full rounded-md border border-border bg-background"
      role="img"
    >
      <PatternTile color="var(--chart-2)" id={patternId} size={12}>
        <path d="M5.5 3h1v6h-1zM3 5.5h6v1h-6z" fill="currentColor" />
      </PatternTile>
      <rect fill={`url(#${patternId})`} height="100%" width="100%" />
    </svg>
  );
}
