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

/** A café's cups per hour, 00:00 → 23:00 (open 06:00–20:00), for radial clocks. */
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
