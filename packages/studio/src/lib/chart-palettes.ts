/**
 * Chart color palettes — single source of truth for the docs header palette
 * picker (apps/web) and the Studio preset picker.
 *
 * Values are literal oklch() matching Tailwind v4 colors (named in comments) so
 * they work without Tailwind theme variables, in SVG export, and in exported CSS.
 * The `primary` palette must stay in sync with `--chart-*` in `bklit-tokens.css`.
 */

export const CHART_PALETTE_VAR_NAMES = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-positive",
  "chart-negative",
] as const;

export type ChartPaletteVarName = (typeof CHART_PALETTE_VAR_NAMES)[number];

export type ChartPaletteColors = Record<ChartPaletteVarName, string>;

export type ChartPaletteMode = "light" | "dark";

export interface ChartPalette {
  id: string;
  name: string;
  light: ChartPaletteColors;
  dark: ChartPaletteColors;
}

export const CHART_PALETTE_VAR_LABELS: Record<ChartPaletteVarName, string> = {
  "chart-1": "Chart 1",
  "chart-2": "Chart 2",
  "chart-3": "Chart 3",
  "chart-4": "Chart 4",
  "chart-5": "Chart 5",
  "chart-positive": "Positive",
  "chart-negative": "Negative",
};

/** Up / down trend colors shared by most palettes (emerald / red). */
const TREND_LIGHT = {
  "chart-positive": "oklch(0.696 0.17 162.48)", // emerald-500
  "chart-negative": "oklch(0.637 0.237 25.331)", // red-500
} as const;

const TREND_DARK = {
  "chart-positive": "oklch(0.765 0.177 163.223)", // emerald-400
  "chart-negative": "oklch(0.704 0.191 22.216)", // red-400
} as const;

export const primaryChartPalette: ChartPalette = {
  id: "primary",
  name: "Primary",
  light: {
    "chart-1": "oklch(0.585 0.233 277.117)", // indigo-500
    "chart-2": "oklch(0.852 0.199 91.936)", // yellow-400
    "chart-3": "oklch(0.667 0.295 322.15)", // fuchsia-500
    "chart-4": "oklch(0.56 0.021 213.5)", // mist-500 (Tailwind v4.2)
    "chart-5": "oklch(0 0 0)", // black
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.585 0.233 277.117)", // indigo-500
    "chart-2": "oklch(0.852 0.199 91.936)", // yellow-400
    "chart-3": "oklch(0.667 0.295 322.15)", // fuchsia-500
    "chart-4": "oklch(0.56 0.021 213.5)", // mist-500 (Tailwind v4.2)
    "chart-5": "oklch(1 0 0)", // white
    ...TREND_DARK,
  },
};

export const monochromeChartPalette: ChartPalette = {
  id: "monochrome",
  name: "Monochrome",
  light: {
    "chart-1": "oklch(0.268 0.007 34.298)", // stone-800
    "chart-2": "oklch(0.444 0.011 73.639)", // stone-600
    "chart-3": "oklch(0.709 0.01 56.259)", // stone-400
    "chart-4": "oklch(0.869 0.005 56.366)", // stone-300
    "chart-5": "oklch(0.923 0.003 48.717)", // stone-200
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.967 0.001 286.375)", // zinc-100
    "chart-2": "oklch(0.871 0.006 286.286)", // zinc-300
    "chart-3": "oklch(0.705 0.015 286.067)", // zinc-400
    "chart-4": "oklch(0.552 0.016 285.938)", // zinc-500
    "chart-5": "oklch(0.442 0.017 285.786)", // zinc-600
    ...TREND_DARK,
  },
};

export const oceanChartPalette: ChartPalette = {
  id: "ocean",
  name: "Ocean",
  light: {
    "chart-1": "oklch(0.546 0.245 262.881)", // blue-600
    "chart-2": "oklch(0.715 0.143 215.221)", // cyan-500
    "chart-3": "oklch(0.777 0.152 181.912)", // teal-400
    "chart-4": "oklch(0.673 0.182 276.935)", // indigo-400
    "chart-5": "oklch(0.828 0.111 230.318)", // sky-300
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.623 0.214 259.815)", // blue-500
    "chart-2": "oklch(0.789 0.154 211.53)", // cyan-400
    "chart-3": "oklch(0.855 0.138 181.071)", // teal-300
    "chart-4": "oklch(0.785 0.115 274.713)", // indigo-300
    "chart-5": "oklch(0.901 0.058 230.902)", // sky-200
    ...TREND_DARK,
  },
};

