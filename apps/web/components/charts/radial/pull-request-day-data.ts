import type { RadialSeries } from "@bklitui/ui/charts";
import { useMemo } from "react";
import {
  nowBinIndex,
  useLocalNow,
} from "@/components/charts/radial/use-local-now";

/**
 * Shared demo data for radial gallery variants: pull requests per 15-minute
 * bin over a 24h day (96 bins, clockwise from 00:00), seeded per local day so
 * SSR and client render the same marks. Today's bins run up to the viewer's
 * local time; bins after "now" have null counts and carry only yesterday's
 * values for ghost / comparison layers.
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
  [9, 8.6],
  // Morning spike around 10:45
  [10, 10.4],
  [10.5, 13.6],
  [11, 14],
  [11.5, 12.2],
  // Lunch dip
  [12.25, 9.6],
  [13, 10.4],
  // Wide afternoon spike, 14:00–15:30
  [13.75, 13.4],
  [14.25, 14.2],
  [15.25, 14],
  [15.75, 12],
  [16.25, 10.2],
  // Short spike before the end of the day
  [16.75, 13],
  [17.25, 10.6],
  [18, 8.6],
  [19, 9.8],
  [20, 11.4],
  [21, 11.8],
  [22, 9],
  [23, 5.8],
  [24, 1.3],
];

const yesterdayProfile: Profile = [
  [0, 1.2],
  [5, 1.4],
  [6, 2.8],
  [8, 7],
  [10, 10.6],
  [11.25, 13.4],
  [12, 11],
  [12.75, 10],
  [14, 12.4],
  [15, 13.6],
  [16, 11.4],
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

/** 15-minute bins per day. */
export const PULL_REQUEST_BIN_COUNT = 96;

/** Odd burst of draft PRs, 01:15–03:30, peaking around 02:14. */
const draftSpike: Record<number, number> = {
  5: 90,
  6: 260,
  7: 520,
  8: 720,
  9: 660,
  10: 540,
  11: 380,
  12: 220,
  13: 110,
  14: 40,
};

const BASE_SEED = 2598;
const PARK_MILLER_MODULUS = 2_147_483_647;

/**
 * Seed for `dayKey`: a few Park–Miller steps from the base seed plus the day,
 * so adjacent days (keys differing by 1) get unrelated noise.
 */
function daySeed(dayKey: number): number {
  const warm = seededRandom(BASE_SEED + dayKey);
  warm();
  warm();
  return Math.floor(warm() * (PARK_MILLER_MODULUS - 2)) + 1;
}

/** "HH:MM" at the start of bin `index` (bin 96 is "24:00"). */
function binTime(index: number): string {
  const minutes = index * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** End of the "now" bin, e.g. "14:30" ("24:00" in the day's last bin). */
export function pullRequestNowLabel(nowIndex: number): string {
  return binTime(nowIndex + 1);
}

/**
 * One day of bins. Every bin draws its random values whatever `nowIndex` is,
 * so the past stays put as "now" advances; bins after `nowIndex` then drop
 * today's counts.
 */
export function generatePullRequestDay({
  nowIndex,
  dayKey,
}: {
  /** Last bin with data today ("now") */
  nowIndex: number;
  /** Local date as YYYYMMDD — varies the noise from day to day */
  dayKey: number;
}): PullRequestBin[] {
  const rand = seededRandom(daySeed(dayKey));
  return Array.from({ length: PULL_REQUEST_BIN_COUNT }, (_, i) => {
    const hour = (i + 0.5) / 4;
    const time = binTime(i);
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

    if (i > nowIndex) {
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

/**
 * Today's bins up to the viewer's local time, regenerated only when the
 * 15-minute bin or the local day changes.
 */
export function usePullRequestDay(): {
  data: PullRequestBin[];
  nowIndex: number;
} {
  const { minuteOfDay, dayKey } = useLocalNow();
  const nowIndex = nowBinIndex(minuteOfDay, PULL_REQUEST_BIN_COUNT);
  const data = useMemo(
    () => generatePullRequestDay({ nowIndex, dayKey }),
    [nowIndex, dayKey]
  );
  return { data, nowIndex };
}

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
