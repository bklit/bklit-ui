export const CHART_THEME_VAR_NAMES = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-scale-01",
  "chart-scale-02",
  "chart-scale-03",
  "chart-scale-04",
  "chart-scale-05",
] as const;

export type ChartThemeVarName = (typeof CHART_THEME_VAR_NAMES)[number];

export type ChartThemeVars = Partial<Record<ChartThemeVarName, string>>;

export interface ChartThemeSwatch {
  foreground: string;
  background: string;
}

export interface ChartColorTheme {
  id: string;
  name: string;
  swatch: ChartThemeSwatch;
  light: ChartThemeVars;
  dark: ChartThemeVars;
}

/** Serializable theme data for the blocking inline script. */
export interface ChartThemeScriptEntry {
  id: string;
  light: ChartThemeVars;
  dark: ChartThemeVars;
}
