export const statCardArea01Files = [
  "components/stat-card-area.tsx",
  "components/stat-card-chart.tsx",
  "components/stat-card-hover-bridge.tsx",
  "components/trend-badge.tsx",
  "data/revenue-series.ts",
] as const;

export const statCardLine01Files = [
  "components/stat-card-line.tsx",
  "components/stat-card-chart.tsx",
  "components/stat-card-hover-bridge.tsx",
  "components/trend-badge.tsx",
  "data/sessions-series.ts",
] as const;

export const statCardChoropleth01Files = [
  "components/stat-card-choropleth.tsx",
  "components/stat-card-choropleth-hover-bridge.tsx",
  "components/stat-card-chart.tsx",
  "components/trend-badge.tsx",
  "data/visitors.ts",
] as const;

export const blockFileManifests = {
  "stat-card-area-01": statCardArea01Files,
  "stat-card-line-01": statCardLine01Files,
  "stat-card-choropleth-01": statCardChoropleth01Files,
} as const;

export type BlockSlug = keyof typeof blockFileManifests;

export const blockSlugs = Object.keys(blockFileManifests) as BlockSlug[];
