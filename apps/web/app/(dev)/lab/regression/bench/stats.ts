export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Linear-interpolated percentile, `p` in [0, 1]. */
export function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const lowerValue = sorted[lower] ?? 0;
  const upperValue = sorted[upper] ?? lowerValue;
  return lowerValue + (upperValue - lowerValue) * (index - lower);
}

export function median(values: readonly number[]): number {
  return percentile(values, 0.5);
}

/** Relative change from `before` to `after`; `null` when `before` is 0. */
export function deltaPct(before: number, after: number): number | null {
  if (before === 0) {
    return after === 0 ? 0 : null;
  }
  return ((after - before) / Math.abs(before)) * 100;
}
