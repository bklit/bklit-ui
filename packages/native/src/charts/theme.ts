/**
 * Native counterpart of the `--chart-*` CSS variables in
 * `packages/studio/src/styles/bklit-tokens.css`. Skia can't read CSS
 * variables or parse `oklch()`, so the tokens are resolved to hex here.
 */
export interface ChartTheme {
  linePrimary: string;
  lineSecondary: string;
  grid: string;
  crosshair: string;
  label: string;
  tooltipBackground: string;
  tooltipForeground: string;
  tooltipMuted: string;
  tooltipBorder: string;
  /** Ring drawn around tooltip dots so they read against the line. */
  dotRing: string;
  /** Date ticker pill (web: zinc-900 / zinc-100). */
  tickerBackground: string;
  tickerForeground: string;
  segmentBackground: string;
  segmentLine: string;
  positive: string;
  negative: string;
  foreground: string;
  /** `--chart-foreground-muted`. */
  foregroundMuted: string;
  /** `--chart-3` (purple). */
  chart3: string;
  /** `--chart-5` (black / white). */
  chart5: string;
  markerBackground: string;
  markerBorder: string;
  markerForeground: string;
  markerBadgeBackground: string;
  markerBadgeForeground: string;
}

export const lightChartTheme: ChartTheme = {
  linePrimary: "#6366f1",
  lineSecondary: "#facc15",
  grid: "#e4e4e4",
  crosshair: "#9a9a9a",
  label: "#5c5f67",
  tooltipBackground: "#ffffff",
  tooltipForeground: "#0a0a0a",
  tooltipMuted: "#737373",
  tooltipBorder: "#e5e5e5",
  dotRing: "#ffffff",
  tickerBackground: "#18181b",
  tickerForeground: "#ffffff",
  segmentBackground: "rgba(176, 176, 176, 0.12)",
  segmentLine: "rgba(80, 80, 80, 0.35)",
  positive: "#10b981",
  negative: "#ef4444",
  foreground: "#0a0a0a",
  foregroundMuted: "#d1d1d3",
  chart3: "#6a3b9e",
  chart5: "#000000",
  markerBackground: "#c8c8ca",
  markerBorder: "#cdcdd0",
  markerForeground: "#2e2e31",
  markerBadgeBackground: "#000000",
  markerBadgeForeground: "#cacaca",
};

export const darkChartTheme: ChartTheme = {
  linePrimary: "#6366f1",
  lineSecondary: "#facc15",
  grid: "rgba(130, 137, 148, 0.25)",
  crosshair: "#a8a9b8",
  label: "#b5b8c0",
  tooltipBackground: "#171717",
  tooltipForeground: "#fafafa",
  tooltipMuted: "#a3a3a3",
  tooltipBorder: "#262626",
  dotRing: "#0a0a0a",
  tickerBackground: "#f4f4f5",
  tickerForeground: "#18181b",
  segmentBackground: "rgba(70, 80, 92, 0.3)",
  segmentLine: "rgba(255, 255, 255, 0.25)",
  positive: "#10b981",
  negative: "#ef4444",
  foreground: "#fafafa",
  foregroundMuted: "#8e8f94",
  chart3: "#6a3b9e",
  chart5: "#ffffff",
  markerBackground: "#222225",
  markerBorder: "#48484c",
  markerForeground: "#dedede",
  markerBadgeBackground: "#ffffff",
  markerBadgeForeground: "#0b0b0b",
};

/**
 * Same shape and defaults as web `ChartConfig` springs. Mass is pinned to 1
 * (Motion's default); Reanimated 4 defaults to mass 4, which halves the
 * damping ratio and doubles the bounce.
 */
export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

/** Resolve to a Reanimated spring config with Motion's mass of 1. */
export function toSpring(config: SpringConfig) {
  return { mass: 1, ...config };
}

export interface ChartSprings {
  /** Crosshair, dots, date ticker position. */
  tooltip: SpringConfig;
  /** Floating tooltip panel; softer so it trails the crosshair. */
  tooltipBox: SpringConfig;
  /** Hover-highlight band (x + width). */
  highlight: SpringConfig;
  /** Date ticker roll + width. */
  ticker: SpringConfig;
}

export const DEFAULT_CHART_SPRINGS: ChartSprings = {
  tooltip: { stiffness: 300, damping: 30 },
  tooltipBox: { stiffness: 100, damping: 20 },
  highlight: { stiffness: 180, damping: 28 },
  ticker: { stiffness: 400, damping: 35 },
};

/** Set the alpha of a #rrggbb / #rrggbbaa colour (others pass through). */
export function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 9)) {
    return hex;
  }
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex.slice(0, 7)}${a}`;
}
