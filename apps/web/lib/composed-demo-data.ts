/** UTC noon per day so x positions and labels stay stable across time zones. */
const DAY_MS = 86_400_000;
const START_MS = Date.UTC(2024, 0, 1, 12, 0, 0);

export const COMPOSED_DEMO_DAY_COUNT = 30;

function isoDay(i: number): string {
  return new Date(START_MS + i * DAY_MS).toISOString();
}

/** One slow cycle across the window + light ripples (readable, not “ECG” noise). */
function smoothCycle(i: number, phase: number): number {
  const u = i / (COMPOSED_DEMO_DAY_COUNT - 1);
  return Math.sin(u * Math.PI * 2 + phase);
}

/** Daily rows: units (bars), revenue + runRate (line / area) — gentle variation. */
export const composedDemoData = Array.from(
  { length: COMPOSED_DEMO_DAY_COUNT },
  (_, i) => {
    const units = Math.round(
      46 +
        14 * smoothCycle(i, 0.35) +
        6 * Math.sin(i / 14) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 10
    );
    const revenue = Math.round(
      96 +
        11 * smoothCycle(i, 1.05) +
        5 * Math.sin(i / 17) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 18
    );
    const runRate = Math.round(
      82 +
        9 * smoothCycle(i, 1.9) +
        5 * Math.cos(i / 16) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 8
    );
    return {
      date: isoDay(i),
      units: Math.max(18, Math.min(95, units)),
      revenue: Math.max(72, Math.min(155, revenue)),
      runRate: Math.max(62, Math.min(118, runRate)),
    };
  }
);

/** Same timeline: two stack segments + revenue (smooth totals). */
export const composedStackedData = Array.from(
  { length: COMPOSED_DEMO_DAY_COUNT },
  (_, i) => {
    const direct = Math.round(
      18 + 8 * smoothCycle(i, 0.2) + 4 * Math.sin(i / 12)
    );
    const partner = Math.round(
      14 + 6 * smoothCycle(i, 1.4) + 3 * Math.cos(i / 13)
    );
    const revenue = Math.round(
      96 +
        11 * smoothCycle(i, 1.05) +
        5 * Math.sin(i / 17) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 18
    );
    return {
      date: isoDay(i),
      direct: Math.max(8, Math.min(42, direct)),
      partner: Math.max(8, Math.min(36, partner)),
      revenue: Math.max(72, Math.min(155, revenue)),
    };
  }
);

/** Desktop / mobile / installs with correlated, smoothed motion. */
export const composedTriSeriesData = Array.from(
  { length: COMPOSED_DEMO_DAY_COUNT },
  (_, i) => {
    const desktop = Math.round(
      178 +
        32 * smoothCycle(i, 0.5) +
        10 * Math.sin(i / 15) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 14
    );
    const mobile = Math.round(
      88 + 22 * smoothCycle(i, 1.2) + 8 * Math.cos(i / 14)
    );
    const installs = Math.round(
      (desktop + mobile) * (0.102 + 0.012 * Math.sin(i / 20))
    );
    return {
      date: isoDay(i),
      desktop: Math.max(120, Math.min(260, desktop)),
      mobile: Math.max(55, Math.min(145, mobile)),
      installs: Math.max(18, Math.min(48, installs)),
    };
  }
);

/** Deterministic 0..1 noise so gallery charts render identically on server and client. */
function noise(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43_758.5453;
  return x - Math.floor(x);
}

function rollingMean(values: number[], i: number, window: number): number {
  const start = Math.max(0, i - window + 1);
  let sum = 0;
  for (let j = start; j <= i; j++) {
    sum += values[j] ?? 0;
  }
  return Math.round((sum / (i - start + 1)) * 100) / 100;
}

