import type {
  ChartPalette,
  ChartPaletteColors,
  ChartPaletteMode,
  ChartPaletteVarName,
} from "@bklitui/studio/chart-palettes";
import { CHART_THEME_VAR_NAMES } from "@/lib/chart-themes";

export type ChartThemeMode = ChartPaletteMode;

/** Live (uncommitted) color edits for one mode, merged over the palette. */
export type ChartThemePreview = {
  mode: ChartThemeMode;
  vars: Partial<Record<ChartPaletteVarName, string>>;
} | null;

function resolveVars(
  theme: ChartPalette,
  mode: ChartThemeMode,
  preview: ChartThemePreview
): ChartPaletteColors {
  const base = mode === "dark" ? theme.dark : theme.light;
  if (!preview || preview.mode !== mode) {
    return base;
  }
  return { ...base, ...preview.vars };
}

export function applyChartThemeVarsToElement(
  element: HTMLElement,
  theme: ChartPalette,
  mode: ChartThemeMode,
  preview: ChartThemePreview = null
) {
  const vars = resolveVars(theme, mode, preview);
  for (const name of CHART_THEME_VAR_NAMES) {
    element.style.setProperty(`--${name}`, vars[name]);
  }
}

export function applyChartThemeVars(
  theme: ChartPalette,
  options: {
    rootMode: ChartThemeMode;
    studioMode?: ChartThemeMode;
    studioElement?: HTMLElement | null;
    preview?: ChartThemePreview;
  }
) {
  const preview = options.preview ?? null;
  applyChartThemeVarsToElement(
    document.documentElement,
    theme,
    options.rootMode,
    preview
  );

  const studioShell =
    options.studioElement ??
    document.querySelector<HTMLElement>(".studio-shell");

  if (studioShell) {
    applyChartThemeVarsToElement(
      studioShell,
      theme,
      options.studioMode ?? options.rootMode,
      preview
    );
  }
}

export function resolveChartThemeModeFromElement(
  element: HTMLElement
): ChartThemeMode {
  return element.classList.contains("dark") ? "dark" : "light";
}
