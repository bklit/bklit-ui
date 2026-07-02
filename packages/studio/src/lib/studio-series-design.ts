import { buildArcs } from "@bklitui/ui/charts";
import type { CSSProperties } from "react";
import type { ChartSlug } from "@/chart-slugs";
import { type ColorPresetId, presetStyle } from "@/lib/color-presets";
import {
  clampStudioSeriesCount,
  STUDIO_SERIES_KEYS,
  sunburstData,
} from "@/lib/demo-data";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { PATTERN_PRESET_IDS } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { CHART_PALETTE_DERIVED_VARS } from "@/lib/svg-export/chart-var-aliases";

const CHARTS_WITH_DATA_SERIES = new Set<ChartSlug>([
  "area-chart",
  "line-chart",
  "bar-chart",
  "composed-chart",
]);

const CHART_FIXED_SERIES_COUNTS: Partial<Record<ChartSlug, number>> = {
  "pie-chart": 5,
  "funnel-chart": 5,
  "ring-chart": 4,
  "radar-chart": 2,
};

export function getSunburstArcCount(): number {
  return buildArcs(sunburstData).arcs.length;
}

const SERIES_FIELD_SEP = "|";

export type SeriesFillMode = "solid" | "pattern";

export function getDesignSeriesCount(
  chart: ChartSlug,
  state: StudioUrlState
): number {
  if (CHARTS_WITH_DATA_SERIES.has(chart)) {
    return clampStudioSeriesCount(state.dataSeries);
  }
  if (chart === "sunburst-chart") {
    return getSunburstArcCount();
  }
  const fixed = CHART_FIXED_SERIES_COUNTS[chart];
  if (fixed !== undefined) {
    return fixed;
  }
  return 1;
}

export function getDesignSeriesLabel(index: number): string {
  const key = STUDIO_SERIES_KEYS[index];
  if (!key) {
    return `Series ${index + 1}`;
  }
  return `Series ${index + 1} · ${key}`;
}

export function parsePipeField(raw: string | null | undefined): string[] {
  const text = raw == null ? "" : String(raw);
  if (!text.trim()) {
    return [];
  }
  return text.split(SERIES_FIELD_SEP).map((part) => {
    if (!part) {
      return "";
    }
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });
}

export function serializePipeField(values: string[]): string {
  return values
    .map((value) => (value.trim() ? encodeURIComponent(value.trim()) : ""))
    .join(SERIES_FIELD_SEP);
}

export function parseSeriesColors(state: StudioUrlState): string[] {
  const parsed = parsePipeField(state.seriesColors);
  if (parsed.length === 0 && state.chartAccent?.trim()) {
    return [state.chartAccent.trim()];
  }
  return parsed;
}

export function parseSeriesPatterns(state: StudioUrlState): PatternPresetId[] {
  if (!state.seriesPatterns?.trim()) {
    if (state.pattern !== "none") {
      return [state.pattern];
    }
    return [];
  }

  return parsePipeField(state.seriesPatterns).map((part) =>
    isPatternPresetId(part) ? part : "none"
  );
}

function isPatternPresetId(value: string): value is PatternPresetId {
  return (PATTERN_PRESET_IDS as readonly string[]).includes(value);
}

export function getSeriesColorOverride(
  state: StudioUrlState,
  seriesIndex: number
): string {
  return parseSeriesColors(state)[seriesIndex]?.trim() ?? "";
}

export function getSeriesPattern(
  state: StudioUrlState,
  seriesIndex: number
): PatternPresetId {
  const patterns = parseSeriesPatterns(state);
  if (patterns[seriesIndex] !== undefined) {
    return patterns[seriesIndex];
  }
  if (seriesIndex === 0 && state.pattern !== "none") {
    return state.pattern;
  }
  return "none";
}

export function getSeriesFillMode(
  state: StudioUrlState,
  seriesIndex: number
): SeriesFillMode {
  return getSeriesPattern(state, seriesIndex) === "none" ? "solid" : "pattern";
}

export function chartCssVarForSeriesIndex(seriesIndex: number): string {
  return `--chart-${(seriesIndex % 5) + 1}`;
}

export function getEffectiveSeriesColor(
  state: StudioUrlState,
  seriesIndex: number
): string {
  const override = getSeriesColorOverride(state, seriesIndex);
  if (override) {
    return override;
  }
  return defaultSeriesColor(state.preset, seriesIndex);
}

export function defaultSeriesColor(
  preset: ColorPresetId,
  seriesIndex: number
): string {
  const varName = chartCssVarForSeriesIndex(seriesIndex);
  const presetVars = presetStyle(preset) as Record<string, string>;
  if (presetVars[varName]) {
    return presetVars[varName];
  }
  return `var(${varName})`;
}

