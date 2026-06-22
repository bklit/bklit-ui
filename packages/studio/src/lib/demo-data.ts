import type {
  FunnelStage,
  HeatmapColumn,
  OHLCDataPoint,
  PieData,
  RadarData,
  RadarMetric,
  RingData,
} from "@bklitui/ui/charts";

export const areaData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

export const lineData = [
  { date: new Date(2024, 0, 1), desktop: 186 },
  { date: new Date(2024, 1, 1), desktop: 305 },
  { date: new Date(2024, 2, 1), desktop: 237 },
  { date: new Date(2024, 3, 1), desktop: 73 },
  { date: new Date(2024, 4, 1), desktop: 209 },
  { date: new Date(2024, 5, 1), desktop: 214 },
];

export const barStackedData = [
  { month: "Jan", desktop: 4000, mobile: 2400 },
  { month: "Feb", desktop: 5000, mobile: 3000 },
  { month: "Mar", desktop: 3500, mobile: 2800 },
  { month: "Apr", desktop: 4200, mobile: 3200 },
  { month: "May", desktop: 3800, mobile: 2600 },
  { month: "Jun", desktop: 5500, mobile: 3800 },
];

export const barHorizontalData = [
  { browser: "Chrome", users: 275 },
  { browser: "Safari", users: 200 },
  { browser: "Firefox", users: 187 },
  { browser: "Edge", users: 173 },
  { browser: "Other", users: 90 },
];

export const barData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "Jun", desktop: 214 },
  { month: "Jul", desktop: 268 },
  { month: "Aug", desktop: 192 },
  { month: "Sep", desktop: 241 },
  { month: "Oct", desktop: 278 },
  { month: "Nov", desktop: 195 },
  { month: "Dec", desktop: 322 },
];

export const composedDemoData = [
  { date: new Date(2024, 0, 1), revenue: 12_400, runRate: 9800 },
  { date: new Date(2024, 1, 1), revenue: 15_200, runRate: 11_100 },
  { date: new Date(2024, 2, 1), revenue: 13_800, runRate: 10_500 },
  { date: new Date(2024, 3, 1), revenue: 18_600, runRate: 14_200 },
  { date: new Date(2024, 4, 1), revenue: 16_900, runRate: 13_400 },
  { date: new Date(2024, 5, 1), revenue: 21_200, runRate: 16_800 },
];

export const pieData: PieData[] = [
  { label: "Chrome", value: 275, color: "var(--chart-1)" },
  { label: "Safari", value: 200, color: "var(--chart-2)" },
  { label: "Firefox", value: 187, color: "var(--chart-3)" },
  { label: "Edge", value: 173, color: "var(--chart-4)" },
  { label: "Other", value: 90, color: "var(--chart-5)" },
];

export const ringData: RingData[] = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "var(--chart-1)" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "var(--chart-2)" },
  { label: "Email", value: 2100, maxValue: 5000, color: "var(--chart-3)" },
  { label: "Social", value: 1580, maxValue: 5000, color: "var(--chart-4)" },
];

export const radarMetrics5: RadarMetric[] = [
  { key: "speed", label: "Speed" },
  { key: "reliability", label: "Reliability" },
  { key: "comfort", label: "Comfort" },
  { key: "efficiency", label: "Efficiency" },
  { key: "safety", label: "Safety" },
];

export const radarDataDual: RadarData[] = [
  {
    label: "Model A",
    color: "var(--chart-1)",
    values: {
      speed: 85,
      reliability: 78,
      comfort: 92,
      efficiency: 70,
      safety: 88,
    },
  },
  {
    label: "Model B",
    color: "var(--chart-3)",
    values: {
      speed: 72,
      reliability: 90,
      comfort: 65,
      efficiency: 88,
      safety: 75,
    },
  },
];

export const funnelData: FunnelStage[] = [
  { label: "Visitors", value: 10_000 },
  { label: "Sign-ups", value: 4200 },
  { label: "Activated", value: 2100 },
  { label: "Subscribed", value: 890 },
  { label: "Retained", value: 520 },
];

