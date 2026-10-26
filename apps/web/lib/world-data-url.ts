/**
 * World countries TopoJSON used by the choropleth demos. Kept out of the
 * `"use client"` hook module so server code (the OG capture route, which
 * serves a bundled copy from `lib/og-data/`) can import the plain string.
 */
export const WORLD_DATA_URL =
  "https://raw.githubusercontent.com/subyfly/topojson/refs/heads/master/world-countries.json";
