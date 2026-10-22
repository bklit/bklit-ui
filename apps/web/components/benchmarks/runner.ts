"use client";

import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { BENCH_ADAPTERS } from "./adapters/index";
import { generateBenchDataset, nextBenchDataset } from "./data";
import type {
  BenchAnimationReference,
  BenchChartProps,
  BenchDataset,
  BenchLibraryAdapter,
  BenchLibraryId,
  BenchMetrics,
  BenchProgress,
  BenchResult,
  BenchRunConfig,
  RunBenchmark,
} from "./types";
import { resolveInitialAnimationMs } from "./types";

/** Base seed: identical data for every library within a configuration. */
const BENCH_SEED = 20_260_101;
/** Quiet window that marks the enter animation as settled. */
const SETTLE_QUIET_MS = 150;
/** Upper bound on waiting for an animation to settle. */
const SETTLE_CAP_MS = 5000;
/** Frames between runs, so layout/GC from the previous run doesn't leak in. */
const COOLDOWN_FRAMES = 3;
const COOLDOWN_MS = 50;

export function median(values: readonly number[]): number {
  if (values.length === 0) {
    return Number.NaN;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid] ?? Number.NaN;
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? upper) + upper) / 2
    : upper;
}

function abortError() {
  return new DOMException("Benchmark aborted", "AbortError");
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw abortError();
  }
}

/**
 * rAF is paused in background tabs, which would fold hidden time into a
 * sample. Fail the run instead of reporting a bogus number.
 */
function assertVisible() {
  if (document.visibilityState !== "visible") {
    throw new Error(
      "The tab was hidden during the run. Keep it visible and run again."
    );
  }
}

function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Resolves after the next frame has been painted: rAF fires just before
 * paint, and a MessageChannel task queued from it runs right after.
 */
function afterNextPaint(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        resolve(performance.now());
      };
      channel.port2.postMessage(null);
    });
  });
}

async function cooldown(signal: AbortSignal) {
  for (let frame = 0; frame < COOLDOWN_FRAMES; frame++) {
    await nextFrame();
  }
  await new Promise((resolve) => setTimeout(resolve, COOLDOWN_MS));
  throwIfAborted(signal);
}

/** One mounted chart in its own container + React root. */
interface MountedChart {
  container: HTMLDivElement;
  root: Root;
  render: (dataset: BenchDataset) => void;
  dispose: () => void;
}

function mountChart(
  stage: HTMLElement,
  adapter: BenchLibraryAdapter,
  config: BenchRunConfig,
  animate: boolean
): MountedChart {
  const Chart = adapter.charts[config.kind];
  if (!Chart) {
    throw new Error(`${adapter.name} has no ${config.kind} chart adapter`);
  }
  const container = document.createElement("div");
  container.dataset.benchLibrary = adapter.id;
  container.style.width = `${config.width}px`;
  container.style.height = `${config.height}px`;
  stage.append(container);
  const root = createRoot(container);

  return {
    container,
    root,
    render: (dataset) => {
      const props: BenchChartProps = {
        animate,
        data: dataset.rows,
        height: config.height,
        seriesCount: dataset.seriesCount,
        width: config.width,
      };
      // Synchronous commit: the measured span covers render + commit + paint.
      flushSync(() => root.render(createElement(Chart, props)));
    },
    dispose: () => {
      root.unmount();
      container.remove();
    },
  };
}

/** Render, then time to the first painted frame. */
async function timeToPaint(work: () => void): Promise<number> {
  const start = performance.now();
  work();
  const painted = await afterNextPaint();
  assertVisible();
  return painted - start;
}

interface SettleObservation {
  /** First paint → last DOM mutation. */
  observedMs: number;
  /** Mean frame interval while mutations were happening. */
  avgFrameMs: number | null;
  /** Animation frames over 1.5× the display frame budget. */
  longFrames: number;
}

/**
 * Waits until the chart stops mutating the DOM (its animation finished),
 * recording rAF frame intervals meanwhile. `paintedAt` is the first paint.
 */
