import type {
  HeatmapLevelColors,
  HeatmapLevelFillMode,
  HeatmapLevelStyle,
  HeatmapLevelStyles,
} from "@bklitui/ui/charts";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { PATTERN_PRESET_IDS } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField, serializePipeField } from "@/lib/studio-series-design";

const HEATMAP_LEVEL_COUNT = 5;

const HEATMAP_LEVEL_COLOR_KEYS = [
  "heatmapLevel0Color",
  "heatmapLevel1Color",
  "heatmapLevel2Color",
  "heatmapLevel3Color",
  "heatmapLevel4Color",
] as const satisfies readonly (keyof StudioUrlState)[];

function isPatternPresetId(value: string): value is PatternPresetId {
  return (PATTERN_PRESET_IDS as readonly string[]).includes(value);
}

function parsePipeNumbers(raw: string, fallback: number): number[] {
  const parsed = parsePipeField(raw);
  return Array.from({ length: HEATMAP_LEVEL_COUNT }, (_, index) => {
    const value = Number(parsed[index]);
    return Number.isFinite(value) ? value : fallback;
  });
}

function parsePipeBooleans(raw: string, fallback: boolean): boolean[] {
  const parsed = parsePipeField(raw);
  return Array.from({ length: HEATMAP_LEVEL_COUNT }, (_, index) => {
    const value = parsed[index];
    if (value === "1" || value === "true") {
      return true;
    }
    if (value === "0" || value === "false") {
      return false;
    }
    return fallback;
  });
}

function setPipeString(values: string[], level: number, value: string): string {
  const next = [...values];
  next[level] = value;
  return serializePipeField(next);
}

function setPipeNumber(values: number[], level: number, value: number): string {
  const next = values.map(String);
  next[level] = String(value);
  return serializePipeField(next);
}

function setPipeBoolean(
  values: boolean[],
  level: number,
  value: boolean
): string {
  const next = values.map((entry) => (entry ? "1" : "0"));
  next[level] = value ? "1" : "0";
  return serializePipeField(next);
}

function parseHeatmapLevelFillModes(
  state: StudioUrlState
): HeatmapLevelFillMode[] {
  const parsed = parsePipeField(state.heatmapLevelFillModes);
  return Array.from({ length: HEATMAP_LEVEL_COUNT }, (_, index) =>
    parsed[index] === "pattern" ? "pattern" : "solid"
  );
}

function parseHeatmapLevelPatterns(state: StudioUrlState): PatternPresetId[] {
  const parsed = parsePipeField(state.heatmapLevelPatterns);
  return Array.from({ length: HEATMAP_LEVEL_COUNT }, (_, index) => {
    const value = parsed[index] ?? "";
    return isPatternPresetId(value) ? value : "none";
  });
}

function buildLevelStyle(
  state: StudioUrlState,
  level: number,
  color: string,
  fillMode: HeatmapLevelFillMode,
  pattern: PatternPresetId
): HeatmapLevelStyle {
  const patternColors = parsePipeField(state.heatmapLevelPatternColors);
  const patternScales = parsePipeNumbers(state.heatmapLevelPatternScales, 1);
  const patternStrokeWidths = parsePipeNumbers(
    state.heatmapLevelPatternStrokeWidths,
    1
  );
  const patternRadii = parsePipeNumbers(state.heatmapLevelPatternRadii, 2);
  const patternComplements = parsePipeBooleans(
    state.heatmapLevelPatternComplements,
    false
  );
  const patternFills = parsePipeField(state.heatmapLevelPatternFills);
  const patternTileBackgrounds = parsePipeField(
    state.heatmapLevelPatternTileBackgrounds
  );
  const patternOpacities = parsePipeNumbers(
    state.heatmapLevelPatternOpacities,
    1
  );
  const patternDotsFills = parsePipeBooleans(
    state.heatmapLevelPatternDotsFills,
    true
  );

  return {
    color,
    fillMode,
    pattern,
    patternColor: patternColors[level]?.trim() || undefined,
    patternScale: patternScales[level],
    patternStrokeWidth: patternStrokeWidths[level],
    patternRadius: patternRadii[level],
    patternComplement: patternComplements[level],
    patternFill: patternFills[level]?.trim() || undefined,
    patternTileBackground: patternTileBackgrounds[level]?.trim() || undefined,
    patternOpacity: patternOpacities[level],
    patternDotsFill: patternDotsFills[level],
  };
}

