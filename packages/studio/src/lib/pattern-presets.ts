import type {
  LegacyPatternPresetId,
  PatternPresetKey,
} from "@bklitui/ui/charts";

/**
 * Mirror of `PATTERN_PRESET_IDS` from `@bklitui/ui/charts`. Kept as a local,
 * type-checked copy because the ui module is `"use client"` and this list is
 * read at module scope by URL parsers that also run in server route handlers.
 * `satisfies` rejects unknown ids; `PatternPresetId` collapses to `never` (and
 * every use site fails to compile) if an id is missing here.
 */
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
] as const satisfies readonly PatternPresetKey[];

type MissingPatternPresetIds = Exclude<
  PatternPresetKey,
  (typeof PATTERN_PRESET_IDS)[number]
>;

/**
 * Preset id stored in Studio state — always a current id. Legacy ids from old
 * share URLs (`diagonal`, `cross`, `accent`) are mapped forward when parsed.
 */
export type PatternPresetId = [MissingPatternPresetIds] extends [never]
  ? PatternPresetKey
  : never;

/** Default preset when a pattern is switched on. */
export const DEFAULT_PATTERN_PRESET = "diagonal-up" satisfies PatternPresetId;

const LEGACY_PATTERN_PRESETS: Record<LegacyPatternPresetId, PatternPresetId> = {
  diagonal: "diagonal-up",
  cross: "grid",
  accent: "diagonal-up",
};

/**
 * Parse a stored / URL pattern value (current or legacy id) to a current id.
 * Same mapping as `resolvePatternPresetId` in `@bklitui/ui/charts`.
 */
export function parsePatternPresetId(
  value: string | null | undefined
): PatternPresetId {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "none";
  }
  if (Object.hasOwn(LEGACY_PATTERN_PRESETS, trimmed)) {
    return LEGACY_PATTERN_PRESETS[trimmed as LegacyPatternPresetId];
  }
  return (PATTERN_PRESET_IDS as readonly string[]).includes(trimmed)
    ? (trimmed as PatternPresetId)
    : "none";
}

/** Presets drawn with strokes — the only ones stroke width applies to. */
export const STROKE_PATTERN_PRESET_IDS = [
  "vertical",
  "vertical-dense",
  "horizontal",
  "horizontal-dense",
  "diagonal-up",
  "diagonal-up-sparse",
  "diagonal-down",
  "diagonal-down-sparse",
  "grid",
] as const satisfies readonly PatternPresetId[];

export function isStrokePatternPreset(preset: string): boolean {
  return (STROKE_PATTERN_PRESET_IDS as readonly string[]).includes(preset);
}

/** Every preset except `none` and the stroke presets. */
export const FILL_PATTERN_PRESET_IDS: readonly PatternPresetId[] =
  PATTERN_PRESET_IDS.filter(
    (id) => id !== "none" && !isStrokePatternPreset(id)
  );
