import type { CSSProperties } from "react";
import type { BklitThemeMode } from "@/lib/bklit-shadcn-theme-tokens";

/** Chart + legend semantic tokens from `bklit-tokens.css`. */
export const BKLIT_CHART_THEME_TOKEN_NAMES = [
  "chart-background",
  "chart-foreground",
  "chart-foreground-muted",
  "chart-line-primary",
  "chart-line-secondary",
  "chart-crosshair",
  "chart-grid",
  "chart-brush-border",
  "chart-tooltip-background",
  "chart-tooltip-foreground",
  "chart-tooltip-muted",
  "chart-indicator-color",
  "chart-indicator-secondary-color",
  "chart-marker-background",
  "chart-marker-border",
  "chart-marker-foreground",
  "chart-marker-badge-background",
  "chart-marker-badge-foreground",
  "chart-segment-background",
  "chart-segment-line",
  "chart-label",
  "legend",
  "legend-foreground",
  "legend-muted",
  "legend-muted-foreground",
  "legend-track",
] as const;

export type BklitChartThemeTokenName =
  (typeof BKLIT_CHART_THEME_TOKEN_NAMES)[number];

export type BklitChartThemeTokens = Record<BklitChartThemeTokenName, string>;

const BKLIT_CHART_THEME_LIGHT: BklitChartThemeTokens = {
  "chart-background": "oklch(1 0 0)",
  "chart-foreground": "oklch(0.145 0.004 285)",
  "chart-foreground-muted": "oklch(0.55 0.014 260)",
  "chart-line-primary": "var(--chart-1)",
  "chart-line-secondary": "var(--chart-2)",
  "chart-crosshair": "oklch(0.4 0.1828 274.34)",
  "chart-grid": "oklch(0.9 0 0)",
  "chart-brush-border": "var(--chart-grid)",
  "chart-tooltip-background": "var(--popover)",
  "chart-tooltip-foreground": "var(--popover-foreground)",
  "chart-tooltip-muted": "var(--muted-foreground)",
  "chart-indicator-color": "oklch(0.21 0.006 285)",
  "chart-indicator-secondary-color": "oklch(1 0 0)",
  "chart-marker-background": "oklch(0.97 0.005 260)",
  "chart-marker-border": "oklch(0.85 0.01 260)",
  "chart-marker-foreground": "oklch(0.3 0.01 260)",
  "chart-marker-badge-background": "oklch(0 0 0)",
  "chart-marker-badge-foreground": "oklch(1 0 0)",
  "chart-segment-background": "oklch(0.5 0 0 / 0.06)",
  "chart-segment-line": "oklch(0.5 0 0 / 0.25)",
  "chart-label": "oklch(0.45 0.01 260)",
  legend: "oklch(1 0 0)",
  "legend-foreground": "oklch(0.141 0.005 285.823)",
  "legend-muted": "oklch(0.967 0.001 286.375)",
  "legend-muted-foreground": "oklch(0.552 0.016 285.938)",
  "legend-track": "oklch(0.92 0.004 286.32)",
};

const BKLIT_CHART_THEME_DARK_OVERRIDES: Partial<BklitChartThemeTokens> = {
  "chart-background": "oklch(0.145 0 0)",
  "chart-foreground": "oklch(0.45 0 0)",
  "chart-foreground-muted": "oklch(0.65 0.01 260)",
  "chart-crosshair": "oklch(0.72 0.0158 281.84)",
  "chart-grid": "oklch(0.6 0.0124 243.77 / 0.25)",
  "chart-indicator-color": "oklch(1 0 0)",
  "chart-indicator-secondary-color": "oklch(0.145 0 0)",
  "chart-marker-background": "oklch(0.25 0.01 260)",
  "chart-marker-border": "oklch(0.4 0.01 260)",
  "chart-marker-foreground": "oklch(0.9 0 0)",
  "chart-marker-badge-background": "oklch(1 0 0)",
  "chart-marker-badge-foreground": "oklch(0.15 0 0)",
  "chart-segment-background": "oklch(0.41 0.0127 248.14 / 0.25)",
  "chart-segment-line": "oklch(1 0 0 / 0.25)",
  "chart-label": "oklch(0.75 0.01 260)",
  legend: "oklch(0.21 0.006 285.885)",
  "legend-foreground": "oklch(0.985 0 0)",
  "legend-muted": "oklch(0.274 0.006 286.033)",
  "legend-muted-foreground": "oklch(0.705 0.015 286.067)",
  "legend-track": "oklch(0.274 0.006 286.033)",
};

export const BKLIT_CHART_THEME_TOKEN_DEFAULTS: Record<
  BklitThemeMode,
  BklitChartThemeTokens
> = {
  light: BKLIT_CHART_THEME_LIGHT,
  dark: {
    ...BKLIT_CHART_THEME_LIGHT,
    ...BKLIT_CHART_THEME_DARK_OVERRIDES,
  },
};

export function resolveBklitChartThemeTokens(
  theme: BklitThemeMode,
  overrides: Partial<BklitChartThemeTokens> = {}
): BklitChartThemeTokens {
  return {
    ...BKLIT_CHART_THEME_TOKEN_DEFAULTS[theme],
    ...overrides,
  };
}

export function bklitChartThemeTokensToCssProperties(
  tokens: BklitChartThemeTokens
): CSSProperties {
  const style: Record<string, string> = {};
  for (const name of BKLIT_CHART_THEME_TOKEN_NAMES) {
    style[`--${name}`] = tokens[name];
  }
  return style as CSSProperties;
}

export function formatBklitChartThemeTokensCss(
  theme: BklitThemeMode,
  tokens: BklitChartThemeTokens
): string {
  const selector =
    theme === "dark" ? ".dark,\n.studio-shell.dark" : ":root,\n.studio-shell";
  const comment =
    theme === "dark"
      ? "Chart component dark variables"
      : "Chart component semantic colors";
  const lines = BKLIT_CHART_THEME_TOKEN_NAMES.map(
    (name) => `  --${name}: ${tokens[name]};`
  );

  return `${selector} {\n  /* ${comment} */\n${lines.join("\n")}\n}`;
}

export function formatBklitChartThemeTokenLabel(
  name: BklitChartThemeTokenName
): string {
  return name.replaceAll("-", " ");
}
