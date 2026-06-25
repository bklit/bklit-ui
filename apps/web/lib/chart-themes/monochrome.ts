import type { ChartColorTheme } from "./types";

/** Default palette — stone (light) / zinc (dark) from bklit-tokens.css. No overrides. */
export const monochromeChartTheme: ChartColorTheme = {
  id: "monochrome",
  name: "Monochrome",
  swatch: {
    foreground: "var(--color-stone-500)",
    background: "var(--color-zinc-400)",
  },
  light: {},
  dark: {},
};
