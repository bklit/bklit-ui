/** Semantic chart tokens that derive from the palette when presets override --chart-1 … --chart-5. */
export const CHART_PALETTE_DERIVED_VARS: Record<string, string> = {
  "--chart-line-primary": "var(--chart-1)",
  "--chart-line-secondary": "var(--chart-2)",
  /* Sequential ramp from --chart-1 — keep in sync with bklit-tokens.css */
  "--chart-scale-02":
    "color-mix(in oklab, var(--chart-1) 35%, var(--chart-scale-mix))",
  "--chart-scale-03":
    "color-mix(in oklab, var(--chart-1) 55%, var(--chart-scale-mix))",
  "--chart-scale-04":
    "color-mix(in oklab, var(--chart-1) 78%, var(--chart-scale-mix))",
  "--chart-scale-05": "var(--chart-1)",
};

/** Fallback resolution when a semantic token is not defined on an ancestor. */
export const CHART_VAR_ALIASES: Record<string, string> = {
  "--chart-line-primary": "--chart-1",
  "--chart-line-secondary": "--chart-2",
};
