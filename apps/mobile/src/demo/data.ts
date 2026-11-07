/**
 * Demo data modelled on the web recipes (`apps/web/components/recipes/
 * recipe-data.ts`): daily rows from Mon 5 Jan 2026, with a seed for
 * "Shuffle" so data changes exercise the morph.
 */

export type Row = Record<string, unknown> & { date: Date };

const day = (i: number) => new Date(2026, 0, 5 + i);

function noise(seed: number) {
  let s = seed * 9301 + 49_297;
  return () => {
    s = (s * 16_807) % 2_147_483_647;
    return s / 2_147_483_647 - 0.5;
  };
}

/** recipeDailyData: visitors ≈ 1200–2600 with weekly rhythm. */
export function dailyData(days: number, seed: number): Row[] {
  const rand = noise(seed);
  const jitter = seed === 0 ? 0 : 1;
  return Array.from({ length: days }, (_, i) => ({
    date: day(i),
    visitors: Math.round(
      1400 +
        38 * i +
        Math.sin((i / 7) * 2 * Math.PI) * 180 +
        Math.sin(2.3 * i) * 90 +
        Math.cos(1.1 * i) * 60 +
        jitter * rand() * 260
    ),
  }));
}

/** recipeRangeData: visitors with a low/high spread. */
export function rangeData(days: number, seed: number): Row[] {
  return dailyData(days, seed).map((d, i) => {
    const v = d.visitors as number;
    const spread = v * (0.13 + 0.04 * Math.sin(i / 2.4));
    return {
      ...d,
      low: Math.round(v - spread * (0.85 + 0.15 * Math.cos(i))),
      high: Math.round(v + spread),
    };
  });
}

/** Actuals, then a dashed forecast with a widening confidence band. */
export function forecastData(days: number, seed: number, ahead = 10): Row[] {
  const actual = dailyData(days, seed);
  const last = actual.at(-1)?.visitors as number;
  const slope = 32;
  const rows: Row[] = actual.map((d) => ({ ...d }));
  // Join the forecast to the last actual so the lines meet.
  const tail = rows.at(-1);
  if (tail) {
    tail.forecast = last;
    tail.low = last;
    tail.high = last;
  }
  for (let k = 1; k <= ahead; k++) {
    const value = last + slope * k + Math.sin(k / 2) * 60;
    const spread = 40 + k * 26;
    rows.push({
      date: day(days - 1 + k),
      forecast: Math.round(value),
      low: Math.round(value - spread),
      high: Math.round(value + spread),
    });
  }
  return rows;
}

/** Profit / loss that crosses zero a few times. */
export function pnlData(days: number, seed: number): Row[] {
  const rand = noise(seed + 3);
  return Array.from({ length: days }, (_, i) => ({
    date: day(i),
    pnl: Math.round(
      Math.sin(i / 3.2) * 900 +
        Math.sin(i / 1.3) * 260 +
        (i - days / 2) * 18 +
        (seed === 0 ? 0 : rand() * 320)
    ),
  }));
}

/** Homepage revenue / costs. */
export function revenueData(days: number, seed: number): Row[] {
  const rand = noise(seed + 7);
  let revenue = 5200;
  let costs = 2600;
  return Array.from({ length: days }, (_, i) => {
    revenue = Math.max(1500, revenue + (rand() + 0.08) * 700);
    costs = Math.max(800, costs + (rand() + 0.02) * 300);
    return {
      date: day(i),
      revenue: Math.round(revenue),
      costs: Math.round(costs),
    };
  });
}

export const RANGE_OPTIONS = ["2W", "4W", "6W"] as const;
export type RangeOption = (typeof RANGE_OPTIONS)[number];
export const RANGE_DAYS: Record<RangeOption, number> = {
  "2W": 14,
  "4W": 28,
  "6W": 42,
};

export const markerDates = {
  deploy: day(7),
  pricing: day(16),
  campaign: day(23),
  launch: day(5),
  newsletter: day(13),
  perf: day(21),
};

/** One working week (Mon 5 – Fri 9 Jan) for weekday-name labels. */
export function weekdayData(seed: number): Row[] {
  const rand = noise(seed + 11);
  const base = [1320, 1580, 1490, 1710, 1260];
  return base.map((v, i) => ({
    date: day(i),
    visitors: Math.round(v + (seed === 0 ? 0 : rand() * 360)),
  }));
}
