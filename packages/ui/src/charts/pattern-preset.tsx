"use client";

import type { ReactNode } from "react";
import { PatternTile } from "./pattern-tile";

/**
 * Pattern presets — minimal repeating cells re-authored from Nucleo's free SVG
 * patterns (https://nucleoapp.com/svg-patterns/). Every cell is painted with
 * `currentColor`, so `color` drives it. Base names use 6px spacing; `-sparse`
 * and `-dense` variants double or halve it.
 */
interface PatternPresetDef {
  label: string;
  family: PatternPresetFamily;
  /** Cell size in user units (the pattern repeats every `size × scale` px). */
  size: number;
  /** Filled artwork. */
  fill?: string;
  /** 1px-stroked artwork (stroke width follows `strokeWidth`). */
  stroke?: string;
}

export type PatternPresetFamily =
  | "lines"
  | "grids"
  | "dashed"
  | "dots"
  | "circles"
  | "tiles";

const PATTERN_PRESET_DEFS = {
  vertical: {
    label: "Vertical",
    family: "lines",
    size: 6,
    stroke: "M5.5 0V6M-0.5 0V6",
  },
  "vertical-dense": {
    label: "Vertical dense",
    family: "lines",
    size: 3,
    stroke: "M2.5 0V3M-0.5 0V3",
  },
  horizontal: {
    label: "Horizontal",
    family: "lines",
    size: 6,
    stroke: "M0 5.5H6M0 -0.5H6",
  },
  "horizontal-dense": {
    label: "Horizontal dense",
    family: "lines",
    size: 3,
    stroke: "M0 2.5H3M0 -0.5H3",
  },
  "diagonal-up": {
    label: "Diagonal up",
    family: "lines",
    size: 6,
    stroke: "M-2 1L1 -2M-1 6L6 -1M4 7L7 4",
  },
  "diagonal-up-sparse": {
    label: "Diagonal up sparse",
    family: "lines",
    size: 12,
    stroke: "M-2 1L1 -2M-1 12L12 -1M10 13L13 10",
  },
  "diagonal-down": {
    label: "Diagonal down",
    family: "lines",
    size: 6,
    stroke: "M-1 -1L7 7M-2 4L2 8M4 -2L8 2",
  },
  "diagonal-down-sparse": {
    label: "Diagonal down sparse",
    family: "lines",
    size: 12,
    stroke: "M-1 -1L13 13M-2 10L2 14M10 -2L14 2",
  },
  grid: {
    label: "Grid",
    family: "grids",
    size: 6,
    stroke: "M5.5 0V6M-0.5 0V6M0 5.5H6M0 -0.5H6",
  },
  "vertical-dashed": {
    label: "Vertical dashed",
    family: "dashed",
    size: 6,
    fill: "M6 1V4H5V1H6Z",
  },
  "horizontal-dashed": {
    label: "Horizontal dashed",
    family: "dashed",
    size: 6,
    fill: "M4 6L1 6L1 5L4 5L4 6Z",
  },
  "horizontal-dashed-dense": {
    label: "Horizontal dashed dense",
    family: "dashed",
    size: 6,
    fill: "M4 6L1 6L1 5L4 5L4 6ZM4 3L1 3L1 2L4 2L4 3Z",
  },
  "grid-dashed": {
    label: "Grid dashed",
    family: "dashed",
    size: 6,
    fill: "M6 1V4H5V1H6ZM4 6L1 6L1 5L4 5L4 6Z",
  },
  "grid-dotted": {
    label: "Grid dotted",
    family: "dashed",
    size: 6,
    fill: "M1 6V5H2V6H1ZM3 6V5H4V6H3ZM5 6V5H6V6H5ZM6 4H5V3H6V4ZM6 2H5V1H6V2Z",
  },
  dots: { label: "Dots", family: "dots", size: 6, fill: "M6 5H5V6H6V5Z" },
  "dots-sparse": {
    label: "Dots sparse",
    family: "dots",
    size: 12,
    fill: "M12 11H11V12H12V11ZM6 5H5V6H6V5Z",
  },
  "diagonal-dots-up": {
    label: "Diagonal dots up",
    family: "dots",
    size: 6,
    fill: "M5 5h1v1h-1zM3 1h1v1h-1zM1 3h1v1h-1z",
  },
  "diagonal-dots-up-sparse": {
    label: "Diagonal dots up sparse",
    family: "dots",
    size: 12,
    fill: "M5 5h1v1h-1zM11 11h1v1h-1zM3 7h1v1h-1zM1 9h1v1h-1zM7 3h1v1h-1zM9 1h1v1h-1z",
  },
  "diagonal-dots-down": {
    label: "Diagonal dots down",
    family: "dots",
    size: 6,
    fill: "M5 5h1v1h-1zM3 3h1v1h-1zM1 1h1v1h-1z",
  },
  "diagonal-dots-down-sparse": {
    label: "Diagonal dots down sparse",
    family: "dots",
    size: 12,
    fill: "M11 11h1v1h-1zM9 9h1v1h-1zM7 7h1v1h-1zM5 5h1v1h-1zM3 3h1v1h-1zM1 1h1v1h-1z",
  },
  "circles-dense": {
    label: "Circles dense",
    family: "circles",
    size: 6,
    fill: "M1 2.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z",
  },
  circles: {
    label: "Circles",
    family: "circles",
    size: 12,
    fill: "M4 5.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z",
  },
  "circles-sparse": {
    label: "Circles sparse",
    family: "circles",
    size: 24,
    fill: "M4 5.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM16 17.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z",
  },
  blocks: { label: "Blocks", family: "tiles", size: 6, fill: "M1 1h3v3h-3z" },
  "checkerboard-xs": {
    label: "Checkerboard XS",
    family: "tiles",
    size: 6,
    fill: "M0 0h3v3h-3zM3 3h3v3h-3z",
  },
  "checkerboard-sm": {
    label: "Checkerboard SM",
    family: "tiles",
    size: 8,
    fill: "M0 0h4v4h-4zM4 4h4v4h-4z",
  },
  checkerboard: {
    label: "Checkerboard",
    family: "tiles",
    size: 12,
    fill: "M0 0h6v6h-6zM6 6h6v6h-6z",
  },
  "checkerboard-lg": {
    label: "Checkerboard LG",
    family: "tiles",
    size: 24,
    fill: "M12 0H0V12H12V0ZM24 12H12V24H24V12Z",
  },
  "checkerboard-inset": {
    label: "Checkerboard inset",
    family: "tiles",
    size: 12,
    fill: "M0 0h5v5h-5zM6 6h5v5h-5z",
  },
} as const satisfies Record<string, PatternPresetDef>;

