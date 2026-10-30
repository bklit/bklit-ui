import type { ChoroplethFeature } from "@bklitui/ui/charts";
import type { HoverTarget, HoverTargets } from "../bench/parity";

/** chart-examples.tsx `visitorsByCountry` (gallery + hero). */
export const galleryVisitorsByCountry: Record<string, number> = {
  "United States": 18,
  "United Kingdom": 12,
  Germany: 17,
  France: 9,
  Canada: 8,
  Australia: 6,
  Netherlands: 5,
  Brazil: 7,
  India: 11,
  Japan: 4,
  Spain: 3,
  Italy: 6,
  Mexico: 5,
  Poland: 4,
  Sweden: 3,
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
  Philippines: 3,
  Thailand: 2,
};

export function getGalleryVisitorColor(feat: ChoroplethFeature): string {
  const visitors = galleryVisitorsByCountry[feat.properties?.name as string];
  if (!visitors) {
    return "var(--chart-scale-01)";
  }
  if (visitors >= 17) {
    return "var(--chart-1)";
  }
  if (visitors >= 13) {
    return "var(--chart-2)";
  }
  if (visitors >= 9) {
    return "var(--chart-3)";
  }
  if (visitors >= 5) {
    return "var(--chart-4)";
  }
  return "var(--chart-5)";
}

export function getGalleryVisitorValue(
  feat: ChoroplethFeature
): number | undefined {
  return galleryVisitorsByCountry[feat.properties?.name as string];
}

/** docs/choropleth-demo.tsx `visitorsByCountry` (ChoroplethAnalyticsDemo). */
export const docsVisitorsByCountry: Record<string, number> = {
  "United States": 18,
  "United Kingdom": 12,
  Germany: 17,
  France: 9,
  Canada: 8,
  Australia: 6,
  Netherlands: 5,
  Brazil: 7,
  India: 11,
  Japan: 4,
  Spain: 3,
  Italy: 6,
  Mexico: 5,
  Poland: 4,
  Sweden: 3,
  Belgium: 2,
  Switzerland: 2,
  Austria: 1,
  Norway: 2,
  Denmark: 1,
  Ireland: 3,
  Portugal: 2,
  "New Zealand": 1,
  Finland: 1,
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
  Philippines: 3,
  Thailand: 2,
  Vietnam: 1,
};

export function getDocsVisitorColor(feature: ChoroplethFeature): string {
  const visitors = docsVisitorsByCountry[feature.properties?.name as string];
  if (!visitors) {
    return "var(--chart-scale-01)";
  }
  if (visitors >= 17) {
    return "var(--chart-scale-05)";
  }
  if (visitors >= 9) {
    return "var(--chart-scale-04)";
  }
  if (visitors >= 5) {
    return "var(--chart-scale-03)";
  }
  return "var(--chart-scale-02)";
}

export function getDocsVisitorValue(
  feature: ChoroplethFeature
): number | undefined {
  return docsVisitorsByCountry[feature.properties?.name as string];
}

export const docsLegendItems = [
  { color: "var(--chart-scale-01)", label: "No data" },
  { color: "var(--chart-scale-02)", label: "1-4" },
  { color: "var(--chart-scale-03)", label: "5-8" },
  { color: "var(--chart-scale-04)", label: "9-16" },
  { color: "var(--chart-scale-05)", label: "17+" },
];

/** Categories by first letter (demo-only grouping, copied from the sources). */
export function getRegionCategory(
  name: string
): "americas" | "europe" | "asia" | "africa" | "oceania" {
  const c = name.charAt(0).toUpperCase();
  if ("ABCD".includes(c)) {
    return "americas";
  }
  if ("EFGH".includes(c)) {
    return "europe";
  }
  if ("IJKLM".includes(c)) {
    return "asia";
  }
  if ("NOPQR".includes(c)) {
    return "africa";
  }
  return "oceania";
}

const FEATURE_SELECTOR = "svg path.cursor-pointer";

/**
 * Hover targets for the choropleth: first / middle / last country path.
 *
 * The fixture default captures path elements once, but hovering a country
 * swaps `StaticFeatureLayer` from `<g>` to `<><g/><path/></>`, which remounts
 * every path; later steps would then fire on detached nodes and do nothing.
 * Here each target identifies its country by `d` and re-resolves the live
 * element whenever the runner reads `element`.
 */
export const choroplethCountryTargets: HoverTargets = (root) => {
  const paths = [...root.querySelectorAll(FEATURE_SELECTOR)];
  if (paths.length === 0) {
    return [];
  }
  const picks = [
    ...new Set([0, Math.floor(paths.length / 2), paths.length - 1]),
  ];
  return picks.map((index): HoverTarget => {
    const initial = paths[index] as Element;
    const d = initial.getAttribute("d");
    return {
      get element() {
        const live = [...root.querySelectorAll(FEATURE_SELECTOR)].find(
          (path) => path.getAttribute("d") === d
        );
        return live ?? initial;
      },
    };
  });
};
