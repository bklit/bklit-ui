import type { CSSProperties } from "react";
import { CHART_PALETTE_DERIVED_VARS } from "./svg-export/chart-var-aliases";

export const COLOR_PRESET_IDS = [
  "default",
  "lime",
  "violet",
  "warm",
  "mono",
] as const;

export type ColorPresetId = (typeof COLOR_PRESET_IDS)[number];

export interface ColorPreset {
  id: ColorPresetId;
  label: string;
  vars: Record<string, string>;
}

/** Overrides --chart-1 … --chart-5 on the preview wrapper */
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "default",
    label: "Mist (default)",
    vars: {},
  },
  {
    id: "lime",
    label: "Lime",
    vars: {
      "--chart-1": "oklch(0.84 0.18 128)",
      "--chart-2": "oklch(0.76 0.16 132)",
      "--chart-3": "oklch(0.68 0.14 136)",
      "--chart-4": "oklch(0.58 0.12 140)",
      "--chart-5": "oklch(0.48 0.1 144)",
    },
  },
  {
    id: "violet",
    label: "Violet / cyan",
    vars: {
      "--chart-1": "oklch(0.62 0.22 303)",
      "--chart-2": "oklch(0.72 0.14 220)",
      "--chart-3": "oklch(0.55 0.18 280)",
      "--chart-4": "oklch(0.65 0.12 200)",
      "--chart-5": "oklch(0.45 0.1 260)",
    },
  },
  {
    id: "warm",
    label: "Warm",
    vars: {
      "--chart-1": "oklch(0.75 0.16 55)",
      "--chart-2": "oklch(0.68 0.18 35)",
      "--chart-3": "oklch(0.62 0.2 25)",
      "--chart-4": "oklch(0.55 0.16 15)",
      "--chart-5": "oklch(0.48 0.12 10)",
    },
  },
  {
    id: "mono",
    label: "Monochrome",
    vars: {
      "--chart-1": "oklch(0.35 0.01 260)",
      "--chart-2": "oklch(0.5 0.01 260)",
      "--chart-3": "oklch(0.65 0.01 260)",
      "--chart-4": "oklch(0.78 0.01 260)",
      "--chart-5": "oklch(0.88 0.01 260)",
    },
  },
];

export function presetStyle(id: ColorPresetId): CSSProperties {
  const preset = COLOR_PRESETS.find((p) => p.id === id);
  const vars = { ...(preset?.vars ?? {}) };

  // Re-derive semantic line tokens on the frame so palette overrides flow into
  // Area/Line charts and SVG export even when :root tokens are not re-evaluated.
  if (Object.keys(vars).length > 0) {
    Object.assign(vars, CHART_PALETTE_DERIVED_VARS);
  }

  return vars as CSSProperties;
}

/** Representative swatch for preset picker (chart-1). */
export function presetSwatchColor(id: ColorPresetId): string {
  const preset = COLOR_PRESETS.find((p) => p.id === id);
  return preset?.vars["--chart-1"] ?? "var(--chart-1)";
}
