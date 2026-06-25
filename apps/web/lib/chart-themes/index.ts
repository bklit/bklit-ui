import { forestChartTheme } from "./forest";
import { lagoonChartTheme } from "./lagoon";
import { monochromeChartTheme } from "./monochrome";
import type { ChartColorTheme, ChartThemeScriptEntry } from "./types";
import { warmChartTheme } from "./warm";

export const DEFAULT_CHART_THEME_ID = monochromeChartTheme.id;

export const chartThemes: ChartColorTheme[] = [
  monochromeChartTheme,
  warmChartTheme,
  forestChartTheme,
  lagoonChartTheme,
];

export const chartThemesById: Record<string, ChartColorTheme> =
  Object.fromEntries(chartThemes.map((theme) => [theme.id, theme]));

export function getChartTheme(id: string): ChartColorTheme {
  return chartThemesById[id] ?? monochromeChartTheme;
}

export function isValidChartThemeId(id: string): boolean {
  return id in chartThemesById;
}

export const CHART_THEMES_SCRIPT_DATA: ChartThemeScriptEntry[] =
  chartThemes.map((theme) => ({
    id: theme.id,
    light: theme.light,
    dark: theme.dark,
  }));
