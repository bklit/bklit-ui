import {
  CHART_PALETTE_VAR_NAMES,
  CHART_PALETTES,
  type ChartPalette,
  type ChartPaletteColors,
  CUSTOM_CHART_PALETTE_ID,
  DEFAULT_CHART_PALETTE_ID,
  getChartPalette,
  isChartPaletteId,
} from "@bklitui/studio/chart-palettes";

/**
 * Docs site chart palettes (header picker). Palette data is shared with Studio
 * in `packages/studio/src/lib/chart-palettes.ts`.
 */
export const DEFAULT_CHART_THEME_ID = DEFAULT_CHART_PALETTE_ID;

export const CUSTOM_CHART_THEME_ID = CUSTOM_CHART_PALETTE_ID;

export const CUSTOM_CHART_THEME_NAME = "Custom";

export const chartThemes: ChartPalette[] = CHART_PALETTES;

export const CHART_THEME_VAR_NAMES = CHART_PALETTE_VAR_NAMES;

/** localStorage key for the user's custom palette (`{ light, dark }`). */
export const CUSTOM_CHART_THEME_STORAGE_KEY = "bklit-chart-palette-custom";

export function getChartTheme(id: string): ChartPalette {
  return getChartPalette(id);
}

/** Valid cookie value: a built-in palette id or `custom`. Legacy ids are invalid. */
export function isValidChartThemeId(id: string): boolean {
  return isChartPaletteId(id) || id === CUSTOM_CHART_THEME_ID;
}

export function createCustomChartTheme(colors: {
  light: ChartPaletteColors;
  dark: ChartPaletteColors;
}): ChartPalette {
  return {
    id: CUSTOM_CHART_THEME_ID,
    name: CUSTOM_CHART_THEME_NAME,
    light: colors.light,
    dark: colors.dark,
  };
}

/** Serializable theme data for the blocking inline script. */
export interface ChartThemeScriptEntry {
  id: string;
  light: ChartPaletteColors;
  dark: ChartPaletteColors;
}

export const CHART_THEMES_SCRIPT_DATA: ChartThemeScriptEntry[] =
  chartThemes.map((theme) => ({
    id: theme.id,
    light: theme.light,
    dark: theme.dark,
  }));