export const sunsetChartPalette: ChartPalette = {
  id: "sunset",
  name: "Sunset",
  light: {
    "chart-1": "oklch(0.705 0.213 47.604)", // orange-500
    "chart-2": "oklch(0.645 0.246 16.439)", // rose-500
    "chart-3": "oklch(0.828 0.189 84.429)", // amber-400
    "chart-4": "oklch(0.627 0.265 303.9)", // purple-500
    "chart-5": "oklch(0.823 0.12 346.018)", // pink-300
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.75 0.183 55.934)", // orange-400
    "chart-2": "oklch(0.712 0.194 13.428)", // rose-400
    "chart-3": "oklch(0.879 0.169 91.605)", // amber-300
    "chart-4": "oklch(0.714 0.203 305.504)", // purple-400
    "chart-5": "oklch(0.899 0.061 343.231)", // pink-200
    ...TREND_DARK,
  },
};

export const groveChartPalette: ChartPalette = {
  id: "grove",
  name: "Grove",
  light: {
    "chart-1": "oklch(0.596 0.145 163.225)", // emerald-600
    "chart-2": "oklch(0.768 0.233 130.85)", // lime-500
    "chart-3": "oklch(0.511 0.096 186.391)", // teal-700
    "chart-4": "oklch(0.769 0.188 70.08)", // amber-500
    "chart-5": "oklch(0.709 0.01 56.259)", // stone-400
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.765 0.177 163.223)", // emerald-400
    "chart-2": "oklch(0.841 0.238 128.85)", // lime-400
    "chart-3": "oklch(0.6 0.118 184.704)", // teal-600
    "chart-4": "oklch(0.828 0.189 84.429)", // amber-400
    "chart-5": "oklch(0.709 0.01 56.259)", // stone-400
    ...TREND_DARK,
  },
};

export const vividChartPalette: ChartPalette = {
  id: "vivid",
  name: "Vivid",
  light: {
    "chart-1": "oklch(0.606 0.25 292.717)", // violet-500
    "chart-2": "oklch(0.656 0.241 354.308)", // pink-500
    "chart-3": "oklch(0.715 0.143 215.221)", // cyan-500
    "chart-4": "oklch(0.768 0.233 130.85)", // lime-500
    "chart-5": "oklch(0.705 0.213 47.604)", // orange-500
    ...TREND_LIGHT,
  },
  dark: {
    "chart-1": "oklch(0.702 0.183 293.541)", // violet-400
    "chart-2": "oklch(0.718 0.202 349.761)", // pink-400
    "chart-3": "oklch(0.865 0.127 207.078)", // cyan-300
    "chart-4": "oklch(0.897 0.196 126.665)", // lime-300
    "chart-5": "oklch(0.75 0.183 55.934)", // orange-400
    ...TREND_DARK,
  },
};

export const CHART_PALETTES: ChartPalette[] = [
  primaryChartPalette,
  monochromeChartPalette,
  oceanChartPalette,
  sunsetChartPalette,
  groveChartPalette,
  vividChartPalette,
];

export const DEFAULT_CHART_PALETTE_ID = primaryChartPalette.id;

/** Id for a user-edited palette (docs header "Customize"). */
export const CUSTOM_CHART_PALETTE_ID = "custom";

const chartPalettesById: Record<string, ChartPalette> = Object.fromEntries(
  CHART_PALETTES.map((palette) => [palette.id, palette])
);

export function isChartPaletteId(id: string): boolean {
  return id in chartPalettesById;
}

/** Built-in palette by id; unknown / legacy ids fall back to the default. */
export function getChartPalette(id: string): ChartPalette {
  return chartPalettesById[id] ?? primaryChartPalette;
}

export function chartPaletteColors(
  palette: ChartPalette,
  mode: ChartPaletteMode
): ChartPaletteColors {
  return mode === "dark" ? palette.dark : palette.light;
}

function isColorRecord(value: unknown): value is ChartPaletteColors {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return CHART_PALETTE_VAR_NAMES.every(
    (name) => typeof record[name] === "string" && record[name] !== ""
  );
}

/** Validate untrusted (e.g. localStorage) palette data. */
export function parseChartPaletteColors(
  value: unknown
): { light: ChartPaletteColors; dark: ChartPaletteColors } | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const { light, dark } = value as { light?: unknown; dark?: unknown };
  if (!(isColorRecord(light) && isColorRecord(dark))) {
    return null;
  }
  const pick = (colors: ChartPaletteColors) =>
    Object.fromEntries(
      CHART_PALETTE_VAR_NAMES.map((name) => [name, colors[name]])
    ) as ChartPaletteColors;
  return { light: pick(light), dark: pick(dark) };
}

function cssBlock(selector: string, colors: ChartPaletteColors): string {
  const lines = CHART_PALETTE_VAR_NAMES.map(
    (name) => `  --${name}: ${colors[name]};`
  );
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** CSS for a palette — paste into globals.css (shadcn / Tailwind v4 layout). */
export function chartPaletteToCss(palette: ChartPalette): string {
  return `${cssBlock(":root", palette.light)}\n\n${cssBlock(".dark", palette.dark)}\n`;
}