export function studioHeatmapLevelColors(
  state: StudioUrlState
): HeatmapLevelColors {
  return [
    String(state.heatmapLevel0Color),
    String(state.heatmapLevel1Color),
    String(state.heatmapLevel2Color),
    String(state.heatmapLevel3Color),
    String(state.heatmapLevel4Color),
  ];
}

export function studioHeatmapLevelStyles(
  state: StudioUrlState
): HeatmapLevelStyles {
  const colors = studioHeatmapLevelColors(state);
  const fillModes = parseHeatmapLevelFillModes(state);
  const patterns = parseHeatmapLevelPatterns(state);

  return [
    buildLevelStyle(
      state,
      0,
      colors[0],
      fillModes[0] ?? "solid",
      patterns[0] ?? "none"
    ),
    buildLevelStyle(
      state,
      1,
      colors[1],
      fillModes[1] ?? "solid",
      patterns[1] ?? "none"
    ),
    buildLevelStyle(
      state,
      2,
      colors[2],
      fillModes[2] ?? "solid",
      patterns[2] ?? "none"
    ),
    buildLevelStyle(
      state,
      3,
      colors[3],
      fillModes[3] ?? "solid",
      patterns[3] ?? "none"
    ),
    buildLevelStyle(
      state,
      4,
      colors[4],
      fillModes[4] ?? "solid",
      patterns[4] ?? "none"
    ),
  ];
}

export function studioHeatmapLevelColorKey(
  level: number
): (typeof HEATMAP_LEVEL_COLOR_KEYS)[number] {
  return HEATMAP_LEVEL_COLOR_KEYS[level] ?? HEATMAP_LEVEL_COLOR_KEYS[0];
}

export function studioHeatmapLevelUsesPattern(
  state: StudioUrlState,
  level: number
): boolean {
  return parseHeatmapLevelFillModes(state)[level] === "pattern";
}

export function studioHeatmapLevelPattern(
  state: StudioUrlState,
  level: number
): PatternPresetId {
  const pattern = parseHeatmapLevelPatterns(state)[level] ?? "none";
  return pattern === "none" ? "diagonal" : pattern;
}

export function studioHeatmapLevelPatternColor(
  state: StudioUrlState,
  level: number
): string {
  return parsePipeField(state.heatmapLevelPatternColors)[level]?.trim() ?? "";
}

export function studioHeatmapLevelPatternScale(
  state: StudioUrlState,
  level: number
): number {
  return parsePipeNumbers(state.heatmapLevelPatternScales, 1)[level] ?? 1;
}

export function studioHeatmapLevelPatternStrokeWidth(
  state: StudioUrlState,
  level: number
): number {
  return parsePipeNumbers(state.heatmapLevelPatternStrokeWidths, 1)[level] ?? 1;
}

export function studioHeatmapLevelPatternRadius(
  state: StudioUrlState,
  level: number
): number {
  return parsePipeNumbers(state.heatmapLevelPatternRadii, 2)[level] ?? 2;
}

export function studioHeatmapLevelPatternComplement(
  state: StudioUrlState,
  level: number
): boolean {
  return (
    parsePipeBooleans(state.heatmapLevelPatternComplements, false)[level] ??
    false
  );
}

export function studioHeatmapLevelPatternFill(
  state: StudioUrlState,
  level: number
): string {
  return parsePipeField(state.heatmapLevelPatternFills)[level]?.trim() ?? "";
}

