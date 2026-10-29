"use client";

import { useSyncExternalStore } from "react";

/**
 * The viewer's local wall-clock time, for demos whose data runs "up to now".
 *
 * The server (and the hydration pass) render a fixed fallback — 14:15 on
 * 2026-01-14 — so SSR and the first client render agree; React then
 * re-renders with the real local time and keeps it ticking each minute.
 *
 * Copy of `apps/web/components/charts/radial/use-local-now.ts` (studio can't
 * import from apps/web) — keep the two in sync.
 */
export interface LocalNow {
  /** Minutes since local midnight, 0–1439 */
  minuteOfDay: number;
  /** Local calendar date as YYYYMMDD — a stable per-day seed */
  dayKey: number;
  /** False during SSR / hydration (the fallback time) */
  isLive: boolean;
}

const MINUTES_PER_DAY = 1440;
const FALLBACK_DAY_KEY = 20_260_114;
const FALLBACK_MINUTE = 14 * 60 + 15;
/** Negative so it can't collide with a real snapshot. */
const SERVER_SNAPSHOT = -1;

function readSnapshot(): number {
  const now = new Date();
  const dayKey =
    now.getFullYear() * 10_000 + (now.getMonth() + 1) * 100 + now.getDate();
  return dayKey * MINUTES_PER_DAY + now.getHours() * 60 + now.getMinutes();
}

function subscribe(onChange: () => void): () => void {
  let interval: ReturnType<typeof setInterval> | undefined;
  // Align ticks to the top of each minute.
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, 60_000);
    },
    60_000 - (Date.now() % 60_000)
  );
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

function getServerSnapshot(): number {
  return SERVER_SNAPSHOT;
}

export function useLocalNow(): LocalNow {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot
  );
  if (snapshot === SERVER_SNAPSHOT) {
    return {
      minuteOfDay: FALLBACK_MINUTE,
      dayKey: FALLBACK_DAY_KEY,
      isLive: false,
    };
  }
  return {
    minuteOfDay: snapshot % MINUTES_PER_DAY,
    dayKey: Math.floor(snapshot / MINUTES_PER_DAY),
    isLive: true,
  };
}

/** Index of the bin containing `minuteOfDay` for `binCount` equal bins per day. */
export function nowBinIndex(minuteOfDay: number, binCount: number): number {
  return Math.min(
    binCount - 1,
    Math.floor((minuteOfDay / MINUTES_PER_DAY) * binCount)
  );
}
