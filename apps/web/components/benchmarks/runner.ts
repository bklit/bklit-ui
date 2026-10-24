"use client";

import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { BENCH_ADAPTERS } from "./adapters/index";
import { generateBenchDataset, nextBenchDataset } from "./data";
import type {
  BenchAnimationReference,
  BenchChartKind,
  BenchChartProps,
  BenchDataset,
  BenchLibraryAdapter,
  BenchLibraryId,
  BenchMetrics,
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
/**
 * Static renders count as finished once the DOM has been quiet this long (and
 * at least {@link DRAWN_QUIET_FRAMES} frames): long enough to catch follow-up
 * passes such as portalled axes or a measure → re-render cycle.
 */
const DRAWN_QUIET_MS = 100;
const DRAWN_QUIET_FRAMES = 3;
/** A hover result deferred longer than this many frames isn't waited for. */
const HOVER_MAX_FRAMES = 3;
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

interface PaintTiming {
  /** When the runner's rAF callback ran: DOM changes before this are painted. */
  frameAt: number;
  /** Right after that frame was painted. */
  paintedAt: number;
}

/**
 * Resolves after the next frame has been painted: rAF fires just before
 * paint, and a MessageChannel task queued from it runs right after.
 */
function afterNextPaint(): Promise<PaintTiming> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const frameAt = performance.now();
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        resolve({ frameAt, paintedAt: performance.now() });
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

/** Timestamp of the latest DOM change inside `container`. */
function watchMutations(container: HTMLElement) {
  const state = { last: Number.NEGATIVE_INFINITY };
  const observer = new MutationObserver(() => {
    state.last = performance.now();
  });
  observer.observe(container, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
  return {
    get last() {
      return state.last;
    },
    stop: () => observer.disconnect(),
  };
}

/** Deep copy so no library can reuse caches keyed on row identity. */
function freshDataset(dataset: BenchDataset): BenchDataset {
  return { ...dataset, rows: structuredClone(dataset.rows) };
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
      // Synchronous commit; libraries that size or draw in later frames are
      // waited for by the callers below.
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
  const { paintedAt } = await afterNextPaint();
  assertVisible();
  return paintedAt - start;
}

const LONG_PATH_CHARS = 100;

/**
 * Library-neutral check that a chart is on screen: an svg, its tick labels
 * (any text in the container), and its marks. Line/area need one long path per
 * series; scatter one element per point. Animated bars are exempt from the
 * mark count: Recharts skips zero-height bars until they start to grow, which
 * is its enter animation, not missing work.
 */
function isChartDrawn(
  container: HTMLElement,
  kind: BenchChartKind,
  marks: number,
  animate: boolean
): boolean {
  if (!container.querySelector("svg")) {
    return false;
  }
  if (!container.textContent?.trim()) {
    return false;
  }
  switch (kind) {
    case "line":
    case "area": {
      let long = 0;
      for (const path of container.querySelectorAll("path")) {
        if ((path.getAttribute("d")?.length ?? 0) > LONG_PATH_CHARS) {
          long += 1;
        }
      }
      return long >= marks;
    }
    case "bar":
      return (
        animate || container.querySelectorAll("rect, path").length >= marks
      );
    default:
      return container.querySelectorAll("circle, path, use").length >= marks;
  }
}

function expectedMarks(kind: BenchChartKind, dataset: BenchDataset) {
  return kind === "line" || kind === "area"
    ? dataset.seriesCount
    : dataset.size * dataset.seriesCount;
}

/**
 * Render, then time to the painted frame that shows the finished chart.
 *
 * - Animated: the first painted frame in which the chart is drawn (its enter
 *   animation then runs and is not counted).
 * - Static: the frame that paints the last DOM change, once the DOM has been
 *   quiet for a while. A library that measures its parent, portals its axis,
 *   or renders in several passes pays for every pass.
 */
async function timeToDrawn(
  container: HTMLElement,
  work: () => void,
  isDrawn: () => boolean,
  animate: boolean
): Promise<number> {
  const mutations = watchMutations(container);
  try {
    const start = performance.now();
    work();
    const frames: PaintTiming[] = [];
    while (true) {
      const frame = await afterNextPaint();
      assertVisible();
      frames.push(frame);
      if (frame.paintedAt - start > SETTLE_CAP_MS) {
        throw new Error("The chart never finished drawing.");
      }
      if (!isDrawn()) {
        continue;
      }
      if (animate) {
        return frame.paintedAt - start;
      }
      const last = mutations.last;
      const quietFrames = frames.filter((f) => f.frameAt > last);
      if (
        quietFrames.length >= DRAWN_QUIET_FRAMES &&
        frame.paintedAt - Math.max(last, start) >= DRAWN_QUIET_MS
      ) {
        // First frame painted after the last change.
        return (quietFrames[0] as PaintTiming).paintedAt - start;
      }
    }
  } finally {
    mutations.stop();
  }
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

interface Point {
  x: number;
  y: number;
}

/** Largest rendered mark that still counts as a scatter point. */
const MAX_POINT_SIZE = 24;

/**
 * Where the pointer goes. Line/area/bar: a horizontal sweep through the plot
 * centre. Scatter: across rendered points (left to right), since libraries
 * with per-point tooltips only react when the pointer is over a point.
 */
function hoverPath(
  container: HTMLElement,
  kind: BenchChartKind,
  moves: number
): Point[] {
  const rect = container.getBoundingClientRect();
  const count = Math.max(1, moves);
  if (kind === "scatter") {
    const points: Point[] = [];
    for (const mark of container.querySelectorAll("circle, path, use")) {
      const box = mark.getBoundingClientRect();
      if (
        box.width > 0 &&
        box.height > 0 &&
        box.width <= MAX_POINT_SIZE &&
        box.height <= MAX_POINT_SIZE &&
        mark.checkVisibility({ visibilityProperty: true })
      ) {
        points.push({
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        });
      }
    }
    if (points.length > 0) {
      points.sort((a, b) => a.x - b.x);
      return Array.from(
        { length: count },
        (_, index) =>
          points[
            Math.round(
              count === 1 ? 0 : (index * (points.length - 1)) / (count - 1)
            )
          ] as Point
      );
    }
  }
  const y = rect.top + rect.height / 2;
  // Inset so the first/last moves land inside the plot, not on margins.
  const left = rect.left + rect.width * 0.1;
  const span = rect.width * 0.8;
  return Array.from({ length: count }, (_, index) => ({
    x: left + (count === 1 ? span / 2 : (span * index) / (count - 1)),
    y,
  }));
}

/**
 * The element under a point, as the browser would target it. Falls back to a
 * manual hit test when the stage is scrolled out of view: the last (topmost
 * in paint order) element whose box covers the point and takes pointer events.
 */
function hitTest(container: HTMLElement, { x, y }: Point): Element {
  const hit = document.elementFromPoint(x, y);
  if (hit && container.contains(hit)) {
    return hit;
  }
  let element: Element = container;
  for (const candidate of container.querySelectorAll("*")) {
    const box = candidate.getBoundingClientRect();
    if (
      box.left <= x &&
      box.right >= x &&
      box.top <= y &&
      box.bottom >= y &&
      getComputedStyle(candidate).pointerEvents !== "none"
    ) {
      element = candidate;
    }
  }
  return element;
}

function pointerInit({ x, y }: Point, relatedTarget: Element | null) {
  return {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    composed: true,
    relatedTarget,
    view: window,
  };
}

const POINTER_FIELDS = {
  isPrimary: true,
  pointerId: 1,
  pointerType: "mouse",
} as const;

/**
 * Fires what a real mouse would at `point`: over/out (and enter on first
 * contact) when the element under the pointer changes, then the move.
 * Libraries differ: bklit and Recharts listen to mouse events, TanStack
 * Charts to pointer events. Both are sent, pointer first like a browser.
 */
function dispatchPointer(
  container: HTMLElement,
  point: Point,
  previous: Element | null
): Element {
  const target = hitTest(container, point);
  if (target !== previous) {
    if (previous) {
      previous.dispatchEvent(
        new PointerEvent("pointerout", {
          ...pointerInit(point, target),
          ...POINTER_FIELDS,
        })
      );
      previous.dispatchEvent(
        new MouseEvent("mouseout", pointerInit(point, target))
      );
    }
    target.dispatchEvent(
      new PointerEvent("pointerover", {
        ...pointerInit(point, previous),
        ...POINTER_FIELDS,
      })
    );
    target.dispatchEvent(
      new MouseEvent("mouseover", pointerInit(point, previous))
    );
    if (!previous) {
      const enter = { ...pointerInit(point, null), bubbles: false };
      target.dispatchEvent(
        new PointerEvent("pointerenter", { ...enter, ...POINTER_FIELDS })
      );
      target.dispatchEvent(new MouseEvent("mouseenter", enter));
    }
  }
  target.dispatchEvent(
    new PointerEvent("pointermove", {
      ...pointerInit(point, null),
      ...POINTER_FIELDS,
    })
  );
  target.dispatchEvent(new MouseEvent("mousemove", pointerInit(point, null)));
  return target;
}

/**
 * Mean time per pointer move: dispatch → the painted frame that shows the
 * result. A library that defers its hover render to a later task (e.g. state
 * set inside rAF) changes the DOM after the first frame painted; we then wait
 * for the frame that paints it, so deferred work is counted, not skipped.
 */
async function measureHover(
  container: HTMLElement,
  kind: BenchChartKind,
  moves: number,
  signal: AbortSignal
): Promise<number> {
  const path = hoverPath(container, kind, moves);
  const mutations = watchMutations(container);
  let target: Element | null = null;
  let total = 0;
  try {
    for (const point of path) {
      throwIfAborted(signal);
      const start = performance.now();
      target = dispatchPointer(container, point, target);
      let frame = await afterNextPaint();
      for (
        let extra = 1;
        extra < HOVER_MAX_FRAMES && mutations.last > frame.frameAt;
        extra++
      ) {
        frame = await afterNextPaint();
      }
      assertVisible();
      total += frame.paintedAt - start;
    }
  } finally {
    mutations.stop();
  }

  if (target) {
    const leave = pointerInit({ x: 0, y: 0 }, null);
    target.dispatchEvent(
      new PointerEvent("pointerout", { ...leave, ...POINTER_FIELDS })
    );
    target.dispatchEvent(new MouseEvent("mouseout", leave));
    target.dispatchEvent(
      new PointerEvent("pointerleave", {
        ...leave,
        ...POINTER_FIELDS,
        bubbles: false,
      })
    );
    target.dispatchEvent(new MouseEvent("mouseleave", leave));
  }
  return total / path.length;
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
  nextDataset: BenchDataset,
  signal: AbortSignal
): Promise<IterationSample> {
  const { animate, kind } = config;
  const chart = mountChart(stage, adapter, config, animate);
  // Fresh rows per iteration, created outside the timed spans.
  const mountData = freshDataset(dataset);
  const updateData = freshDataset(nextDataset);
  const marks = expectedMarks(kind, dataset);
  const isDrawn = () => isChartDrawn(chart.container, kind, marks, animate);
  try {
    // Timing stops once the chart is drawn, so the enter animation's
    // duration is excluded.
    const mountMs = await timeToDrawn(
      chart.container,
      () => chart.render(mountData),
      isDrawn,
      animate
    );
    // Let the enter animation finish before hover/DOM measurements.
    await observeSettle(chart.container, performance.now());
    throwIfAborted(signal);
    const domNodes = chart.container.querySelectorAll("*").length;

    const hoverMs = await measureHover(
      chart.container,
      kind,
      config.hoverMoves,
      signal
    );
    await observeSettle(chart.container, performance.now());
    throwIfAborted(signal);

    // Animated updates morph from the old geometry over later frames (not
    // counted); static updates are timed to their last painted change.
    const updateMs = animate
      ? await timeToPaint(() => chart.render(updateData))
      : await timeToDrawn(
          chart.container,
          () => chart.render(updateData),
          isDrawn,
          false
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
  const marks = expectedMarks(config.kind, dataset);
  try {
    await timeToDrawn(
      chart.container,
      () => chart.render(freshDataset(dataset)),
      () => isChartDrawn(chart.container, config.kind, marks, true),
      true
    );
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
    animate: config.animate,
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

/** `items` rotated left by `offset`, so each library takes turns going first. */
function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) {
    return [];
  }
  const shift = offset % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

interface LibraryState {
  library: BenchLibraryId;
  adapter: BenchLibraryAdapter;
  samples: IterationSample[];
  animation?: BenchAnimationReference;
  error?: string;
}

/**
 * Runs one configuration. Libraries are interleaved: one warm-up each, then
 * every measured iteration runs each library once, with the starting library
 * rotating per iteration so no library always follows the same neighbour
 * (and inherits its GC or JIT state).
 */
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
  const nextDataset = nextBenchDataset(dataset);
  const states: LibraryState[] = config.libraries.map((library) => {
    const adapter = BENCH_ADAPTERS[library];
    return {
      library,
      adapter,
      samples: [],
      error: adapter.charts[config.kind]
        ? undefined
        : `${adapter.name} has no ${config.kind} chart`,
    };
  });

  /** Runs `step` for one library; a failure marks only that library. */
  const guarded = async (
    state: LibraryState,
    step: () => Promise<void>
  ): Promise<void> => {
    if (state.error) {
      return;
    }
    try {
      await step();
      await cooldown(signal);
    } catch (error) {
      stage.replaceChildren();
      if (signal.aborted) {
        throw abortError();
      }
      state.error = error instanceof Error ? error.message : String(error);
    }
  };

  for (const state of states) {
    throwIfAborted(signal);
    onProgress({
      iteration: 0,
      library: state.library,
      phase: "warmup",
      type: "start",
    });
    await guarded(state, async () => {
      await runIteration(
        stage,
        state.adapter,
        config,
        dataset,
        nextDataset,
        signal
      );
    });
  }

  for (let iteration = 1; iteration <= config.iterations; iteration++) {
    for (const state of rotate(states, iteration - 1)) {
      throwIfAborted(signal);
      onProgress({
        iteration,
        library: state.library,
        phase: "measure",
        type: "start",
      });
      await guarded(state, async () => {
        state.samples.push(
          await runIteration(
            stage,
            state.adapter,
            config,
            dataset,
            nextDataset,
            signal
          )
        );
      });
    }
  }

  const results: BenchResult[] = [];
  for (const state of states) {
    throwIfAborted(signal);
    onProgress({
      iteration: 0,
      library: state.library,
      phase: "animation",
      type: "start",
    });
    await guarded(state, async () => {
      state.animation = await measureAnimation(
        stage,
        state.adapter,
        config,
        dataset
      );
    });

    let result: BenchResult;
    if (state.error || !state.animation) {
      result = emptyResult(
        state.library,
        config,
        state.error ?? "Benchmark failed"
      );
    } else {
      const pick = (key: keyof IterationSample) =>
        state.samples.map((sample) => sample[key]);
      const metrics: BenchMetrics = {
        domNodes: median(pick("domNodes")),
        hoverMs: median(pick("hoverMs")),
        mountMs: median(pick("mountMs")),
        updateMs: median(pick("updateMs")),
      };
      result = {
        animate: config.animate,
        animation: state.animation,
        iterations: state.samples.length,
        kind: config.kind,
        library: state.library,
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
    results.push(result);
    onProgress({ result, type: "result" });
  }

  onProgress({ results, type: "done" });
  return results;
};
