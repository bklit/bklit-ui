/** Deterministic demo data shared by every recipe preview. */

/** Local-time day `offset` days after Monday 5 Jan 2026 (Weekends uses local days). */
function day(offset: number): Date {
  return new Date(2026, 0, 5 + offset);
}

/** 28 days of visitors with a gentle upward trend and weekly rhythm. */
export const recipeDailyData = Array.from({ length: 28 }, (_, index) => {
  const trend = 1400 + index * 38;
  const weekly = Math.sin((index / 7) * Math.PI * 2) * 180;
  const noise = Math.sin(index * 2.3) * 90 + Math.cos(index * 1.1) * 60;
  const visitors = Math.round(trend + weekly + noise);
  return {
    date: day(index),
    visitors,
    previous: Math.round(visitors * 0.78 + Math.cos(index * 0.9) * 110),
  };
});

/** Actual daily visitors against a straight-line growth projection (they cross weekly). */
export const recipeProjectedData = recipeDailyData.map((row, index) => ({
  date: row.date,
  actual: row.visitors,
  projected: 1380 + index * 40,
}));

/** Deterministic noise in [-0.5, 0.5) (LCG) for the jagged year-over-year walk. */
function seededNoise(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296 - 0.5;
  };
}

/**
 * Weekly % return since 1 Jan for a year: this year vs the
 * same days last year. Both walks share shocks (and a mid-year drawdown), so
 * they move together while this year pulls ahead.
 */
export const recipeYearOverYearData = (() => {
  const noise = seededNoise(11);
  let thisYear = 0;
  let lastYear = 0;
  // 52 points keeps the chart under DISCRETE_INTERACTION_LABEL_THRESHOLD (60),
  // so the tooltip, highlight and date ticker use the standard spring motion.
  return Array.from({ length: 52 }, (_, index) => {
    const shock = noise();
    const drawdown = -2.2 * Math.exp(-((index - 25) ** 2) / 14);
    thisYear += 0.7 + shock * 5 + drawdown;
    lastYear += 0.45 + shock * 3.2 + noise() * 1 + drawdown * 0.7;
    return {
      date: day(index * 7),
      thisYear: Math.round(thisYear * 100) / 100,
      lastYear: Math.round(lastYear * 100) / 100,
    };
  });
})();

/** 18 days of cumulative revenue — month-to-date, ready to project to a goal. */
export const recipeRevenueData = (() => {
  let total = 0;
  return Array.from({ length: 18 }, (_, index) => {
    if (index > 0) {
      total +=
        300 +
        index * 12 +
        Math.sin(index * 1.7) * 120 +
        Math.cos(index * 0.8) * 70;
    }
    return { date: new Date(2026, 8, 1 + index), revenue: Math.round(total) };
  });
})();

/** Monthly revenue goal the projection is measured against. */
export const RECIPE_REVENUE_GOAL = 10_000;

/** 12 weekly points — sparse enough for point markers. */
export const recipeWeeklyData = Array.from({ length: 12 }, (_, index) => {
  const value =
    820 + index * 64 + Math.sin(index * 1.4) * 120 + Math.cos(index * 0.6) * 70;
  return {
    date: day(index * 7),
    visitors: Math.round(value),
  };
});

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const recipeMonthlyData = MONTHS.map((month, index) => {
  const revenue = Math.round(
    4200 + index * 260 + Math.sin(index * 1.3) * 900 + Math.cos(index) * 300
  );
  return {
    month,
    revenue,
    previous: Math.round(revenue * 0.74 + Math.sin(index * 0.8) * 350),
  };
});

/** First half of the year — few enough columns for squircle segments. */
export const recipeHalfYearData = recipeMonthlyData.slice(0, 6);

/** Daily visitors with a low / high envelope for range bands. */
export const recipeRangeData = recipeDailyData.map((row, index) => {
  const spread = row.visitors * (0.13 + 0.04 * Math.sin(index / 2.4));
  return {
    date: row.date,
    visitors: row.visitors,
    low: Math.round(row.visitors - spread * (0.85 + 0.15 * Math.cos(index))),
    high: Math.round(row.visitors + spread),
  };
});

/** Event markers on `recipeDailyData` days (two share a day, so they fan out). */
export const recipeEventMarkers = [
  {
    date: day(5),
    icon: "🚀",
    title: "v2.0 launch",
    description: "New dashboard shipped",
  },
  {
    date: day(13),
    icon: "📣",
    title: "Newsletter",
    description: "Monthly send to 40k readers",
  },
  {
    date: day(13),
    icon: "🐛",
    title: "Hotfix",
    description: "Checkout bug fixed",
  },
  {
    date: day(21),
    icon: "⚡",
    title: "Perf release",
    description: "Pages load 40% faster",
    color: "var(--chart-1)",
  },
];

/** Minimal annotations for the diamond-marker recipe. */
export const recipeDiamondMarkers = [
  { date: day(7), title: "Deploy" },
  { date: day(16), title: "Pricing change" },
  { date: day(23), title: "Campaign" },
];

export const recipePieData = [
  { label: "Direct", value: 420, color: "var(--chart-1)" },
  { label: "Search", value: 310, color: "var(--chart-2)" },
  { label: "Social", value: 190, color: "var(--chart-3)" },
  { label: "Referral", value: 140, color: "var(--chart-4)" },
];

