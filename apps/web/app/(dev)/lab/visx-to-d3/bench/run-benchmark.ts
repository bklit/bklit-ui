import type { LabSide } from "../fixtures";
import { type FrameStats, frameStats, startFrameRecorder } from "./frames";
import { runHoverPass } from "./hover";
import { delay, nextFrame, waitForSettle } from "./settle";

export interface ProfilerCommit {
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  commitTime: number;
}

/** Imperative handle onto the benchmark stage component. */
export interface BenchStageDriver {
  /** Renders `variant` alone in the stage (replacing whatever was there). */
  mount: (variant: LabSide, runKey: number) => void;
  unmount: () => void;
  element: () => HTMLElement | null;
  /** Returns and clears the Profiler commits recorded since the last call. */
  takeCommits: () => ProfilerCommit[];
}

export interface RunRecord extends FrameStats {
  run: number;
  variant: LabSide;
  warmup: boolean;
  /** `actualDuration` of the mount commit. */
  mountCommitMs: number;
  /** Sum of `actualDuration` over every commit from mount to settle. */
  totalCommitMs: number;
  commits: number;
  settleMs: number;
  settled: boolean;
  hoverCommitMs: number | null;
  hoverCommits: number | null;
  hoverPoints: number | null;
}

export interface BenchmarkOptions {
  driver: BenchStageDriver;
  iterations: number;
  hover: boolean;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number, variant: LabSide) => void;
}

/** Runs between mounts so GC / idle work from the last run lands outside. */
const COOLDOWN_MS = 120;

/**
 * Pair 0 is warm-up (discarded in the summary). Later pairs alternate order
 * (before→after, after→before, …) so slow drift on the machine hits both
 * sides equally.
 */
function runOrder(iterations: number): LabSide[] {
  const order: LabSide[] = [];
  for (let pair = 0; pair <= iterations; pair++) {
    order.push(
      ...(pair % 2 === 0
        ? (["before", "after"] as const)
        : (["after", "before"] as const))
    );
  }
  return order;
}

function sumDuration(commits: ProfilerCommit[]): number {
  return commits.reduce((sum, c) => sum + c.actualDuration, 0);
}

async function measureRun(
  driver: BenchStageDriver,
  variant: LabSide,
  run: number,
  hover: boolean,
  signal?: AbortSignal
): Promise<Omit<RunRecord, "warmup">> {
  const stage = driver.element();
  if (!stage) {
    throw new Error("Benchmark stage is not mounted");
  }
  driver.takeCommits();

  const startedAt = performance.now();
  const settlePromise = waitForSettle(stage, { startedAt, signal });
  const recorder = startFrameRecorder();
  driver.mount(variant, run);
  const settle = await settlePromise;
  const stamps = recorder.stop();
  const enterCommits = driver.takeCommits();
  const mountCommit = enterCommits.find((c) => c.phase === "mount");

  let hoverCommitMs: number | null = null;
  let hoverCommits: number | null = null;
  let hoverPoints: number | null = null;
  if (hover && !signal?.aborted) {
    const hoverSettle = waitForSettle(stage, { signal, timeoutMs: 15_000 });
    hoverPoints = await runHoverPass(stage, signal);
    await hoverSettle;
    const commits = driver.takeCommits();
    hoverCommitMs = sumDuration(commits);
    hoverCommits = commits.length;
  }

  return {
    run,
    variant,
    mountCommitMs: mountCommit?.actualDuration ?? 0,
    totalCommitMs: sumDuration(enterCommits),
    commits: enterCommits.length,
    settleMs: settle.settleMs,
    settled: settle.settled,
    ...frameStats(stamps, startedAt, settle.lastMutationAt),
    hoverCommitMs,
    hoverCommits,
    hoverPoints,
  };
}

export async function runBenchmark({
  driver,
  iterations,
  hover,
  signal,
  onProgress,
}: BenchmarkOptions): Promise<RunRecord[]> {
  const order = runOrder(iterations);
  const records: RunRecord[] = [];
  for (const [run, variant] of order.entries()) {
    if (signal?.aborted) {
      break;
    }
    onProgress?.(run, order.length, variant);
    const record = await measureRun(driver, variant, run, hover, signal);
    records.push({ ...record, warmup: run < 2 });
    driver.unmount();
    await nextFrame();
    await nextFrame();
    await delay(COOLDOWN_MS);
  }
  onProgress?.(records.length, order.length, "after");
  return records;
}