/** Daily OHLC candles + volume + 5-day close average (price-and-volume composed demo). */
export const composedMarketData = (() => {
  const rows: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    ma5: number;
  }[] = [];
  const closes: number[] = [];
  let open = 182;
  for (let i = 0; i < COMPOSED_DEMO_DAY_COUNT; i++) {
    const trend = 0.6 * smoothCycle(i, 0.4) + 0.25;
    const move = (noise(i, 1) - 0.47) * 6 + trend;
    const close = Math.round((open + move) * 100) / 100;
    const high =
      Math.round((Math.max(open, close) + noise(i, 2) * 2.6 + 0.4) * 100) / 100;
    const low =
      Math.round((Math.min(open, close) - noise(i, 3) * 2.6 - 0.4) * 100) / 100;
    closes.push(close);
    rows.push({
      date: isoDay(i),
      open: Math.round(open * 100) / 100,
      high,
      low,
      close,
      volume: Math.round((38 + Math.abs(move) * 9 + noise(i, 4) * 18) * 1000),
      ma5: rollingMean(closes, i, 5),
    });
    open = close;
  }
  return rows;
})();

/** Cumulative P&L that crosses zero, plus daily trade volume. */
export const composedPnlData = (() => {
  let pnl = 0;
  return Array.from({ length: COMPOSED_DEMO_DAY_COUNT }, (_, i) => {
    pnl += Math.round(
      14 * Math.sin((i / (COMPOSED_DEMO_DAY_COUNT - 1)) * Math.PI * 2 - 0.6) +
        (noise(i, 5) - 0.5) * 18
    );
    return {
      date: isoDay(i),
      pnl,
      trades: Math.round(24 + noise(i, 6) * 30 + Math.abs(pnl) * 0.08),
    };
  });
})();

/** Index where the forecast demo switches from actuals to the forecast. */
export const COMPOSED_FORECAST_START = 21;

/** Actual bars until {@link COMPOSED_FORECAST_START}, then a widening forecast band. */
export const composedForecastData = Array.from(
  { length: COMPOSED_DEMO_DAY_COUNT },
  (_, i) => {
    const base = Math.round(
      62 + 12 * smoothCycle(i, 0.9) + (i / COMPOSED_DEMO_DAY_COUNT) * 16
    );
    const isActual = i < COMPOSED_FORECAST_START;
    const spread = isActual ? 0 : 3 + (i - COMPOSED_FORECAST_START) * 2.2;
    const actual = Math.round(base + (noise(i, 7) - 0.5) * 12);
    return {
      date: isoDay(i),
      ...(isActual ? { actual } : {}),
      forecast: isActual ? actual : base,
      upper: Math.round((isActual ? actual : base) + spread),
      lower: Math.round((isActual ? actual : base) - spread),
    };
  }
);

/** Noisy daily signups (scatter) with a 7-day rolling mean (line). */
export const composedSignalsData = (() => {
  const signups: number[] = [];
  return Array.from({ length: COMPOSED_DEMO_DAY_COUNT }, (_, i) => {
    const value = Math.round(
      140 +
        26 * smoothCycle(i, 2.2) +
        (i / COMPOSED_DEMO_DAY_COUNT) * 30 +
        (noise(i, 8) - 0.5) * 70
    );
    signups.push(value);
    return {
      date: isoDay(i),
      signups: value,
      avg7: Math.round(rollingMean(signups, i, 7)),
      sessions: Math.round(
        980 + 260 * smoothCycle(i, 0.2) + i * 9 + (noise(i, 9) - 0.5) * 90
      ),
    };
  });
})();

/**
 * Featured composed demo: daily revenue points (scatter), a 7-day trend (line),
 * an expected range around the trend (band) and daily orders (bars).
 */
export const composedFeaturedData = (() => {
  const revenues: number[] = [];
  return Array.from({ length: COMPOSED_DEMO_DAY_COUNT }, (_, i) => {
    const expected =
      118 + 22 * smoothCycle(i, 0.9) + (i / COMPOSED_DEMO_DAY_COUNT) * 26;
    const revenue = Math.round(expected + (noise(i, 11) - 0.5) * 34);
    revenues.push(revenue);
    const trend = Math.round(rollingMean(revenues, i, 7));
    const spread = 15 + 5 * Math.sin(i / 3.2);
    return {
      date: isoDay(i),
      revenue,
      trend,
      high: Math.round(trend + spread),
      low: Math.round(trend - spread),
      orders: Math.round(32 + 10 * smoothCycle(i, 0.4) + noise(i, 12) * 14),
    };
  });
})();