export function studioHeatmapLevelPatternTileBackground(
  state: StudioUrlState,
  level: number
): string {
  return (
    parsePipeField(state.heatmapLevelPatternTileBackgrounds)[level]?.trim() ??
    ""
  );
}

export function studioHeatmapLevelPatternOpacity(
  state: StudioUrlState,
  level: number
): number {
  return parsePipeNumbers(state.heatmapLevelPatternOpacities, 1)[level] ?? 1;
}

export function studioHeatmapLevelPatternDotsFill(
  state: StudioUrlState,
  level: number
): boolean {
  return (
    parsePipeBooleans(state.heatmapLevelPatternDotsFills, true)[level] ?? true
  );
}

export function setStudioHeatmapLevelUsesPattern(
  state: StudioUrlState,
  level: number,
  enabled: boolean
): string {
  const modes = parseHeatmapLevelFillModes(state);
  modes[level] = enabled ? "pattern" : "solid";
  return serializePipeField(modes);
}

export function setStudioHeatmapLevelPattern(
  state: StudioUrlState,
  level: number,
  pattern: PatternPresetId
): string {
  const patterns = parseHeatmapLevelPatterns(state);
  patterns[level] = pattern;
  return serializePipeField(patterns);
}

export function setStudioHeatmapLevelPatternColor(
  state: StudioUrlState,
  level: number,
  color: string
): string {
  const values = parsePipeField(state.heatmapLevelPatternColors);
  return setPipeString(
    Array.from(
      { length: HEATMAP_LEVEL_COUNT },
      (_, index) => values[index] ?? ""
    ),
    level,
    color
  );
}

export function setStudioHeatmapLevelPatternScale(
  state: StudioUrlState,
  level: number,
  scale: number
): string {
  return setPipeNumber(
    parsePipeNumbers(state.heatmapLevelPatternScales, 1),
    level,
    scale
  );
}

export function setStudioHeatmapLevelPatternStrokeWidth(
  state: StudioUrlState,
  level: number,
  strokeWidth: number
): string {
  return setPipeNumber(
    parsePipeNumbers(state.heatmapLevelPatternStrokeWidths, 1),
    level,
    strokeWidth
  );
}

export function setStudioHeatmapLevelPatternRadius(
  state: StudioUrlState,
  level: number,
  radius: number
): string {
  return setPipeNumber(
    parsePipeNumbers(state.heatmapLevelPatternRadii, 2),
    level,
    radius
  );
}

export function setStudioHeatmapLevelPatternComplement(
  state: StudioUrlState,
  level: number,
  complement: boolean
): string {
  return setPipeBoolean(
    parsePipeBooleans(state.heatmapLevelPatternComplements, false),
    level,
    complement
  );
}

export function setStudioHeatmapLevelPatternFill(
  state: StudioUrlState,
  level: number,
  fill: string
): string {
  const values = parsePipeField(state.heatmapLevelPatternFills);
  return setPipeString(
    Array.from(
      { length: HEATMAP_LEVEL_COUNT },
      (_, index) => values[index] ?? ""
    ),
    level,
    fill
  );
}

export function setStudioHeatmapLevelPatternTileBackground(
  state: StudioUrlState,
  level: number,
  tileBackground: string
): string {
  const values = parsePipeField(state.heatmapLevelPatternTileBackgrounds);
  return setPipeString(
    Array.from(
      { length: HEATMAP_LEVEL_COUNT },
      (_, index) => values[index] ?? ""
    ),
    level,
    tileBackground
  );
}

export function setStudioHeatmapLevelPatternOpacity(
  state: StudioUrlState,
  level: number,
  opacity: number
): string {
  return setPipeNumber(
    parsePipeNumbers(state.heatmapLevelPatternOpacities, 1),
    level,
    opacity
  );
}

export function setStudioHeatmapLevelPatternDotsFill(
  state: StudioUrlState,
  level: number,
  dotsFill: boolean
): string {
  return setPipeBoolean(
    parsePipeBooleans(state.heatmapLevelPatternDotsFills, true),
    level,
    dotsFill
  );
}