export const sankeySimple = {
  nodes: [
    { name: "A", category: "source" as const },
    { name: "B", category: "source" as const },
    { name: "X", category: "landing" as const },
    { name: "Y", category: "landing" as const },
    { name: "Z", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 2, value: 40 },
    { source: 0, target: 3, value: 20 },
    { source: 1, target: 2, value: 30 },
    { source: 1, target: 3, value: 35 },
    { source: 2, target: 4, value: 70 },
    { source: 3, target: 4, value: 55 },
  ],
};

export const candlestickOhlcData: OHLCDataPoint[] = (() => {
  const points: OHLCDataPoint[] = [];
  const days = 30;
  let open = 100;
  const base = new Date(2024, 0, 1).getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(base + i * 24 * 60 * 60 * 1000);
    const volatility = 1.5 + Math.random() * 1.5;
    const drift = (Math.random() - 0.48) * volatility;
    const high = open + Math.abs(drift) * (1.5 + Math.random());
    const low = open - Math.abs(drift) * (1.5 + Math.random());
    const close = low + Math.random() * (high - low);
    points.push({ date, open, high, low, close });
    open = close;
  }
  return points;
})();

/** Reference band bounds that fit the default OHLC demo (~90–115). */
export function getCandlestickReferenceAreaDefaults(): {
  referenceAreaY1: number;
  referenceAreaY2: number;
} {
  return referenceAreaBoundsForOhlc(candlestickOhlcData);
}

export function referenceAreaBoundsForOhlc(data: OHLCDataPoint[]): {
  referenceAreaY1: number;
  referenceAreaY2: number;
} {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const point of data) {
    min = Math.min(min, point.low);
    max = Math.max(max, point.high);
  }
  const span = max - min;
  return {
    referenceAreaY1: Math.round(min + span * 0.25),
    referenceAreaY2: Math.round(min + span * 0.75),
  };
}

/** When URL bounds are outside OHLC range, use data-fitted defaults for preview. */
export function resolveCandlestickReferenceAreaBounds(
  state: { referenceAreaY1: number; referenceAreaY2: number },
  data: OHLCDataPoint[]
): { referenceAreaY1: number; referenceAreaY2: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const point of data) {
    min = Math.min(min, point.low);
    max = Math.max(max, point.high);
  }
  const low = Math.min(state.referenceAreaY1, state.referenceAreaY2);
  const high = Math.max(state.referenceAreaY1, state.referenceAreaY2);
  if (high < min || low > max) {
    return referenceAreaBoundsForOhlc(data);
  }
  return {
    referenceAreaY1: state.referenceAreaY1,
    referenceAreaY2: state.referenceAreaY2,
  };
}

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
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
  Philippines: 3,
  Thailand: 2,
};

export const lineHeroData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  desktop: Math.floor(150 + Math.sin(i / 4) * 80 + ((i * 7) % 31)),
}));

export const scatterStudioData = lineHeroData.map((row, i) => ({
  ...row,
  mobile: Math.floor(80 + Math.cos(i / 3) * 50 + ((i * 5) % 23)),
}));

/** Sample points for live line chart codegen. */
export const liveLineSampleData = Array.from({ length: 24 }, (_, i) => ({
  time: Date.now() - (23 - i) * 1000,
  value: Math.floor(40 + Math.sin(i / 3) * 18 + ((i * 5) % 11)),
}));

/**
 * Series keys + matching chart-N CSS vars used by procedural generators.
 * Only 5 chart-N vars exist, so series 6–10 cycle back through chart-1…chart-5.
 */
export const STUDIO_SERIES_KEYS = [
  "desktop",
  "mobile",
  "tablet",
  "watch",
  "tv",
  "console",
  "vr",
  "kiosk",
  "ereader",
  "wearable",
] as const;
export const STUDIO_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;
const MONTH_LABELS = [
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
] as const;
export const STUDIO_MAX_DATA_SERIES = STUDIO_SERIES_KEYS.length;

