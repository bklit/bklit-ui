// biome-ignore-all lint/performance/noBarrelFile: re-export pattern preset ids for parsers and UI
"use client";

import { PatternPreset, renderPatternPreset } from "@bklitui/ui/charts";
import { Fragment, isValidElement } from "react";

export {
  DEFAULT_PATTERN_PRESET,
  PATTERN_PRESET_IDS,
  type PatternPresetId,
} from "@/lib/pattern-presets";

import type { PatternPresetId } from "@/lib/pattern-presets";

const STUDIO_PATTERN_ID = "studio-pattern-fill";

export function studioPatternIdForSeries(seriesIndex: number) {
  return seriesIndex === 0
    ? STUDIO_PATTERN_ID
    : `${STUDIO_PATTERN_ID}-${seriesIndex}`;
}

export function studioPatternFill(
  statePattern: PatternPresetId,
  seriesIndex = 0
): string | undefined {
  if (statePattern === "none") {
    return undefined;
  }
  return `url(#${studioPatternIdForSeries(seriesIndex)})`;
}

/** Chart palette var for a series / slice / region index. */
function chartVarAt(index: number): string {
  return `var(--chart-${(index % 5) + 1})`;
}

/** Pattern def node for a preset, or null for `none`. */
export function studioPatternNode(
  preset: PatternPresetId,
  id: string,
  color: string,
  scale = 1
) {
  const node = renderPatternPreset(preset, id, { color, scale });
  if (!(node && isValidElement(node))) {
    return null;
  }
  return node;
}

export function StudioPatternDefs({
  preset,
  seriesPatterns,
  seriesScales,
}: {
  preset?: PatternPresetId;
  seriesPatterns?: PatternPresetId[];
  /** Tile scale per series (default 1). */
  seriesScales?: number[];
}) {
  let entries: PatternPresetId[] = [];
  if (seriesPatterns && seriesPatterns.length > 0) {
    entries = seriesPatterns;
  } else if (preset) {
    entries = [preset];
  }

  const nodes = entries.map((entry, index) => {
    if (entry === "none") {
      return null;
    }
    const id = studioPatternIdForSeries(index);
    const node = studioPatternNode(
      entry,
      id,
      chartVarAt(index),
      seriesScales?.[index] ?? 1
    );
    if (!node) {
      return null;
    }
    return <Fragment key={id}>{node}</Fragment>;
  });

  if (nodes.every((node) => node == null)) {
    return null;
  }

  return <>{nodes}</>;
}

/**
 * Per-slice presets for the pie "lines" fill — varied textures so adjacent
 * slices read apart even in a single colour.
 */
export const STUDIO_PIE_SLICE_PATTERNS = [
  "diagonal-up",
  "dots",
  "vertical",
  "grid-dashed",
  "diagonal-down",
  "circles-dense",
  "horizontal",
  "checkerboard-xs",
] as const satisfies readonly PatternPresetId[];

export function studioPieSlicePattern(index: number): PatternPresetId {
  return (
    STUDIO_PIE_SLICE_PATTERNS[index % STUDIO_PIE_SLICE_PATTERNS.length] ??
    "diagonal-up"
  );
}

/** Direct PatternPreset defs for PieChart (it only hoists Pattern* children). */
export function studioPiePatternDefs(sliceCount: number) {
  return Array.from({ length: sliceCount }, (_, index) => {
    const id = `studio-pie-p${index}`;
    return (
      <PatternPreset
        color={chartVarAt(index)}
        id={id}
        key={id}
        preset={studioPieSlicePattern(index)}
      />
    );
  });
}

export function studioPieSlicePatternFill(index: number): string {
  return `url(#studio-pie-p${index})`;
}

const CHOROPLETH_REGIONS = [
  "americas",
  "europe",
  "asia",
  "africa",
  "oceania",
] as const;

export function StudioChoroplethBgPattern({
  preset,
}: {
  preset: PatternPresetId;
}) {
  if (preset === "none") {
    return null;
  }
  return <>{studioPatternNode(preset, "studio-choro-bg", "var(--chart-5)")}</>;
}

export function StudioChoroplethFgPatterns({
  preset,
}: {
  preset: PatternPresetId;
}) {
  if (preset === "none") {
    return null;
  }
  return (
    <>
      {CHOROPLETH_REGIONS.map((region, index) => {
        const node = renderPatternPreset(preset, `studio-choro-fg-${region}`, {
          color: chartVarAt(index),
          strokeWidth: 2,
        });
        return node ? <Fragment key={region}>{node}</Fragment> : null;
      })}
    </>
  );
}

export function studioChoroplethFgPatternId(
  countryName: string | undefined
): string | null {
  if (!countryName) {
    return null;
  }
  const c = countryName.charAt(0).toUpperCase();
  if ("ABCD".includes(c)) {
    return "studio-choro-fg-americas";
  }
  if ("EFGH".includes(c)) {
    return "studio-choro-fg-europe";
  }
  if ("IJKLM".includes(c)) {
    return "studio-choro-fg-asia";
  }
  if ("NOPQR".includes(c)) {
    return "studio-choro-fg-africa";
  }
  return "studio-choro-fg-oceania";
}

export interface PatternCodegenOptions {
  /** Pattern id. Default: the Studio series-0 pattern id. */
  id?: string;
  /** Default: `var(--chart-1)` */
  color?: string;
  /** Emitted only when not 1. */
  scale?: number;
  /** Emitted only when not 1. */
  strokeWidth?: number;
}

/** `<PatternPreset … />` source for a preset; empty string for `none`. */
export function patternCodegenBlock(
  preset: PatternPresetId,
  options: PatternCodegenOptions = {}
): string {
  if (preset === "none") {
    return "";
  }
  const props = [
    `id="${options.id ?? STUDIO_PATTERN_ID}"`,
    `preset="${preset}"`,
    `color="${options.color ?? "var(--chart-1)"}"`,
  ];
  if (options.scale != null && options.scale !== 1) {
    props.push(`scale={${options.scale}}`);
  }
  if (options.strokeWidth != null && options.strokeWidth !== 1) {
    props.push(`strokeWidth={${options.strokeWidth}}`);
  }
  return `<PatternPreset ${props.join(" ")} />`;
}
