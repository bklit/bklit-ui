import type { CSSProperties } from "react";
import type { ChartSlug } from "@/chart-slugs";
import { resolveCssColor } from "@/lib/chart-theme-color";
import { type ColorPresetId, presetStyle } from "@/lib/color-presets";
import { clampStudioSeriesCount, STUDIO_SERIES_KEYS } from "@/lib/demo-data";
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

const SERIES_FIELD_SEP = "|";

export type SeriesFillMode = "solid" | "pattern";

export function getDesignSeriesCount(
  chart: ChartSlug,
  state: StudioUrlState
): number {
  if (CHARTS_WITH_DATA_SERIES.has(chart)) {
    return clampStudioSeriesCount(state.dataSeries);
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
  if (raw == null || !raw.trim()) {
    return [];
  }
  return raw.split(SERIES_FIELD_SEP).map((part) => {
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
  return resolveCssColor(`var(${varName})`);
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
