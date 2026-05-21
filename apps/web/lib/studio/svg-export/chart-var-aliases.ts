/** Semantic chart tokens that derive from the palette when presets override --chart-1 … --chart-5. */
export const CHART_PALETTE_DERIVED_VARS: Record<string, string> = {
  "--chart-line-primary": "var(--chart-1)",
  "--chart-line-secondary": "var(--chart-2)",
};

/** Fallback resolution when a semantic token is not defined on an ancestor. */
export const CHART_VAR_ALIASES: Record<string, string> = {
  "--chart-line-primary": "--chart-1",
  "--chart-line-secondary": "--chart-2",
};
