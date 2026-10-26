/**
 * World countries TopoJSON used by the choropleth demos, for server code
 * (the OG capture route, which serves a bundled copy from `lib/og-data/`):
 * values can't be imported from the `"use client"` hook module. The hook
 * (`components/docs/use-world-data.tsx`) inlines the same URL so its copy in
 * the stat-card-choropleth-01 registry block stays self-contained — keep the
 * two in sync.
 */
export const WORLD_DATA_URL =
  "https://raw.githubusercontent.com/subyfly/topojson/refs/heads/master/world-countries.json";
