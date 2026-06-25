import type { ChartColorTheme } from "./types";

/** Example alternate theme — copy this file to add new palettes. */
export const warmChartTheme: ChartColorTheme = {
  id: "warm",
  name: "Warm",
  swatch: {
    foreground: "var(--color-amber-500)",
    background: "var(--color-orange-400)",
  },
  light: {
    "chart-1": "var(--color-amber-800)",
    "chart-2": "var(--color-amber-600)",
    "chart-3": "var(--color-amber-500)",
    "chart-4": "var(--color-amber-400)",
    "chart-5": "var(--color-amber-200)",
    "chart-scale-01": "var(--color-amber-100)",
    "chart-scale-02": "var(--color-amber-300)",
    "chart-scale-03": "var(--color-amber-400)",
    "chart-scale-04": "var(--color-amber-500)",
    "chart-scale-05": "var(--color-amber-600)",
  },
  dark: {
    "chart-1": "var(--color-amber-700)",
    "chart-2": "var(--color-amber-600)",
    "chart-3": "var(--color-amber-500)",
    "chart-4": "var(--color-amber-400)",
    "chart-5": "var(--color-amber-300)",
    "chart-scale-01": "var(--color-amber-950)",
    "chart-scale-02": "var(--color-amber-800)",
    "chart-scale-03": "var(--color-amber-600)",
    "chart-scale-04": "var(--color-amber-400)",
    "chart-scale-05": "var(--color-amber-300)",
  },
};