export const recipeRingData = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "var(--chart-1)" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "var(--chart-2)" },
  { label: "Email", value: 2100, maxValue: 5000, color: "var(--chart-3)" },
  { label: "Social", value: 1580, maxValue: 5000, color: "var(--chart-4)" },
];

/** Three 28-day KPI series (same dates, so their sparklines can share a hover index). */
export const recipeKpiData = {
  visitors: recipeDailyData.map(({ date, visitors }) => ({
    date,
    value: visitors,
  })),
  signups: recipeDailyData.map(({ date, visitors }, index) => ({
    date,
    value: Math.round(visitors * 0.045 + Math.sin(index * 1.7) * 9),
  })),
  revenue: recipeDailyData.map(({ date, visitors }, index) => ({
    date,
    value: Math.round(
      visitors * 2.6 + Math.cos(index * 0.8) * 420 - index * 18
    ),
  })),
};

/**
 * A café's cups per hour, 00:00 → 23:00 (open 06:00–20:00), for radial clocks.
 * A full day — "today" previews blank the hours after the viewer's local now.
 */
export const recipeCafeHours = (
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [6, 22],
    [14, 58],
    [22, 84],
    [26, 61],
    [31, 38],
    [36, 34],
    [44, 41],
    [38, 36],
    [27, 24],
    [24, 30],
    [21, 33],
    [15, 26],
    [10, 14],
    [6, 7],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ] as const
).map(([dineIn, takeaway], hour) => ({
  time: `${String(hour).padStart(2, "0")}:00`,
  dineIn,
  takeaway,
}));

/** One 2 TB cloud plan, GB used by content type. */
export const recipeStoragePlan = {
  capacity: 2048,
  used: { photos: 846, backups: 312, documents: 188, mail: 64 },
};

/** Deterministic 0..1 noise for the composed recipes. */
function recipeNoise(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43_758.5453;
  return x - Math.floor(x);
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** 28 daily OHLC candles with volume and a 5-day close average. */
export const recipeMarketData = (() => {
  const rows: {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    average: number;
  }[] = [];
  const closes: number[] = [];
  let open = 182;
  for (let index = 0; index < 28; index++) {
    const drift = Math.sin((index / 27) * Math.PI * 2 + 0.4) * 0.8 + 0.3;
    const move = (recipeNoise(index, 1) - 0.47) * 6 + drift;
    const close = roundTo(open + move, 0.01);
    closes.push(close);
    const window = closes.slice(-5);
    rows.push({
      date: day(index),
      open: roundTo(open, 0.01),
      high: roundTo(
        Math.max(open, close) + recipeNoise(index, 2) * 2.4 + 0.4,
        0.01
      ),
      low: roundTo(
        Math.min(open, close) - recipeNoise(index, 3) * 2.4 - 0.4,
        0.01
      ),
      close,
      volume: Math.round(
        (36 + Math.abs(move) * 9 + recipeNoise(index, 4) * 16) * 1000
      ),
      average: roundTo(
        window.reduce((sum, value) => sum + value, 0) / window.length,
        0.01
      ),
    });
    open = close;
  }
  return rows;
})();

/** Index of the first forecast row in {@link recipeForecastData}. */
export const RECIPE_FORECAST_START = 20;

/** Actual visitors for 20 days, then a forecast with a widening range. */
export const recipeForecastData = recipeDailyData.map((row, index) => {
  const isForecast = index >= RECIPE_FORECAST_START;
  const expected = Math.round(1400 + index * 38);
  const value = isForecast ? expected : row.visitors;
  const spread = isForecast ? 60 + (index - RECIPE_FORECAST_START) * 55 : 0;
  return {
    date: row.date,
    ...(isForecast ? {} : { actual: row.visitors }),
    forecast: value,
    high: value + spread,
    low: value - spread,
  };
});

/** Noisy daily signups with a 7-day rolling mean. */
export const recipeSignalData = (() => {
  const values: number[] = [];
  return recipeDailyData.map((row, index) => {
    const signups = Math.round(
      row.visitors * 0.09 + (recipeNoise(index, 5) - 0.5) * 70
    );
    values.push(signups);
    const window = values.slice(-7);
    return {
      date: row.date,
      signups,
      average: Math.round(
        window.reduce((sum, value) => sum + value, 0) / window.length
      ),
    };
  });
})();

/**
 * Error-budget change per service, sorted ascending — a diverging ranking for
 * the lollipop profit / loss recipe.
 */
export const recipeServiceBudgetData = [
  { service: "Search indexer", change: -82.4 },
  { service: "Image resizer", change: -56.7 },
  { service: "Billing sync", change: -37.2 },
  { service: "Email digest", change: -16.5 },
  { service: "Audit export", change: -9.1 },
  { service: "Session store", change: 7.8 },
  { service: "Rate limiter", change: 17.4 },
  { service: "Feature flags", change: 20.6 },
  { service: "Webhook delivery success", change: 36.3 },
  { service: "Auth gateway", change: 50.8 },
  { service: "CDN edge", change: 54.9 },
  { service: "Payments API", change: 58.2 },
  { service: "Notifications", change: 68.6 },
  { service: "Job queue", change: 70.5 },
  { service: "GraphQL API", change: 74.9 },
  { service: "Metrics ingest", change: 84.3 },
  { service: "Status page", change: 88.6 },
  { service: "Static assets", change: 91.1 },
];
