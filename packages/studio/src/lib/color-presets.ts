import type { CSSProperties } from "react";
import {
  CHART_PALETTE_VAR_NAMES,
  CHART_PALETTES,
  type ChartPaletteMode,
  chartPaletteColors,
  getChartPalette,
  isChartPaletteId,
} from "./chart-palettes";
import { CHART_PALETTE_DERIVED_VARS } from "./svg-export/chart-var-aliases";

/**
 * Studio `preset` URL values. `default` inherits the site palette (docs header
 * picker, `Primary` out of the box); the rest come from `chart-palettes.ts`.
 * Legacy ids (lime, violet, warm, mono) fail the URL parser and fall back to `default`.
 */
export const COLOR_PRESET_IDS = [
  "default",
  "primary",
  "monochrome",
  "ocean",
  "sunset",
  "grove",
  "vivid",
] as const;

export type ColorPresetId = (typeof COLOR_PRESET_IDS)[number];

export interface ColorPreset {
  id: ColorPresetId;
  label: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "default", label: "Site palette" },
  ...CHART_PALETTES.filter((palette) =>
    (COLOR_PRESET_IDS as readonly string[]).includes(palette.id)
  ).map((palette) => ({
    id: palette.id as ColorPresetId,
    label: palette.name,
  })),
];

/** Resolved light/dark mode for Studio palette values outside React. */
export function readStudioPaletteMode(): ChartPaletteMode {
  if (typeof document === "undefined") {
    return "light";
  }
  const shell = document.querySelector(".studio-shell");
  const element = shell ?? document.documentElement;
  return element.classList.contains("dark") ? "dark" : "light";
}

/** `--chart-*` overrides for a preset (empty for `default`). */
export function presetVars(
  id: ColorPresetId,
  mode: ChartPaletteMode = readStudioPaletteMode()
): Record<string, string> {
  if (id === "default" || !isChartPaletteId(id)) {
    return {};
  }
  const colors = chartPaletteColors(getChartPalette(id), mode);
  return Object.fromEntries(
    CHART_PALETTE_VAR_NAMES.map((name) => [`--${name}`, colors[name]])
  );
}

/** Overrides --chart-1 … --chart-5 (+ positive / negative) on the preview wrapper */
export function presetStyle(
  id: ColorPresetId,
  chartAccent?: string,
  mode?: ChartPaletteMode
): CSSProperties {
  const vars = presetVars(id, mode);
  const accent = chartAccent?.trim();

  if (accent) {
    vars["--chart-1"] = accent;
  }

  if (Object.keys(vars).length > 0) {
    Object.assign(vars, CHART_PALETTE_DERIVED_VARS);
  }

  return vars as CSSProperties;
}

/** Representative swatch for preset picker (chart-1). */
export function presetSwatchColor(id: ColorPresetId): string {
  return presetVars(id)["--chart-1"] ?? "var(--chart-1)";
}

/** Chart-1 … chart-5 colors for palette strips (CSS vars for `default`). */
export function presetSwatchColors(
  id: ColorPresetId,
  mode?: ChartPaletteMode
): string[] {
  const vars = presetVars(id, mode);
  return [1, 2, 3, 4, 5].map(
    (index) => vars[`--chart-${index}`] ?? `var(--chart-${index})`
  );
}

/** Three-slice (chart-1 … chart-3) conic preview for palette circles. */
export function presetSwatchGradient(
  id: ColorPresetId,
  mode?: ChartPaletteMode
): string {
  const [chart1, chart2, chart3] = presetSwatchColors(id, mode);
  return `conic-gradient(${chart1} 0 33%, ${chart2} 0 66%, ${chart3} 0)`;
}
