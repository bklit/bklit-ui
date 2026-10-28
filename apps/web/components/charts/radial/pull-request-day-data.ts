import type { RadialSeries } from "@bklitui/ui/charts";

/**
 * Shared demo data for radial gallery variants: pull requests per 15-minute
 * bin over a 24h day (96 bins, clockwise from 00:00), deterministic so SSR and
 * client render the same marks. Bins after "now" (14:15) have null counts and
 * carry only yesterday's values for ghost / comparison layers.
 */
export interface PullRequestBin extends Record<string, unknown> {
  time: string;
  /** Today's counts — null for the rest of the day (after "now") */
  merged: number | null;
  ready: number | null;
  draft: number | null;
  /** Yesterday, same bin: all PRs and merged PRs (ghost comparison) */
  yesterday: number;
  yesterdayMerged: number;
}

/** Park–Miller PRNG — deterministic so SSR and client render the same dots. */
function seededRandom(seed: number) {
  let state = seed % 2_147_483_647;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

type Profile = [hour: number, rows: number][];

/** Stack height (in dot rows) through the day. */
const todayProfile: Profile = [
  [0, 1],
  [4.25, 1],
  [5, 1.6],
  [6, 2.6],
  [7, 4.5],
  [8, 6.8],
  [9, 9],
  [10, 11],
  [11, 12.6],
  [12, 13.4],
  [13, 12.8],
  [14.5, 12.4],
];

const yesterdayProfile: Profile = [
  [0, 1.2],
  [5, 1.4],
  [6, 2.8],
  [8, 7],
  [10, 11],
  [12, 13],
  [14, 12.6],
  [15, 12.4],
  [16, 11.2],
  [17, 9.8],
  [18, 8.6],
  [19, 9.6],
  [20, 11.8],
  [21, 12],
  [22, 9.4],
  [23, 6.2],
  [24, 1.4],
];

function interpolate(profile: Profile, hour: number): number {
  for (let i = 1; i < profile.length; i++) {
    const [h0, v0] = profile[i - 1] as [number, number];
    const [h1, v1] = profile[i] as [number, number];
    if (hour <= h1) {
      return v0 + ((v1 - v0) * (hour - h0)) / (h1 - h0);
    }
  }
  return profile.at(-1)?.[1] ?? 0;
}

/** Rows → PRs for a radial scale (14 rows ≈ 1,000 PRs per bin). */
function rowsToCount(rows: number): number {
  return (1000 * (27 * rows + rows * rows)) / 574;
}

/** Last bin with data today (14:15–14:30) — "now". */
export const PULL_REQUEST_NOW_INDEX = 57;

/** Odd burst of draft PRs around 02:14. */
const draftSpike: Record<number, number> = { 8: 720, 9: 640, 10: 500 };

function generatePullRequestDay(): PullRequestBin[] {
  const rand = seededRandom(2598);
  return Array.from({ length: 96 }, (_, i) => {
    const hour = (i + 0.5) / 4;
    const time = `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`;
    const yesterdayRows = Math.max(
      0.6,
      interpolate(yesterdayProfile, hour) + (rand() - 0.5) * 1.4
    );
    const yesterday = Math.round(rowsToCount(yesterdayRows));
    const yesterdayMerged = Math.round(yesterday * (0.952 + rand() * 0.02));
    const rows = Math.max(
      0.6,
      interpolate(todayProfile, hour) + (rand() - 0.5) * 1.5
    );
    const total = Math.round(rowsToCount(rows));
    const readyRoll = rand();
    const readyShare = 0.05 + rand() * 0.04;
    const ready =
      rows > 2 && readyRoll < 0.5 ? Math.round(total * readyShare) : 0;
    const draft = draftSpike[i] ?? 0;

    if (i > PULL_REQUEST_NOW_INDEX) {
      return {
        time,
        merged: null,
        ready: null,
        draft: null,
        yesterday,
        yesterdayMerged,
      };
    }
    return {
      time,
      merged: total - ready,
      ready,
      draft,
      yesterday,
      yesterdayMerged,
    };
  });
}

export const pullRequestDayData = generatePullRequestDay();

export const pullRequestSeries: RadialSeries[] = [
  {
    dataKey: "merged",
    label: "Merged",
    color: "var(--chart-1)",
    rampFrom: 0.4,
  },
  {
    dataKey: "ready",
    label: "Ready for merge",
    color: "var(--chart-2)",
  },
  {
    dataKey: "draft",
    label: "Draft",
    color: "var(--chart-3)",
    emphasize: true,
  },
];

/** Bin of the odd draft burst (02:00–02:15), labelled "02:14". */
export const PULL_REQUEST_SPIKE_INDEX = 8;