async function observeSettle(
  container: HTMLElement,
  paintedAt: number
): Promise<SettleObservation> {
  let lastMutation = paintedAt;
  const observer = new MutationObserver(() => {
    lastMutation = performance.now();
  });
  observer.observe(container, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  const frames: { at: number; interval: number }[] = [];
  let previous = await nextFrame();
  try {
    while (true) {
      const now = await nextFrame();
      assertVisible();
      frames.push({ at: now, interval: now - previous });
      previous = now;
      const wall = performance.now();
      if (
        wall - lastMutation >= SETTLE_QUIET_MS ||
        wall - paintedAt >= SETTLE_CAP_MS
      ) {
        break;
      }
    }
  } finally {
    observer.disconnect();
  }

  const animating = frames.filter((frame) => frame.at <= lastMutation);
  const idle = frames.filter((frame) => frame.at > lastMutation);
  // Idle frames after the animation reveal the display refresh interval.
  const budget = median(
    (idle.length > 0 ? idle : frames).map((frame) => frame.interval)
  );
  const intervals = animating.map((frame) => frame.interval);
  return {
    avgFrameMs:
      intervals.length > 0
        ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
        : null,
    longFrames: intervals.filter((value) => value > budget * 1.5).length,
    observedMs: Math.max(0, lastMutation - paintedAt),
  };
}

/**
 * The element that should receive pointer moves: whatever sits under the
 * plot centre (an interaction overlay rect, the svg, a canvas, …).
 */
function hoverTarget(container: HTMLElement): {
  element: Element;
  rect: DOMRect;
} {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const hit = document.elementFromPoint(centerX, centerY);
  if (hit && container.contains(hit)) {
    return { element: hit, rect };
  }
  // Stage scrolled out of view: approximate the hit test by taking the last
  // (topmost in paint order) element whose box covers the centre and that
  // accepts pointer events.
  let element: Element = container;
  for (const candidate of container.querySelectorAll("*")) {
    const box = candidate.getBoundingClientRect();
    if (
      box.left <= centerX &&
      box.right >= centerX &&
      box.top <= centerY &&
      box.bottom >= centerY &&
      getComputedStyle(candidate).pointerEvents !== "none"
    ) {
      element = candidate;
    }
  }
  return { element, rect };
}

function dispatchMove(element: Element, clientX: number, clientY: number) {
  const init = {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    composed: true,
    view: window,
  };
  // Libraries differ: bklit and Recharts listen to mouse events, TanStack
  // Charts to pointer events. Send both, pointer first like a real browser.
  element.dispatchEvent(
    new PointerEvent("pointermove", {
      ...init,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  element.dispatchEvent(new MouseEvent("mousemove", init));
}

/** Mean dispatch → next paint per pointer move across the plot. */
async function measureHover(
  container: HTMLElement,
  moves: number,
  signal: AbortSignal
): Promise<number> {
  const { element, rect } = hoverTarget(container);
  const y = rect.top + rect.height / 2;
  // Inset so the first/last moves land inside the plot, not on margins.
  const left = rect.left + rect.width * 0.1;
  const span = rect.width * 0.8;
  const count = Math.max(1, moves);

  // Enter the chart first so libraries attach hover state.
  element.dispatchEvent(
    new PointerEvent("pointerover", {
      bubbles: true,
      clientX: left,
      clientY: y,
    })
  );
  element.dispatchEvent(
    new MouseEvent("mouseover", { bubbles: true, clientX: left, clientY: y })
  );
  element.dispatchEvent(
    new PointerEvent("pointerenter", { clientX: left, clientY: y })
  );
  element.dispatchEvent(
    new MouseEvent("mouseenter", { clientX: left, clientY: y })
  );
  await afterNextPaint();

  let total = 0;
  for (let index = 0; index < count; index++) {
    throwIfAborted(signal);
    const x = left + (count === 1 ? span / 2 : (span * index) / (count - 1));
    total += await timeToPaint(() => dispatchMove(element, x, y));
  }

  element.dispatchEvent(new PointerEvent("pointerleave", { clientX: 0 }));
  element.dispatchEvent(new MouseEvent("mouseleave", { clientX: 0 }));
  return total / count;
}

interface IterationSample {
  mountMs: number;
  updateMs: number;
  hoverMs: number;
  domNodes: number;
}

async function runIteration(
  stage: HTMLElement,
  adapter: BenchLibraryAdapter,
  config: BenchRunConfig,
  dataset: BenchDataset,
  signal: AbortSignal
): Promise<IterationSample> {
  const chart = mountChart(stage, adapter, config, true);
  try {
    // Animation ON (what users see); timing stops at first paint, so the
    // enter animation's duration is excluded.
    const mountMs = await timeToPaint(() => chart.render(dataset));
    // Let the enter animation finish before hover/DOM measurements.
    await observeSettle(chart.container, performance.now());
    throwIfAborted(signal);
    const domNodes = chart.container.querySelectorAll("*").length;

    const hoverMs = await measureHover(
      chart.container,
      config.hoverMoves,
      signal
    );
    await observeSettle(chart.container, performance.now());
    throwIfAborted(signal);

    const updateMs = await timeToPaint(() =>
      chart.render(nextBenchDataset(dataset))
    );
    return { domNodes, hoverMs, mountMs, updateMs };
  } finally {
    chart.dispose();
  }
}

async function measureAnimation(
  stage: HTMLElement,
  adapter: BenchLibraryAdapter,
  config: BenchRunConfig,
  dataset: BenchDataset
): Promise<BenchAnimationReference> {
  const chart = mountChart(stage, adapter, config, true);
  try {
    await timeToPaint(() => chart.render(dataset));
    const settle = await observeSettle(chart.container, performance.now());
    return {
      avgFrameMs: settle.avgFrameMs,
      configuredMs: resolveInitialAnimationMs(adapter, config.kind),
      longFrames: settle.longFrames,
      observedMs: settle.observedMs,
    };
  } finally {
    chart.dispose();
  }
}

function emptyResult(
  library: BenchLibraryId,
  config: BenchRunConfig,
  error: string
): BenchResult {
  const nan = Number.NaN;
  return {
    animation: {
      avgFrameMs: null,
      configuredMs: resolveInitialAnimationMs(
        BENCH_ADAPTERS[library],
        config.kind
      ),
      longFrames: null,
      observedMs: null,
    },
    error,
    iterations: 0,
    kind: config.kind,
    library,
    metrics: { domNodes: nan, hoverMs: nan, mountMs: nan, updateMs: nan },
    samples: { hoverMs: [], mountMs: [], updateMs: [] },
    seriesCount: config.seriesCount,
    size: config.size,
  };
}

async function benchLibrary(
  library: BenchLibraryId,
  config: BenchRunConfig,
  dataset: BenchDataset,
  stage: HTMLElement,
  onProgress: (event: BenchProgress) => void,
  signal: AbortSignal
): Promise<BenchResult> {
  const adapter = BENCH_ADAPTERS[library];
  if (!adapter.charts[config.kind]) {
    return emptyResult(
      library,
      config,
      `${adapter.name} has no ${config.kind} chart`
    );
  }

  onProgress({ iteration: 0, library, phase: "warmup", type: "start" });
  await runIteration(stage, adapter, config, dataset, signal);
  await cooldown(signal);

  const samples: IterationSample[] = [];
  for (let iteration = 1; iteration <= config.iterations; iteration++) {
    onProgress({ iteration, library, phase: "measure", type: "start" });
    samples.push(await runIteration(stage, adapter, config, dataset, signal));
    await cooldown(signal);
  }

  onProgress({ iteration: 0, library, phase: "animation", type: "start" });
  const animation = await measureAnimation(stage, adapter, config, dataset);
  await cooldown(signal);

  const pick = (key: keyof IterationSample) =>
    samples.map((sample) => sample[key]);
  const metrics: BenchMetrics = {
    domNodes: median(pick("domNodes")),
    hoverMs: median(pick("hoverMs")),
    mountMs: median(pick("mountMs")),
    updateMs: median(pick("updateMs")),
  };

  return {
    animation,
    iterations: samples.length,
    kind: config.kind,
    library,
    metrics,
    samples: {
      hoverMs: pick("hoverMs"),
      mountMs: pick("mountMs"),
      updateMs: pick("updateMs"),
    },
    seriesCount: config.seriesCount,
    size: config.size,
  };
}

export const runBenchmark: RunBenchmark = async (
  config,
  stage,
  onProgress,
  signal
) => {
  const dataset = generateBenchDataset(
    config.kind,
    config.size,
    config.seriesCount,
    BENCH_SEED
  );
  const results: BenchResult[] = [];

  for (const library of config.libraries) {
    throwIfAborted(signal);
    let result: BenchResult;
    try {
      result = await benchLibrary(
        library,
        config,
        dataset,
        stage,
        onProgress,
        signal
      );
    } catch (error) {
      if (signal.aborted) {
        stage.replaceChildren();
        throw abortError();
      }
      stage.replaceChildren();
      result = emptyResult(
        library,
        config,
        error instanceof Error ? error.message : String(error)
      );
    }
    results.push(result);
    onProgress({ result, type: "result" });
  }

  onProgress({ results, type: "done" });
  return results;
};
