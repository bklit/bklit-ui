/** Shared line-chart demo data and styling aligned with the Studio reference preset. */

export const LINE_DEMO_POINT_COUNT = 10;

export const REFERENCE_AREA_DEMO = {
  /** Upper band on shared trending demo data (~141–200); Studio projection preset uses 250–300 with projections. */
  y1: 160,
  y2: 200,
  pattern: "diagonal" as const,
  patternColor: "oklch(0.76 0.144 180.392 / 0.17)",
  patternScale: 0.75,
  patternStrokeWidth: 1.5,
  stroke: "oklch(0.841 0.142 159.667 / 0.49)",
  axisLabelColor: "oklch(0.795 0.152 164.722)",
  showMarkers: false,
};

function trendingLineValue(index: number, seriesIndex = 0): number {
  const base = 120 + seriesIndex * 18;
  const trend = (5.5 + seriesIndex * 1.25) * index;
  const i = index + seriesIndex * 9;
  const swell = Math.sin(i / 4.4 + seriesIndex * 1.2) * (24 + seriesIndex * 3);
  const ripple =
    Math.cos(i / 1.65 + seriesIndex * 0.85) * (16 + seriesIndex * 2);
  const jitter = Math.sin(i / 0.68 + seriesIndex * 2.4) * (10 + seriesIndex);
  const wobble = Math.cos(i / 2.95 + seriesIndex * 1.6) * 7;

  return Math.max(
    10,
    Math.floor(base + trend + swell + ripple + jitter + wobble)
  );
}

export function buildLineChartDemoData(
  pointCount = LINE_DEMO_POINT_COUNT
): { date: Date; value: number }[] {
  return Array.from({ length: pointCount }, (_, index) => ({
    date: new Date(2024, 0, index + 1),
    value: trendingLineValue(index),
  }));
}