/** Clamp the user-supplied series count to the supported range. */
export function clampStudioSeriesCount(n: number): number {
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  return Math.min(STUDIO_MAX_DATA_SERIES, Math.floor(n));
}

/** Clamp the user-supplied point count to the supported range. */
export function clampStudioPointCount(n: number): number {
  if (!Number.isFinite(n) || n < 2) {
    return 2;
  }
  return Math.min(365, Math.floor(n));
}

export const STUDIO_PROFIT_LOSS_DATA_KEY = "pnl";

/** Deterministic profit/loss sample data that crosses zero several times. */
export function generateStudioProfitLossData(pointCount: number, seed = 0) {
  const points = clampStudioPointCount(pointCount);
  const baseYear = 2024;

  return Array.from({ length: points }, (_, index) => {
    const i = seed === 0 ? index : index + seed * 9.17;
    const pnl = Math.round(
      Math.sin(i / 2.5) * 800 +
        Math.cos(i / 6) * 400 +
        (index - points / 2) * 15
    );

    return {
      date: new Date(baseYear, 0, index + 1),
      [STUDIO_PROFIT_LOSS_DATA_KEY]: pnl,
    };
  });
}

function scrambleFactor(index: number, seed: number): number {
  if (seed === 0) {
    return 1;
  }
  return 0.65 + (((index + seed * 13) * 17) % 70) / 100;
}

function seededRandom(seed: number) {
  let state = seed * 9973 + 1;
  return () => {
    state = (state * 16_807 + 0) % 2_147_483_647;
    return state / 2_147_483_647;
  };
}

export function getFunnelData(seed = 0): FunnelStage[] {
  return funnelData.map((stage, index) => ({
    ...stage,
    value: Math.max(1, Math.round(stage.value * scrambleFactor(index, seed))),
  }));
}

export function getPieData(seed = 0): PieData[] {
  return pieData.map((slice, index) => ({
    ...slice,
    value: Math.max(1, Math.round(slice.value * scrambleFactor(index, seed))),
  }));
}

export function getRingData(seed = 0): RingData[] {
  return ringData.map((ring, index) => ({
    ...ring,
    value: Math.max(1, Math.round(ring.value * scrambleFactor(index, seed))),
  }));
}

export function getRadarData(seed = 0): RadarData[] {
  if (seed === 0) {
    return radarDataDual;
  }
  return radarDataDual.map((series, seriesIndex) => ({
    ...series,
    values: Object.fromEntries(
      Object.entries(series.values).map(([key, value], metricIndex) => [
        key,
        Math.max(
          5,
          Math.min(
            100,
            Math.round(value * scrambleFactor(seriesIndex + metricIndex, seed))
          )
        ),
      ])
    ),
  }));
}

export function getScatterData(seed = 0) {
  return lineHeroData.map((row, index) => ({
    date: row.date,
    desktop: studioSeriesValue(index, 0, seed),
    mobile: studioSeriesValue(index, 1, seed),
  }));
}

const HEATMAP_WEEKS = 53;
const HEATMAP_DAYS = 7;

export const HEATMAP_WEEKS_ONE_YEAR = HEATMAP_WEEKS;
export const HEATMAP_WEEKS_TWO_YEARS = HEATMAP_WEEKS * 2;
/** ~4 months of weekly columns — used for compact catalog previews. */
export const HEATMAP_WEEKS_FOUR_MONTHS = Math.round(
  (HEATMAP_WEEKS_ONE_YEAR / 12) * 4
);

