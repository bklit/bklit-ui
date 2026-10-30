import { diffGeometry, type GeometryNode, snapshotGeometry } from "./geometry";
import {
  type HoverTargets,
  hoverIndices,
  moveInto,
  moveOut,
  type ParityStep,
} from "./parity";
import { waitForSettle } from "./settle";

/**
 * Golden snapshots: the settled geometry of ONE live chart after enter and
 * after each hover step, recorded to `baselines/<chart>/<variant>.json` and
 * compared against later (no legacy copy needed). Same serialisation as the
 * Before/After parity check (`geometry.ts`) and the same hover sequence
 * (first / middle / last target, then leave).
 */

export const BASELINE_SCHEMA = 1;

/** One settled moment of a live chart. */
export interface LiveStep {
  id: string;
  label: string;
  status: "done" | "timeout";
  settleMs: number;
  nodes: GeometryNode[];
  note?: string;
}

/**
 * Stored step. `enter` keeps every node; hover steps store only what differs
 * from enter (`changed`: new or different nodes, `removed`: paths gone), which
 * keeps the files small and the git diffs readable.
 */
export interface BaselineStepRecord {
  id: string;
  label: string;
  status: "done" | "timeout";
  settleMs: number;
  nodes?: GeometryNode[];
  changed?: GeometryNode[];
  removed?: string[];
  note?: string;
}

/** Benchmark medians of the live chart, for later before/after timing. */
export interface BaselineBenchmark {
  recordedAt: string;
  machine: string;
  userAgent: string;
  iterations: number;
  copies: number;
  hover: boolean;
  medians: Record<string, number>;
}

export interface BaselineFile {
  schema: typeof BASELINE_SCHEMA;
  chart: string;
  variant: string;
  label: string;
  frame: { width: number; height: number };
  recordedAt: string;
  /** Filled in by the route handler (host, CPU) + the browser. */
  machine: string;
  userAgent: string;
  hover: boolean;
  hoverTargetCount: number;
  steps: BaselineStepRecord[];
  benchmark?: BaselineBenchmark;
}

/** What the browser captures for one variant (before packing). */
export interface LiveCapture {
  steps: LiveStep[];
  hoverTargetCount: number;
}

interface CaptureOptions {
  signal?: AbortSignal;
  /** Mounts the chart; called after the settle observer is attached. */
  mount?: () => void;
  hover: boolean;
  hoverTargets: HoverTargets;
}

/** Attaches the observer, runs `act`, waits for quiet, snapshots. */
export async function settleAndSnapshot(
  id: string,
  label: string,
  root: Element,
  act: (() => void) | undefined,
  signal?: AbortSignal
): Promise<LiveStep> {
  const startedAt = performance.now();
  const settling = waitForSettle(root, { startedAt, signal });
  act?.();
  const settled = await settling;
  return {
    id,
    label,
    status: settled.settled ? "done" : "timeout",
    settleMs: settled.settleMs,
    nodes: snapshotGeometry(root),
  };
}

function describe(element: Element, at?: { fx: number; fy: number }): string {
  const tag = element.tagName.toLowerCase();
  return at
    ? `${tag} @ ${Math.round(at.fx * 100)}%,${Math.round(at.fy * 100)}%`
    : tag;
}

/**
 * The hover steps on an already settled live chart under `root`. Mirrors
 * `runHoverParity`: same targets (first / middle / last), same events.
 */
export async function captureHoverSteps(
  root: Element,
  hoverTargets: HoverTargets,
  signal?: AbortSignal
): Promise<LiveCapture> {
  const steps: LiveStep[] = [];
  const targets = hoverTargets(root);
  const indices = hoverIndices(targets.length);
  if (indices.length === 0) {
    const step = await settleAndSnapshot(
      "hover",
      "Hover",
      root,
      undefined,
      signal
    );
    return {
      steps: [{ ...step, note: "No hover targets found" }],
      hoverTargetCount: 0,
    };
  }
  let previous: (typeof targets)[number] | null = null;
  for (const k of indices) {
    const target = targets[k];
    if (signal?.aborted || !target) {
      break;
    }
    const from = previous;
    steps.push(
      await settleAndSnapshot(
        `hover-${k}`,
        `Hover #${k} (${describe(target.element, target.at)})`,
        root,
        () => moveInto(target, from, root),
        signal
      )
    );
    previous = target;
  }
  if (previous && !signal?.aborted) {
    const last = previous;
    steps.push(
      await settleAndSnapshot(
        "hover-leave",
        "Leave",
        root,
        () => moveOut(last, root),
        signal
      )
    );
  }
  return { steps, hoverTargetCount: targets.length };
}

