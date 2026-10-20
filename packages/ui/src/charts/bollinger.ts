export interface BollingerBandsOptions {
  /** Numeric key to compute bands for. */
  dataKey: string;
  /** Rolling window length. Default: 20 */
  period?: number;
  /** Standard deviations above / below the SMA. Default: 2 */
  multiplier?: number;
  /**
   * Minimum finite values in the window needed to emit a row (pandas
   * `min_periods`). Clamped to [1, `period`]. Default: `period` — a gap until
   * the window fills. Use `1` to warm up from the first row over a partial
   * window.
   */
  minPeriods?: number;
  /** Default: `${dataKey}Upper` */
  upperKey?: string;
  /** Default: `${dataKey}Lower` */
  lowerKey?: string;
  /** Default: `${dataKey}Sma` */
  middleKey?: string;
}

/**
 * Adds Bollinger band keys to each row: rolling SMA over the last `period`
 * rows ± `multiplier` × population standard deviation, computed over the
 * finite numeric values in that window. Rows whose window has fewer than
 * `minPeriods` such values (by default: before the window fills, or when it
 * contains a non-numeric value) get `null` for all three keys, which
 * `<Band>` / `<Line>` treat as gaps.
 */
export function withBollingerBands<T extends Record<string, unknown>>(
  data: T[],
  options: BollingerBandsOptions
): (T & Record<string, number | null>)[] {
  const {
    dataKey,
    period = 20,
    multiplier = 2,
    upperKey = `${dataKey}Upper`,
    lowerKey = `${dataKey}Lower`,
    middleKey = `${dataKey}Sma`,
    minPeriods = period,
  } = options;
  const windowSize = Math.max(1, Math.floor(period));
  const requiredCount = Math.min(
    windowSize,
    Math.max(
      1,
      Number.isFinite(minPeriods) ? Math.floor(minPeriods) : windowSize
    )
  );

  return data.map((row, index) => {
    let upper: number | null = null;
    let lower: number | null = null;
    let middle: number | null = null;

    const values: number[] = [];
    for (
      let offset = Math.max(0, index - windowSize + 1);
      offset <= index;
      offset++
    ) {
      const value = data[offset]?.[dataKey];
      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value);
      }
    }
    if (values.length >= requiredCount) {
      const count = values.length;
      const mean = values.reduce((sum, value) => sum + value, 0) / count;
      const variance =
        values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count;
      const spread = multiplier * Math.sqrt(variance);
      middle = mean;
      upper = mean + spread;
      lower = mean - spread;
    }

    return {
      ...row,
      [upperKey]: upper,
      [lowerKey]: lower,
      [middleKey]: middle,
    } as T & Record<string, number | null>;
  });
}
