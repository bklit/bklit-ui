import type { BenchChartKind, BenchDataset, BenchRow } from "./types";

const DAY_MS = 86_400_000;
/** Fixed start so every run (and every library) sees identical dates. */
const START_MS = Date.UTC(2020, 0, 1);

const LCG_MODULUS = 2 ** 32;

/**
 * Deterministic PRNG (Numerical Recipes LCG). Arithmetic stays below 2^53,
 * so it is exact in doubles; plenty for chart test data.
 */
export function createBenchRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % LCG_MODULUS;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % LCG_MODULUS;
    return state / LCG_MODULUS;
  };
}

/**
 * Deterministic dataset: one smooth random walk per series (momentum keeps it
 * line-like rather than noise), daily dates, and short labels for bars.
 */
export function generateBenchDataset(
  kind: BenchChartKind,
  size: number,
  seriesCount: number,
  seed: number
): BenchDataset {
  const random = createBenchRandom(seed);
  const rows: BenchRow[] = Array.from({ length: size }, (_, index) => {
    const t = START_MS + index * DAY_MS;
    return { date: new Date(t), t, label: `#${index + 1}` };
  });

  for (let series = 0; series < seriesCount; series++) {
    let value = 40 + random() * 40;
    let velocity = 0;
    for (const row of rows) {
      // Momentum + gentle pull to the middle: smooth, never pinned at a bound.
      velocity = velocity * 0.8 + (random() - 0.5) * 4 + (80 - value) * 0.01;
      value = Math.min(160, Math.max(5, value + velocity));
      row[`s${series}`] = Math.round(value * 100) / 100;
    }
  }

  return { kind, size, seriesCount, seed, rows };
}

/** Same kind/size/series, different values: the input for update benchmarks. */
export function nextBenchDataset(previous: BenchDataset): BenchDataset {
  return generateBenchDataset(
    previous.kind,
    previous.size,
    previous.seriesCount,
    (previous.seed + 2_654_435_769) % LCG_MODULUS
  );
}