/** Enter (calling `mount`) then, optionally, the hover steps. */
export async function captureLive(
  root: Element,
  { signal, mount, hover, hoverTargets }: CaptureOptions
): Promise<LiveCapture> {
  const enter = await settleAndSnapshot("enter", "Enter", root, mount, signal);
  if (!hover || signal?.aborted) {
    return { steps: [enter], hoverTargetCount: 0 };
  }
  const rest = await captureHoverSteps(root, hoverTargets, signal);
  return {
    steps: [enter, ...rest.steps],
    hoverTargetCount: rest.hoverTargetCount,
  };
}

function sameAttrs(a: GeometryNode, b: GeometryNode): boolean {
  const keys = Object.keys(a.attrs);
  if (a.tag !== b.tag || keys.length !== Object.keys(b.attrs).length) {
    return false;
  }
  return keys.every((key) => a.attrs[key] === b.attrs[key]);
}

/** Stores hover steps as a patch on top of enter. */
export function packSteps(steps: readonly LiveStep[]): BaselineStepRecord[] {
  const enter = steps[0];
  if (!enter) {
    return [];
  }
  const enterByPath = new Map(enter.nodes.map((node) => [node.path, node]));
  return steps.map((step, index) => {
    const base = {
      id: step.id,
      label: step.label,
      status: step.status,
      settleMs: Math.round(step.settleMs),
      ...(step.note ? { note: step.note } : {}),
    };
    if (index === 0) {
      return { ...base, nodes: step.nodes };
    }
    const livePaths = new Set(step.nodes.map((node) => node.path));
    const changed = step.nodes.filter((node) => {
      const before = enterByPath.get(node.path);
      return !(before && sameAttrs(before, node));
    });
    const removed = enter.nodes
      .map((node) => node.path)
      .filter((path) => !livePaths.has(path));
    return { ...base, changed, removed };
  });
}

/** Full node list of every stored step (patches applied to enter). */
export function unpackSteps(
  records: readonly BaselineStepRecord[]
): LiveStep[] {
  const enterNodes = records[0]?.nodes ?? [];
  return records.map((record, index) => {
    let nodes = record.nodes ?? [];
    if (index > 0) {
      const removed = new Set(record.removed ?? []);
      const changed = new Map(
        (record.changed ?? []).map((node) => [node.path, node])
      );
      const enterPaths = new Set(enterNodes.map((node) => node.path));
      nodes = [
        ...enterNodes
          .filter((node) => !removed.has(node.path))
          .map((node) => changed.get(node.path) ?? node),
        ...(record.changed ?? []).filter((node) => !enterPaths.has(node.path)),
      ];
    }
    return {
      id: record.id,
      label: record.label,
      status: record.status,
      settleMs: record.settleMs,
      nodes,
      ...(record.note ? { note: record.note } : {}),
    };
  });
}

/**
 * Baseline vs live, step by step (matched by id). Reported as `ParityStep`s
 * with `before` = baseline and `after` = live, so the parity UI renders them.
 */
export function compareToBaseline(
  baseline: BaselineFile,
  live: LiveCapture
): ParityStep[] {
  const stored = unpackSteps(baseline.steps);
  const liveById = new Map(live.steps.map((step) => [step.id, step]));
  const storedIds = new Set(stored.map((step) => step.id));
  const countNote =
    baseline.hoverTargetCount === live.hoverTargetCount
      ? undefined
      : `Hover target count differs: ${baseline.hoverTargetCount} baseline / ${live.hoverTargetCount} live`;

  const steps: ParityStep[] = stored.map((step) => {
    const match = liveById.get(step.id);
    const notes = [
      step.status === "timeout" ? "Baseline was recorded mid-motion" : null,
      match ? null : "Step missing in live run",
      step.id === "enter" ? null : (countNote ?? null),
    ].filter((note): note is string => note !== null);
    return {
      id: step.id,
      label: step.label,
      status: match?.status ?? "done",
      result: diffGeometry(step.nodes, match?.nodes ?? []),
      settleMs: { before: step.settleMs, after: match?.settleMs ?? 0 },
      ...(notes.length > 0 ? { note: notes.join(" · ") } : {}),
    };
  });
  for (const step of live.steps) {
    if (!storedIds.has(step.id)) {
      steps.push({
        id: step.id,
        label: step.label,
        status: step.status,
        result: diffGeometry([], step.nodes),
        settleMs: { before: 0, after: step.settleMs },
        note: "Step missing in baseline",
      });
    }
  }
  return steps;
}
