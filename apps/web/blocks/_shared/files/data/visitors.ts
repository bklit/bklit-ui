import type { ChoroplethFeature } from "@bklitui/ui/charts";

export const visitorsByCountry: Record<string, number> = {
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

const visitorCounts = Object.values(visitorsByCountry);
const averageVisitorsPerCountry =
  visitorCounts.reduce((sum, visitors) => sum + visitors, 0) /
  visitorCounts.length;

export const visitorStats = {
  trend: -3.1,
  total: visitorCounts.reduce((sum, visitors) => sum + visitors, 0),
};

export function getVisitorColor(feature: ChoroplethFeature): string {
  const name = feature.properties?.name as string;
  const visitors = visitorsByCountry[name];

  if (!visitors) {
    return "var(--muted)";
  }
  if (visitors >= 17) {
    return "var(--chart-scale-05)";
  }
  if (visitors >= 13) {
    return "var(--chart-scale-04)";
  }
  if (visitors >= 9) {
    return "var(--chart-scale-03)";
  }
  if (visitors >= 5) {
    return "var(--chart-scale-02)";
  }
  return "var(--chart-scale-01)";
}

export function getVisitorValue(
  feature: ChoroplethFeature
): number | undefined {
  const name = feature.properties?.name as string;
  return visitorsByCountry[name];
}

export function computeVisitorTrend(visitors: number): number {
  if (averageVisitorsPerCountry === 0) {
    return 0;
  }

  return (
    ((visitors - averageVisitorsPerCountry) / averageVisitorsPerCountry) * 100
  );
}