function heatmapContributionCount(
  seed: number,
  week: number,
  day: number,
  dayOfWeek: number
): number {
  const random = seededRandom(seed + week * 1009 + day * 9176);
  const weekRandom = seededRandom(seed + week * 524_287);

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekBusy = weekRandom();
  let burst = 0.85 + weekBusy * 0.3;
  if (weekBusy > 0.78) {
    burst = 1.75;
  } else if (weekBusy < 0.22) {
    burst = 0.28;
  }

  const activityChance = Math.min(
    0.9,
    (isWeekend ? 0.18 : 0.48) * burst + random() * 0.12
  );
  if (random() > activityChance) {
    return 0;
  }

  const level = random();
  if (level < 0.52) {
    return 1;
  }
  if (level < 0.76) {
    return 2;
  }
  if (level < 0.91) {
    return 3;
  }
  return 4;
}

export function getHeatmapData(
  seed = 0,
  weeks: number = HEATMAP_WEEKS_ONE_YEAR
): HeatmapColumn[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks - 1) * 7);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const columns: HeatmapColumn[] = [];
  const cursor = new Date(startDate);

  for (let week = 0; week < weeks; week++) {
    const bins = Array.from({ length: HEATMAP_DAYS }, (_, day) => {
      const date = new Date(cursor);
      const dayOfWeek = date.getDay();
      cursor.setDate(cursor.getDate() + 1);

      const isFuture = date > today;
      return {
        bin: day,
        count: isFuture
          ? 0
          : heatmapContributionCount(seed, week, day, dayOfWeek),
        date,
      };
    });

    columns.push({ bin: week, bins });
  }

  return columns;
}

export function getBarHorizontalData(seed = 0) {
  return barHorizontalData.map((row, index) => ({
    ...row,
    users: Math.max(1, Math.round(row.users * scrambleFactor(index, seed))),
  }));
}

export function getCandlestickData(seed = 0): OHLCDataPoint[] {
  if (seed === 0) {
    return candlestickOhlcData;
  }
  const random = seededRandom(seed);
  const points: OHLCDataPoint[] = [];
  const days = 30;
  let open = 100;
  const base = new Date(2024, 0, 1).getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(base + i * 24 * 60 * 60 * 1000);
    const volatility = 1.5 + random() * 1.5;
    const drift = (random() - 0.48) * volatility;
    const high = open + Math.abs(drift) * (1.5 + random());
    const low = open - Math.abs(drift) * (1.5 + random());
    const close = low + random() * (high - low);
    points.push({ date, open, high, low, close });
    open = close;
  }
  return points;
}

export function getSankeyData(seed = 0) {
  if (seed === 0) {
    return sankeySimple;
  }
  return {
    ...sankeySimple,
    links: sankeySimple.links.map((link, index) => ({
      ...link,
      value: Math.max(1, Math.round(link.value * scrambleFactor(index, seed))),
    })),
  };
}

export function getVisitorsByCountry(seed = 0): Record<string, number> {
  if (seed === 0) {
    return visitorsByCountry;
  }
  return Object.fromEntries(
    Object.entries(visitorsByCountry).map(([country, value], index) => [
      country,
      Math.max(1, Math.round(value * scrambleFactor(index, seed))),
    ])
  );
}

/** Phase-shift a 0–100 gauge fill percentage (not currency-scale center values). */
export function scrambleGaugeValue(value: number, seed: number): number {
  if (seed === 0) {
    return value;
  }
  const span = Math.max(value * 0.35, 25);
  const offset = ((seed * 7919) % 100) / 100 - 0.5;
  return Math.min(100, Math.max(0, Math.round(value + span * offset)));
}

/**
 * Deterministic, non-repeating series value — four sine/cosine waves at
 * geometrically-spaced periods (~30, ~10.7, ~3.8, ~1.9) so the signal looks
 * lively at every zoom (12 → 365 pts) without ever cycling exactly.
 *
 * `seed = 0` preserves the original formula (kept in sync with the inline
 * snippet emitted by `studioCartesianDataSnippet`). Non-zero seeds shift the
 * waveform by a non-integer phase so the curves look visibly different —
 * used by the studio's "scramble data" button to exercise re-render paths.
 */
