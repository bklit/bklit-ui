export interface ResponsiveChartLabelCount {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type ChartLabelCount = number | ResponsiveChartLabelCount;

export function resolveResponsiveChartLabelCount(
  value: ChartLabelCount,
  viewportWidth: number,
  fallback: number
): number {
  if (typeof value === "number") return value;

  const candidates = [
    [1280, value.xl],
    [1024, value.lg],
    [768, value.md],
    [640, value.sm],
    [0, value.base],
  ] as const;

  return (
    candidates.find(
      ([minWidth, count]) => viewportWidth >= minWidth && count != null
    )?.[1] ?? fallback
  );
}
