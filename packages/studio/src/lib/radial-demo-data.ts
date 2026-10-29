import { type RadialSeries, useStaticChartPreview } from "@bklitui/ui/charts";
import { useMemo } from "react";
import { nowBinIndex, useLocalNow } from "./use-local-now";

/**
 * Studio demo data for the radial chart — mirrors the featured docs / gallery
 * example (`apps/web/components/charts/radial/pull-request-day-data.ts`):
 * pull requests per 15-minute bin over a 24h day (96 bins, clockwise from
 * 00:00). Values are seeded per local day and drawn for every bin, so the past
 * stays put as "now" advances. Bins after "now" have null counts and carry
 * only yesterday's values (ghost dots).
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

/**
 * Deterministic fallback "now" — 14:15 on 2026-01-14 (bin 14:15–14:30). Used
 * for SSR / hydration, static previews (OG capture, catalog tiles) and codegen.
 */
export const PULL_REQUEST_FALLBACK_NOW_INDEX = 57;
export const PULL_REQUEST_FALLBACK_DAY_KEY = 20_260_114;

const BASE_SEED = 2598;
const PARK_MILLER_MODULUS = 2_147_483_647;

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

/** Mix the day into the seed; the fallback day keeps the original seed. */
function daySeed(dayKey: number): number {
  const mixed =
    Math.imul(dayKey - PULL_REQUEST_FALLBACK_DAY_KEY, 0x9e_37_79_b1) %
    PARK_MILLER_MODULUS;
  const seed =
    (((BASE_SEED + mixed) % PARK_MILLER_MODULUS) + PARK_MILLER_MODULUS) %
    PARK_MILLER_MODULUS;
  return seed === 0 ? 1 : seed;
}

function binTime(index: number): string {
  const minutes = index * (1440 / PULL_REQUEST_BIN_COUNT);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Label for the end of bin `index` — "24:00" after the last bin. */
export function pullRequestBinEndLabel(index: number): string {
  return index + 1 >= PULL_REQUEST_BIN_COUNT ? "24:00" : binTime(index + 1);
}

/**
 * One day of pull requests. Random values are drawn for every bin regardless
 * of `nowIndex`, then today's fields after it are nulled — so the same
 * `dayKey` always yields the same past as the clock ticks forward.
 */
export function generatePullRequestDay({
  nowIndex,
  dayKey,
}: {
  nowIndex: number;
  dayKey: number;
}): PullRequestBin[] {
  const rand = seededRandom(daySeed(dayKey));
  return Array.from({ length: PULL_REQUEST_BIN_COUNT }, (_, i) => {
    const hour = ((i + 0.5) * 24) / PULL_REQUEST_BIN_COUNT;
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

/** Deterministic snapshot (14:15 on 2026-01-14) — codegen and tests. */
export const fallbackPullRequestDayData = generatePullRequestDay({
  nowIndex: PULL_REQUEST_FALLBACK_NOW_INDEX,
  dayKey: PULL_REQUEST_FALLBACK_DAY_KEY,
});

/**
 * Today's pull requests up to the viewer's local "now", re-generated only when
 * the 15-minute bin or the local day changes. Static previews (OG capture,
 * catalog tiles) stay on the deterministic fallback.
 */
export function usePullRequestDay(): {
  data: PullRequestBin[];
  nowIndex: number;
} {
  const staticPreview = useStaticChartPreview();
  const { minuteOfDay, dayKey, isLive } = useLocalNow();
  const live = isLive && !staticPreview;
  const nowIndex = live
    ? nowBinIndex(minuteOfDay, PULL_REQUEST_BIN_COUNT)
    : PULL_REQUEST_FALLBACK_NOW_INDEX;
  const seedDay = live ? dayKey : PULL_REQUEST_FALLBACK_DAY_KEY;
  const data = useMemo(
    () =>
      seedDay === PULL_REQUEST_FALLBACK_DAY_KEY &&
      nowIndex === PULL_REQUEST_FALLBACK_NOW_INDEX
        ? fallbackPullRequestDayData
        : generatePullRequestDay({ nowIndex, dayKey: seedDay }),
    [nowIndex, seedDay]
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
