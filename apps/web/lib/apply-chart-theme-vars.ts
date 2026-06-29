import type {
  ChartColorTheme,
  ChartThemeVarName,
} from "@/lib/chart-themes/types";
import { CHART_THEME_VAR_NAMES } from "@/lib/chart-themes/types";

export type ChartThemeMode = "light" | "dark";

function getThemeVars(theme: ChartColorTheme, mode: ChartThemeMode) {
  return mode === "dark" ? theme.dark : theme.light;
}

function hasThemeOverrides(vars: Partial<Record<ChartThemeVarName, string>>) {
  return Object.keys(vars).length > 0;
}

function applyVarsToElement(
  element: HTMLElement,
  vars: Partial<Record<ChartThemeVarName, string>>,
  clearOverrides: boolean
) {
  for (const name of CHART_THEME_VAR_NAMES) {
    const value = vars[name];

    if (clearOverrides || value === undefined) {
      element.style.removeProperty(`--${name}`);
      continue;
    }

    element.style.setProperty(`--${name}`, value);
  }
}

export function applyChartThemeVarsToElement(
  element: HTMLElement,
  theme: ChartColorTheme,
  mode: ChartThemeMode
) {
  const vars = getThemeVars(theme, mode);
  const clearOverrides = !(
    hasThemeOverrides(theme.light) || hasThemeOverrides(theme.dark)
  );

  applyVarsToElement(element, vars, clearOverrides);
}

export function applyChartThemeVars(
  theme: ChartColorTheme,
  options: {
    rootMode: ChartThemeMode;
    studioMode?: ChartThemeMode;
    studioElement?: HTMLElement | null;
  }
) {
  applyChartThemeVarsToElement(
    document.documentElement,
    theme,
    options.rootMode
  );

  const studioShell =
    options.studioElement ??
    document.querySelector<HTMLElement>(".studio-shell");

  if (studioShell) {
    applyChartThemeVarsToElement(
      studioShell,
      theme,
      options.studioMode ?? options.rootMode
    );
  }
}

export function resolveChartThemeModeFromElement(
  element: HTMLElement
): ChartThemeMode {
  return element.classList.contains("dark") ? "dark" : "light";
}

export function resolveRootChartThemeMode(): ChartThemeMode {
  return resolveChartThemeModeFromElement(document.documentElement);
}

/** Detect dark mode before React hydrates (matches next-themes class strategy). */
export function resolveChartThemeModeForScript(): ChartThemeMode {
  const root = document.documentElement;

  if (root.classList.contains("dark")) {
    return "dark";
  }

  try {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      return "dark";
    }

    if (storedTheme === "light") {
      return "light";
    }

    if (
      storedTheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    // localStorage may be unavailable
  }

  return "light";
}
