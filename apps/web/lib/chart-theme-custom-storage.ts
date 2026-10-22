import {
  type ChartPalette,
  parseChartPaletteColors,
} from "@bklitui/studio/chart-palettes";
import {
  CUSTOM_CHART_THEME_STORAGE_KEY,
  createCustomChartTheme,
} from "@/lib/chart-themes";

/**
 * Custom palette colors live in localStorage (the cookie only stores `custom`)
 * so the blocking ChartThemeScript can still apply them before first paint.
 */
export function readCustomChartTheme(): ChartPalette | null {
  try {
    const raw = localStorage.getItem(CUSTOM_CHART_THEME_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const colors = parseChartPaletteColors(JSON.parse(raw));
    return colors ? createCustomChartTheme(colors) : null;
  } catch {
    return null;
  }
}

export function writeCustomChartTheme(theme: ChartPalette) {
  try {
    localStorage.setItem(
      CUSTOM_CHART_THEME_STORAGE_KEY,
      JSON.stringify({ light: theme.light, dark: theme.dark })
    );
  } catch {
    // localStorage may be unavailable (private mode, embedded contexts).
  }
}

export function clearCustomChartTheme() {
  try {
    localStorage.removeItem(CUSTOM_CHART_THEME_STORAGE_KEY);
  } catch {
    // ignore
  }
}