export const PATTERN_PRESET_IDS = [
  "none",
  "vertical",
  "vertical-dense",
  "horizontal",
  "horizontal-dense",
  "diagonal-up",
  "diagonal-up-sparse",
  "diagonal-down",
  "diagonal-down-sparse",
  "grid",
  "vertical-dashed",
  "horizontal-dashed",
  "horizontal-dashed-dense",
  "grid-dashed",
  "grid-dotted",
  "dots",
  "dots-sparse",
  "diagonal-dots-up",
  "diagonal-dots-up-sparse",
  "diagonal-dots-down",
  "diagonal-dots-down-sparse",
  "circles-dense",
  "circles",
  "circles-sparse",
  "blocks",
  "checkerboard-xs",
  "checkerboard-sm",
  "checkerboard",
  "checkerboard-lg",
  "checkerboard-inset",
] as const;

/** A current preset id (what `PATTERN_PRESET_IDS` lists). */
export type PatternPresetKey = (typeof PATTERN_PRESET_IDS)[number];

/** Ids from the pre-Nucleo preset set, still accepted and mapped forward. */
export type LegacyPatternPresetId = "diagonal" | "cross" | "accent";

/** Any accepted preset id — current or legacy. */
export type PatternPresetId = PatternPresetKey | LegacyPatternPresetId;

const LEGACY_PATTERN_PRESETS: Record<LegacyPatternPresetId, PatternPresetKey> =
  {
    diagonal: "diagonal-up",
    cross: "grid",
    accent: "diagonal-up",
  };

/** Map any preset id (current or legacy) to a current one; unknown → `none`. */
export function resolvePatternPresetId(
  preset: string | null | undefined
): PatternPresetKey {
  if (!preset) {
    return "none";
  }
  if (preset in LEGACY_PATTERN_PRESETS) {
    return LEGACY_PATTERN_PRESETS[preset as LegacyPatternPresetId];
  }
  return (PATTERN_PRESET_IDS as readonly string[]).includes(preset)
    ? (preset as PatternPresetKey)
    : "none";
}

