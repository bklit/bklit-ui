"use client";

import { createContext, useContext } from "react";

/**
 * Jitter for `ScatterChart` — spreads points that share the same (or nearby)
 * x values so overlapping markers become readable (strip plot).
 *
 * - `true` — horizontal jitter of `0.35` band steps
 * - `number` — horizontal jitter as a fraction of the band step
 * - `{ x, y, seed }` — `x` as a band-step fraction, `y` in px, optional seed
 *
 * The band step is the smallest gap between adjacent distinct x values.
 */
export type ScatterJitter =
  | boolean
  | number
  | {
      /** Total horizontal spread as a fraction of the band step (0–1). Default: 0.35 */
      x?: number;
      /** Maximum vertical offset in px (±). Default: 0 */
      y?: number;
      /** Seed for the deterministic offset pattern. Default: 0 */
      seed?: number;
    };

export interface ResolvedScatterJitterConfig {
  /** Fraction of the band step (total spread). */
  x: number;
  /** Max vertical offset in px (±). */
  y: number;
  seed: number;
}

/** Jitter amplitudes in px, ready to apply to point positions. */
export interface ScatterJitterOffsets {
  /** Max horizontal offset (±px). */
  x: number;
  /** Max vertical offset (±px). */
  y: number;
  seed: number;
}

export const DEFAULT_SCATTER_JITTER_X = 0.35;

export function resolveScatterJitterConfig(
  jitter: ScatterJitter | undefined
): ResolvedScatterJitterConfig | null {
  if (jitter === undefined || jitter === false) {
    return null;
  }
  if (jitter === true) {
    return { x: DEFAULT_SCATTER_JITTER_X, y: 0, seed: 0 };
  }
  if (typeof jitter === "number") {
    return jitter > 0 ? { x: jitter, y: 0, seed: 0 } : null;
  }
  const x = Math.max(0, jitter.x ?? DEFAULT_SCATTER_JITTER_X);
  const y = Math.max(0, jitter.y ?? 0);
  if (x === 0 && y === 0) {
    return null;
  }
  return { x, y, seed: jitter.seed ?? 0 };
}

/**
 * Smallest gap between adjacent distinct x values, as a fraction of the full
 * x domain (0 when there are fewer than two distinct values).
 */
export function minDistinctStepRatio(times: number[]): number {
  const distinct = [...new Set(times.filter(Number.isFinite))].sort(
    (a, b) => a - b
  );
  if (distinct.length < 2) {
    return 0;
  }
  const first = distinct[0] ?? 0;
  const last = distinct.at(-1) ?? 0;
  const span = last - first;
  if (span <= 0) {
    return 0;
  }
  let minGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < distinct.length; i++) {
    const gap = (distinct[i] ?? 0) - (distinct[i - 1] ?? 0);
    if (gap < minGap) {
      minGap = gap;
    }
  }
  return minGap / span;
}

/**
 * Horizontal range padding that keeps jittered edge points inside the plot.
 * Solves `P = base + (x / 2) * (width - 2P) * ratio` for `P`.
 */
export function scatterJitterRangePadding(
  basePadding: number,
  innerWidth: number,
  stepRatio: number,
  jitterX: number
): number {
  if (jitterX <= 0 || stepRatio <= 0) {
    return basePadding;
  }
  return (
    (basePadding + (jitterX / 2) * innerWidth * stepRatio) /
    (1 + jitterX * stepRatio)
  );
}

const HASH_MODULUS = 2_147_483_647; // 2^31 − 1 (prime)
const HASH_SPLIT = 65_536;
const HASH_ROUND_CONSTANT = 1_013_904_223;

/**
 * `(a * b) mod HASH_MODULUS` for `a, b < 2^31`, splitting `b` into 16-bit
 * halves so every intermediate stays below 2^53 (exact in float64).
 */
function mulMod(a: number, b: number): number {
  const high = Math.floor(b / HASH_SPLIT);
  const low = b % HASH_SPLIT;
  return (((a * high) % HASH_MODULUS) * HASH_SPLIT + a * low) % HASH_MODULUS;
}

/**
 * Deterministic pseudo-random value in `[-1, 1]` for a point. Exact integer
 * math (no `Math.random`, no bitwise ops), so offsets are identical across
 * renders, engines and SSR/hydration.
 */
export function scatterJitterUnit(
  seed: number,
  index: number,
  seriesIndex: number,
  axis: 0 | 1
): number {
  let state =
    (Math.abs(Math.trunc(seed)) * 7919 +
      index * 104_729 +
      seriesIndex * 1_299_709 +
      axis * 15_485_863 +
      1) %
    HASH_MODULUS;
  // Modular squaring is non-linear, so neighbouring indices don't produce
  // evenly stepped (diagonal) offsets.
  for (let round = 0; round < 4; round++) {
    state = (mulMod(state, state) + HASH_ROUND_CONSTANT) % HASH_MODULUS;
    state = mulMod(state, 48_271);
  }
  return (state / (HASH_MODULUS - 1)) * 2 - 1;
}

export function scatterJitterOffset(
  jitter: ScatterJitterOffsets,
  index: number,
  seriesIndex: number
): { x: number; y: number } {
  return {
    x:
      jitter.x > 0
        ? scatterJitterUnit(jitter.seed, index, seriesIndex, 0) * jitter.x
        : 0,
    y:
      jitter.y > 0
        ? scatterJitterUnit(jitter.seed, index, seriesIndex, 1) * jitter.y
        : 0,
  };
}

export const ScatterJitterContext = createContext<ScatterJitterOffsets | null>(
  null
);

export function useScatterJitter(): ScatterJitterOffsets | null {
  return useContext(ScatterJitterContext);
}
