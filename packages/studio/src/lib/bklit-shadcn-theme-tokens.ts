import type { CSSProperties } from "react";

export type BklitThemeMode = "light" | "dark";

/** Shadcn theme tokens from `bklit-tokens.css` (:root / .dark blocks). */
export const BKLIT_SHADCN_THEME_TOKEN_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "radius",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export type BklitShadcnThemeTokenName =
  (typeof BKLIT_SHADCN_THEME_TOKEN_NAMES)[number];

export type BklitShadcnThemeTokens = Record<BklitShadcnThemeTokenName, string>;

export const BKLIT_SHADCN_THEME_TOKEN_DEFAULTS: Record<
  BklitThemeMode,
  BklitShadcnThemeTokens
> = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.148 0.004 228.8)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.148 0.004 228.8)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.148 0.004 228.8)",
    primary: "oklch(0.457 0.24 277.023)",
    "primary-foreground": "oklch(0.962 0.018 272.314)",
    secondary: "oklch(0.967 0.001 286.375)",
    "secondary-foreground": "oklch(0.21 0.006 285.885)",
    muted: "oklch(0.963 0.002 197.1)",
    "muted-foreground": "oklch(0.56 0.021 213.5)",
    accent: "oklch(0.93 0.0097 273.35)",
    "accent-foreground": "oklch(0.42 0.0222 227.82)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.925 0.005 214.3)",
    input: "oklch(0.96 0.0067 286.27)",
    ring: "oklch(0.723 0.014 214.4)",
    "chart-1": "oklch(0.785 0.115 274.713)",
    "chart-2": "oklch(0.585 0.233 277.117)",
    "chart-3": "oklch(0.511 0.262 276.966)",
    "chart-4": "oklch(0.457 0.24 277.023)",
    "chart-5": "oklch(0.398 0.195 277.366)",
    radius: "0.625rem",
    sidebar: "oklch(0.987 0.002 197.1)",
    "sidebar-foreground": "oklch(0.148 0.004 228.8)",
    "sidebar-primary": "oklch(0.511 0.262 276.966)",
    "sidebar-primary-foreground": "oklch(0.962 0.018 272.314)",
    "sidebar-accent": "oklch(0.963 0.002 197.1)",
    "sidebar-accent-foreground": "oklch(0.218 0.008 223.9)",
    "sidebar-border": "oklch(0.925 0.005 214.3)",
    "sidebar-ring": "oklch(0.723 0.014 214.4)",
  },
  dark: {
    background: "oklch(0.14 0.0047 263.79)",
    foreground: "oklch(0.987 0.002 197.1)",
    card: "oklch(0.17 0.0065 271.01)",
    "card-foreground": "oklch(0.987 0.002 197.1)",
    popover: "oklch(0.21 0.0058 285.9)",
    "popover-foreground": "oklch(0.987 0.002 197.1)",
    primary: "oklch(0.925 0.005 214.3)",
    "primary-foreground": "oklch(0.218 0.008 223.9)",
    secondary: "oklch(0.26 0.0134 272.84)",
    "secondary-foreground": "oklch(0.987 0.002 197.1)",
    muted: "oklch(0.3 0.0182 276.35)",
    "muted-foreground": "oklch(0.62 0.0218 270.07)",
    accent: "oklch(0.29 0.0167 275.43)",
    "accent-foreground": "oklch(0.987 0.002 197.1)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(0.56 0.0195 267.65 / 0.2)",
    input: "oklch(0.47 0.0258 265.55 / 0.2)",
    ring: "oklch(0.56 0.021 213.5)",
    "chart-1": "var(--color-indigo-400)",
    "chart-2": "var(--color-violet-500)",
    "chart-3": "var(--color-purple-600)",
    "chart-4": "var(--color-emerald-500)",
    "chart-5": "var(--color-rose-300)",
    radius: "0.625rem",
    sidebar: "oklch(0.218 0.008 223.9)",
    "sidebar-foreground": "oklch(0.987 0.002 197.1)",
    "sidebar-primary": "oklch(0.488 0.243 264.376)",
    "sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
    "sidebar-accent": "oklch(0.275 0.011 216.9)",
    "sidebar-accent-foreground": "oklch(0.987 0.002 197.1)",
    "sidebar-border": "oklch(1 0 0 / 10%)",
    "sidebar-ring": "oklch(0.56 0.021 213.5)",
  },
};

export function resolveBklitShadcnThemeTokens(
  theme: BklitThemeMode,
  overrides: Partial<BklitShadcnThemeTokens> = {}
): BklitShadcnThemeTokens {
  return {
    ...BKLIT_SHADCN_THEME_TOKEN_DEFAULTS[theme],
    ...overrides,
  };
}

export function bklitShadcnThemeTokensToCssProperties(
  tokens: BklitShadcnThemeTokens
): CSSProperties {
  const style: Record<string, string> = {};
  for (const name of BKLIT_SHADCN_THEME_TOKEN_NAMES) {
    style[`--${name}`] = tokens[name];
  }
  return style as CSSProperties;
}

export function formatBklitShadcnThemeTokensCss(
  theme: BklitThemeMode,
  tokens: BklitShadcnThemeTokens
): string {
  const selector =
    theme === "dark" ? ".dark,\n.studio-shell.dark" : ":root,\n.studio-shell";
  const lines = BKLIT_SHADCN_THEME_TOKEN_NAMES.map(
    (name) => `  --${name}: ${tokens[name]};`
  );

  return `${selector} {\n${lines.join("\n")}\n}`;
}

export function formatBklitShadcnThemeTokenLabel(
  name: BklitShadcnThemeTokenName
): string {
  return name.replaceAll("-", " ");
}