export interface PatternPresetMeta {
  id: Exclude<PatternPresetKey, "none">;
  label: string;
  family: PatternPresetFamily;
  size: number;
}

/** Every preset except `none`, in display order. */
export const PATTERN_PRESETS: readonly PatternPresetMeta[] = (
  Object.entries(PATTERN_PRESET_DEFS) as [
    Exclude<PatternPresetKey, "none">,
    PatternPresetDef,
  ][]
).map(([id, def]) => ({
  id,
  label: def.label,
  family: def.family,
  size: def.size,
}));

export interface PatternPresetOptions {
  /** Artwork colour (`currentColor`). Default: `var(--chart-1)` */
  color?: string;
  /** Tile size multiplier. Default: 1 */
  scale?: number;
  /** Stroke width for line presets, in cell units. Default: 1 */
  strokeWidth?: number;
  /** Artwork opacity. Default: 1 */
  opacity?: number;
  /** Solid fill painted under the artwork. */
  tileBackground?: string;
  /** @deprecated No effect — only applied to the pre-Nucleo circle presets. */
  radius?: number;
  /** @deprecated No effect — only applied to the pre-Nucleo circle presets. */
  complement?: boolean;
  /** @deprecated No effect — only applied to the pre-Nucleo circle presets. */
  fill?: string;
  /** @deprecated No effect — only applied to the pre-Nucleo dot preset. */
  dotFill?: boolean;
}

/** Presets drawn as circles. */
export function isCirclePattern(preset: PatternPresetId): boolean {
  const id = resolvePatternPresetId(preset);
  return id !== "none" && PATTERN_PRESET_DEFS[id].family === "circles";
}

/** @deprecated Use `isCirclePattern`. */
export function isCirclesPattern(preset: PatternPresetId): boolean {
  return isCirclePattern(preset);
}

/** Rendered tile size for a preset at `scale`. */
export function patternPresetTileSize(
  preset: PatternPresetId,
  scale = 1
): { width: number; height: number; strokeWidth: number } {
  const id = resolvePatternPresetId(preset);
  const def: PatternPresetDef | undefined =
    id === "none" ? undefined : PATTERN_PRESET_DEFS[id];
  const size = (def?.size ?? 6) * scale;
  return {
    width: size,
    height: size,
    strokeWidth: def?.stroke ? scale : 0,
  };
}

/** Renders the `<defs><pattern/></defs>` node for a preset. */
export function renderPatternPreset(
  preset: PatternPresetId,
  id: string,
  options: PatternPresetOptions = {}
): ReactNode {
  const resolved = resolvePatternPresetId(preset);
  if (resolved === "none") {
    return null;
  }
  const def: PatternPresetDef = PATTERN_PRESET_DEFS[resolved];
  const color =
    options.color ?? (preset === "accent" ? "#e879f9" : "var(--chart-1)");

  return (
    <PatternTile
      background={options.tileBackground}
      color={color}
      id={id}
      opacity={options.opacity}
      scale={options.scale}
      size={def.size}
    >
      {def.fill ? <path d={def.fill} fill="currentColor" /> : null}
      {def.stroke ? (
        <path
          d={def.stroke}
          fill="none"
          stroke="currentColor"
          strokeWidth={options.strokeWidth ?? 1}
        />
      ) : null}
    </PatternTile>
  );
}

export interface PatternPresetProps extends PatternPresetOptions {
  /** Unique id — reference it as `fill="url(#id)"`. */
  id: string;
  /** Preset to draw. Default: `"diagonal-up"` */
  preset?: PatternPresetId;
}

/**
 * Pattern definition for any preset. Drop it into a chart's children and
 * reference it with `fill="url(#id)"`.
 *
 * @example <PatternPreset id="stripes" preset="diagonal-up" color="var(--chart-2)" />
 */
export function PatternPreset({
  id,
  preset = "diagonal-up",
  ...options
}: PatternPresetProps) {
  return <>{renderPatternPreset(preset, id, options)}</>;
}

PatternPreset.displayName = "PatternPreset";
