import { TooltipContent } from "@bklitui/ui/charts";

/**
 * Jittered scatter demo: lines changed per merged PR, month by month.
 * "Fastlane" PRs are auto-merged and always < 500 LOC; human-reviewed PRs
 * spread wider with a few large outliers. Deterministic (seeded Park–Miller
 * with exact integer math) so server and client produce identical rows.
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return state / 2_147_483_647;
  };
}

export interface PrLocRow {
  [key: string]: unknown;
  date: Date;
  fastlane?: number;
  human?: number;
}

export function buildPrLocData(seed = 42): PrLocRow[] {
  const random = seededRandom(seed);
  const rows: PrLocRow[] = [];
  for (let month = 0; month < 12; month++) {
    const date = new Date(2025, month, 1);
    const fastlaneCount = 15 + Math.floor(random() * 16);
    for (let i = 0; i < fastlaneCount; i++) {
      const r = random();
      // r² skews toward small diffs: 10–490 LOC
      rows.push({ date, fastlane: Math.round(10 + r * r * 480) });
    }
    const humanCount = 15 + Math.floor(random() * 16);
    for (let i = 0; i < humanCount; i++) {
      const r = random();
      const isOutlier = random() < 0.06;
      rows.push({
        date,
        human: Math.round(
          isOutlier ? 1500 + r * 1000 : 40 + r * Math.sqrt(r) * 1160
        ),
      });
    }
  }
  return rows;
}

export const prLocData = buildPrLocData();

export const prLocSeries = {
  fastlane: { label: "Fastlane (auto-merged)", color: "var(--chart-1)" },
  human: { label: "Human reviewed", color: "var(--chart-2)" },
} as const;

const shortMonthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const locFmt = new Intl.NumberFormat("en-US");

export const formatPrMonth = (date: Date) => shortMonthFmt.format(date);

export const formatLoc = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value);

export function PrLocTooltip({ point }: { point: Record<string, unknown> }) {
  const rows = (["fastlane", "human"] as const).flatMap((key) => {
    const value = point[key];
    return typeof value === "number"
      ? [
          {
            color: prLocSeries[key].color,
            label: prLocSeries[key].label,
            value: `${locFmt.format(value)} LOC`,
          },
        ]
      : [];
  });
  return (
    <TooltipContent
      rows={rows}
      title={monthYearFmt.format(point.date as Date)}
    />
  );
}

/** Copy-paste snippet for docs + gallery (mirrors the helpers above). */
export const prLocDataSnippet = `import {
  ChartTooltip,
  Grid,
  Scatter,
  ScatterChart,
  TooltipContent,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";

// Seeded Park–Miller PRNG — identical on server and client (no Math.random)
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return state / 2_147_483_647;
  };
}

const random = seededRandom(42);
const chartData: { date: Date; fastlane?: number; human?: number }[] = [];
for (let month = 0; month < 12; month++) {
  const date = new Date(2025, month, 1);
  // Fastlane: auto-merged PRs, always < 500 LOC, skewed small
  const fastlaneCount = 15 + Math.floor(random() * 16);
  for (let i = 0; i < fastlaneCount; i++) {
    const r = random();
    chartData.push({ date, fastlane: Math.round(10 + r * r * 480) });
  }
  // Human reviewed: broader spread with a few large outliers
  const humanCount = 15 + Math.floor(random() * 16);
  for (let i = 0; i < humanCount; i++) {
    const r = random();
    const isOutlier = random() < 0.06;
    chartData.push({
      date,
      human: Math.round(isOutlier ? 1500 + r * 1000 : 40 + r * Math.sqrt(r) * 1160),
    });
  }
}

const series = {
  fastlane: { label: "Fastlane (auto-merged)", color: "var(--chart-1)" },
  human: { label: "Human reviewed", color: "var(--chart-2)" },
} as const;

const shortMonthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const locFmt = new Intl.NumberFormat("en-US");
const formatMonth = (date: Date) => shortMonthFmt.format(date);
const formatLoc = (value: number) => (value >= 1000 ? \`\${value / 1000}k\` : String(value));

function PrTooltip({ point }: { point: Record<string, unknown> }) {
  const rows = (["fastlane", "human"] as const).flatMap((key) => {
    const value = point[key];
    return typeof value === "number"
      ? [{ color: series[key].color, label: series[key].label, value: \`\${locFmt.format(value)} LOC\` }]
      : [];
  });
  return <TooltipContent rows={rows} title={monthYearFmt.format(point.date as Date)} />;
}`;

export const prLocChartSnippet = `<ScatterChart
  data={chartData}
  formatXLabel={formatMonth}
  jitter={{ x: 0.6 }}
  margin={{ top: 8, right: 8, bottom: 40, left: 56 }}
>
  <Grid horizontal highlightRowValues={[500]} highlightRowStrokeDasharray="4,4" />
  <Scatter dataKey="fastlane" fill={series.fastlane.color} radius={3} />
  <Scatter dataKey="human" fill={series.human.color} radius={3} />
  <YAxis formatValue={formatLoc} />
  <XAxis numTicks={12} />
  <ChartTooltip content={({ point }) => <PrTooltip point={point} />} />
</ScatterChart>`;