export function resolveChartThemeStyle(state: StudioUrlState): CSSProperties {
  const preset = state.preset;
  const colors = parseSeriesColors(state);
  const vars: Record<string, string> = {
    ...(presetStyle(preset) as Record<string, string>),
  };

  for (let index = 0; index < 5; index += 1) {
    const override = colors[index]?.trim();
    if (override) {
      vars[chartCssVarForSeriesIndex(index)] = override;
    }
  }

  if (Object.keys(vars).length > 0) {
    Object.assign(vars, CHART_PALETTE_DERIVED_VARS);
  }

  return vars as CSSProperties;
}

export function buildSeriesColorsUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  color: string
): string {
  const count = getDesignSeriesCount(state.chart, state);
  const current = Array.from({ length: count }, (_, index) =>
    getSeriesColorOverride(state, index)
  );
  current[seriesIndex] = color.trim();
  return serializePipeField(current);
}

export function buildSeriesPatternsUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  pattern: PatternPresetId
): string {
  const count = getDesignSeriesCount(state.chart, state);
  const current = Array.from({ length: count }, (_, index) =>
    getSeriesPattern(state, index)
  );
  current[seriesIndex] = pattern;
  return serializePipeField(current);
}

export function buildSeriesFillModeUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  mode: SeriesFillMode
): { seriesPatterns: string; seriesColors?: string } {
  let pattern: PatternPresetId = "none";
  if (mode === "pattern") {
    const current = getSeriesPattern(state, seriesIndex);
    pattern = current === "none" ? "diagonal" : current;
  }

  return {
    seriesPatterns: buildSeriesPatternsUpdate(state, seriesIndex, pattern),
  };
}

export interface SeriesGradientStop {
  offset: number;
  color: string;
}

const GRADIENT_STOP_SEP = ",";
const GRADIENT_OFFSET_SEP = ":";

function parseSeriesGradientStopField(raw: string): SeriesGradientStop[] {
  if (!raw.trim()) {
    return [];
  }
  return raw.split(GRADIENT_STOP_SEP).map((part) => {
    const [offsetRaw, ...colorParts] = part.split(GRADIENT_OFFSET_SEP);
    const color = colorParts.join(GRADIENT_OFFSET_SEP).trim();
    const offset = Number.parseFloat(offsetRaw ?? "0");
    return {
      offset: Number.isFinite(offset) ? offset : 0,
      color: color || "var(--chart-1)",
    };
  });
}

function serializeSeriesGradientStops(stops: SeriesGradientStop[]): string {
  return stops
    .map(
      ({ offset, color }) => `${offset}${GRADIENT_OFFSET_SEP}${color.trim()}`
    )
    .join(GRADIENT_STOP_SEP);
}

export function parseSeriesGradientEnabledFlags(
  state: StudioUrlState
): boolean[] {
  return parsePipeField(state.seriesGradientEnabled).map(
    (part) => part === "true"
  );
}

export function getSeriesGradientEnabled(
  state: StudioUrlState,
  seriesIndex: number
): boolean {
  return parseSeriesGradientEnabledFlags(state)[seriesIndex] ?? false;
}

export function parseSeriesGradientStopsBySeries(
  state: StudioUrlState
): SeriesGradientStop[][] {
  return parsePipeField(state.seriesGradientStops).map((part) =>
    parseSeriesGradientStopField(part)
  );
}

export function getSeriesGradientStops(
  state: StudioUrlState,
  seriesIndex: number
): SeriesGradientStop[] {
  const parsed = parseSeriesGradientStopsBySeries(state)[seriesIndex];
  if (parsed && parsed.length >= 2) {
    return parsed;
  }
  const base = getEffectiveSeriesColor(state, seriesIndex);
  return [
    { offset: 0, color: base },
    { offset: 100, color: base },
  ];
}

export function buildSeriesGradientEnabledUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  enabled: boolean
): string {
  const count = getDesignSeriesCount(state.chart, state);
  const current = Array.from({ length: count }, (_, index) =>
    getSeriesGradientEnabled(state, index)
  );
  current[seriesIndex] = enabled;
  return serializePipeField(current.map((value) => (value ? "true" : "false")));
}

export function buildSeriesGradientStopsUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  stops: SeriesGradientStop[]
): string {
  const count = getDesignSeriesCount(state.chart, state);
  const current = Array.from({ length: count }, (_, index) =>
    serializeSeriesGradientStops(getSeriesGradientStops(state, index))
  );
  current[seriesIndex] = serializeSeriesGradientStops(stops);
  return serializePipeField(current);
}
