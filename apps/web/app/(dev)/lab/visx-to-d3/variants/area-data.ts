import { buildWeeklyVisitorsData } from "@/lib/weekly-visitors-demo-data";
import { daysAgo, LAB_NOW } from "./deterministic";

/**
 * Data for the area variants, copied verbatim from the sources (see the
 * `source` of each variant). Everything the sources build from the clock is
 * pinned to `LAB_NOW`.
 */

/** chart-examples.tsx `areaData`. */
export const areaData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

/** chart-examples.tsx `scatterMultiSeriesData` (24 months). */
export const multiSeries24Data = Array.from({ length: 24 }, (_, i) => ({
  date: new Date(2023, i, 1),
  desktop: Math.floor(140 + Math.sin(i / 3) * 90 + ((i * 11) % 40)),
  mobile: Math.floor(70 + Math.cos(i / 2.5) * 55 + ((i * 7) % 35)),
}));

/** lib/weekly-visitors-demo-data.ts, built at `LAB_NOW` instead of `new Date()`. */
export const weeklyVisitorsData = buildWeeklyVisitorsData(
  new Date(LAB_NOW)
) as unknown as Record<string, unknown>[];

/** Same as `weeklyVisitorsDashFromIndex` (yesterday → today). */
export const weeklyVisitorsDashFromIndex = weeklyVisitorsData.length - 2;

/** chart-examples.tsx `areaHeroData` (also home-area-chart.tsx `lineData`). */
export const areaHeroData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  revenue: Math.floor(8000 + Math.sin(i / 5) * 4000 + ((i * 11) % 2000)),
  costs: Math.floor(5000 + Math.cos(i / 4) * 2000 + ((i * 7) % 1500)),
}));

/** content/docs/components/area-chart.mdx `chartData` (`Date.now()` → `daysAgo`). */
const DOCS_REVENUE_COSTS: readonly (readonly [number, number])[] = [
  [12_000, 8500],
  [13_500, 9200],
  [11_000, 7800],
  [14_500, 10_100],
  [13_800, 9400],
  [15_200, 10_800],
  [16_000, 11_200],
  [14_800, 10_500],
  [15_500, 10_900],
  [14_200, 9800],
  [16_800, 11_800],
  [17_500, 12_400],
  [16_200, 11_500],
  [15_800, 11_200],
  [17_200, 12_100],
  [18_500, 13_200],
  [17_800, 12_600],
  [16_500, 11_700],
  [19_200, 13_800],
  [18_800, 13_400],
  [17_500, 12_400],
  [19_800, 14_200],
  [20_500, 14_800],
  [19_200, 13_600],
  [21_000, 15_200],
  [21_800, 15_800],
  [20_500, 14_600],
  [22_500, 16_200],
  [23_200, 16_800],
  [24_000, 17_400],
];

export const docsRevenueData = DOCS_REVENUE_COSTS.map(
  ([revenue, costs], index) => ({
    date: daysAgo(DOCS_REVENUE_COSTS.length - 1 - index),
    revenue,
    costs,
  })
);

/** docs/area-chart-brush-demo.tsx `brushData`. */
export const brushData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    value: Math.round(420 + Math.sin(index * 0.7) * 90 + index * 14),
  };
});

/** docs/area-chart-y-domain-demo.tsx `readyData`. */
export const yDomainReadyData = Array.from({ length: 12 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    value: Math.round(420 + Math.sin(index * 0.9) * 80 + index * 18),
  };
});

/** docs/date-highlights-demo.tsx `projectProgressData` + `PROJECT_DUE_DATE`. */
function progressDay(index: number): Date {
  return new Date(2026, 9, 1 + index);
}

export const projectProgressData = Array.from({ length: 22 }, (_, index) => {
  const u = index / 21;
  return {
    date: progressDay(index),
    scope: Math.round(48 * (1 - Math.exp(-u * 6)) + 2 * u),
    started: Math.round(46 * (1 - Math.exp(-u * 2.6))),
    completed: Math.round(43 * (1 - Math.exp(-u * 2.2))),
  };
});

export const PROJECT_DUE_DATE = progressDay(14);

/** docs/trend-line-demo.tsx `areaData` (UTC-midnight ISO dates). */
export const trendLineAreaData = [
  { date: new Date("2024-01-01"), desktop: 186 },
  { date: new Date("2024-02-01"), desktop: 305 },
  { date: new Date("2024-03-01"), desktop: 237 },
  { date: new Date("2024-04-01"), desktop: 273 },
  { date: new Date("2024-05-01"), desktop: 209 },
  { date: new Date("2024-06-01"), desktop: 314 },
  { date: new Date("2024-07-01"), desktop: 352 },
  { date: new Date("2024-08-01"), desktop: 298 },
];