function studioSeriesValue(
  index: number,
  seriesIndex: number,
  seed = 0
): number {
  const i = seed === 0 ? index : index + seed * 11.31;
  const arc = Math.sin((i + seriesIndex * 17) / 4.77) * (38 + seriesIndex * 3);
  const swell = Math.cos((i + seriesIndex * 7) / 1.7) * 24;
  const ripple = Math.sin((i + seriesIndex * 3) / 0.61) * 14;
  const jitter = Math.cos((i + seriesIndex * 11) / 0.31) * 8;
  const base = 180 + seriesIndex * 18;
  return Math.max(10, Math.floor(base + arc + swell + ripple + jitter));
}

export type StudioCartesianXAxis = "date" | "month";

interface StudioCartesianDatum {
  date?: Date;
  month?: string;
  [seriesKey: string]: Date | string | number | undefined;
}

/** Generate cartesian rows with N series + M points, x-axis is `date` or `month`. */
export function generateStudioCartesianData({
  seriesCount,
  pointCount,
  xAxis,
  seed = 0,
}: {
  seriesCount: number;
  pointCount: number;
  xAxis: StudioCartesianXAxis;
  /** Phase-shift the waveform without changing length — used to scramble values for re-render testing. */
  seed?: number;
}): StudioCartesianDatum[] {
  const series = clampStudioSeriesCount(seriesCount);
  const points = clampStudioPointCount(pointCount);
  const baseYear = 2024;
  return Array.from({ length: points }, (_, i) => {
    const row: StudioCartesianDatum = {};
    if (xAxis === "date") {
      row.date = new Date(baseYear, 0, i + 1);
    } else {
      const monthIdx = i % MONTH_LABELS.length;
      const yearOffset = Math.floor(i / MONTH_LABELS.length);
      row.month =
        yearOffset > 0
          ? `${MONTH_LABELS[monthIdx]} ${(baseYear + yearOffset) % 100}`
          : MONTH_LABELS[monthIdx];
    }
    for (let s = 0; s < series; s++) {
      const key = STUDIO_SERIES_KEYS[s];
      if (key) {
        row[key] = studioSeriesValue(i, s, seed);
      }
    }
    return row;
  });
}

export type StudioDataTrend = "up" | "down";

function trendingSeriesValue(
  index: number,
  seriesIndex: number,
  direction: StudioDataTrend
): number {
  const sign = direction === "up" ? 1 : -1;
  const base = 120 + seriesIndex * 18;
  const trend = sign * (5.5 + seriesIndex * 1.25) * index;
  const i = index + seriesIndex * 9;

  // Layered waves at multiple scales — trend stays readable, line feels organic.
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

/** Deterministic up/down trending cartesian rows for projection exploration. */
export function generateStudioTrendingData({
  direction,
  seriesCount,
  pointCount,
  xAxis,
}: {
  direction: StudioDataTrend;
  seriesCount: number;
  pointCount: number;
  xAxis: StudioCartesianXAxis;
}): StudioCartesianDatum[] {
  const series = clampStudioSeriesCount(seriesCount);
  const points = clampStudioPointCount(pointCount);
  const baseYear = 2024;
  return Array.from({ length: points }, (_, i) => {
    const row: StudioCartesianDatum = {};
    if (xAxis === "date") {
      row.date = new Date(baseYear, 0, i + 1);
    } else {
      const monthIdx = i % MONTH_LABELS.length;
      const yearOffset = Math.floor(i / MONTH_LABELS.length);
      row.month =
        yearOffset > 0
          ? `${MONTH_LABELS[monthIdx]} ${(baseYear + yearOffset) % 100}`
          : MONTH_LABELS[monthIdx];
    }
    for (let s = 0; s < series; s++) {
      const key = STUDIO_SERIES_KEYS[s];
      if (key) {
        row[key] = trendingSeriesValue(i, s, direction);
      }
    }
    return row;
  });
}
