import type { BASELINE_SCHEMA } from "../lab-slugs";
import type { GeometryNode } from "./geometry";
import type { TextNode } from "./html-text";
import {
  type FrameSize,
  frameSize,
  type InteractionScript,
  performStep,
  restoreFrame,
  SyntheticPointer,
} from "./interactions";
import {
  type HoverTargets,
  hoverIndices,
  moveInto,
  moveOut,
  type ParityStep,
} from "./parity";
import type { CallbackLog, LabProbe } from "./probe";
import { waitForSettle } from "./settle";
import { diffSnapshots, type Snapshot, takeSnapshot } from "./snapshot";

/**
 * Golden snapshots: the settled state of ONE live chart after enter, after
 * each hover step and after each scripted interaction step, recorded to
 * `_baselines/<chart>/<variant>.json` and compared against later. A state is SVG geometry (`geometry.ts`), HTML text with its
 * box (`html-text.ts`) and callback output (`probe.tsx`).
 *
 * Step ids: `enter`, `hover-<k>` / `hover-leave`, `ix-<id>`. Interaction
 * steps run on a fresh mount (never after the hover steps), so recording and
 * comparing with or without hover gives the same interaction states.
 */

export const INTERACTION_PREFIX = "ix-";

export type StepKind = "enter" | "hover" | "interaction";

export function stepKind(id: string): StepKind {
  if (id === "enter") {
    return "enter";
  }
  return id.startsWith(INTERACTION_PREFIX) ? "interaction" : "hover";
}

/** One settled moment of a live chart. */
export interface LiveStep extends Snapshot {
  id: string;
  label: string;
  status: "done" | "timeout";
  settleMs: number;
  note?: string;
}

/**
 * Stored step. `enter` keeps every node / text; later steps store only what
 * differs from enter (`changed` / `changedTexts`: new or different, by path;
 * `removed` / `removedTexts`: paths gone), which keeps the files small and
 * the git diffs readable. `callbacks` is stored as is.
 */
export interface BaselineStepRecord {
  id: string;
  label: string;
  status: "done" | "timeout";
  settleMs: number;
  nodes?: GeometryNode[];
  changed?: GeometryNode[];
  removed?: string[];
  texts?: TextNode[];
  changedTexts?: TextNode[];
  removedTexts?: string[];
  callbacks?: CallbackLog;
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
  /** Interaction steps recorded (the variant has a script). */
  interactions: boolean;
  steps: BaselineStepRecord[];
  benchmark?: BaselineBenchmark;
}

/** What the browser captures for one variant (before packing). */
export interface LiveCapture {
  steps: LiveStep[];
  hoverTargetCount: number;
}

/** Attaches the observer, runs `act`, waits for quiet, snapshots. */
export async function settleAndSnapshot(
  id: string,
  label: string,
  root: Element,
  act: (() => unknown) | undefined,
  signal?: AbortSignal,
  probe?: LabProbe | null
): Promise<LiveStep> {
  const startedAt = performance.now();
  let settling = waitForSettle(root, { startedAt, signal });
  let settledFirst = false;
  settling.then(() => {
    settledFirst = true;
  });
  const note = await act?.();
  if (settledFirst) {
    // An async act outlived the quiet window: settle again from its end.
    settling = waitForSettle(root, { startedAt: performance.now(), signal });
  }
  const settled = await settling;
  return {
    id,
    label,
    status: settled.settled ? "done" : "timeout",
    settleMs: settled.lastMutationAt - startedAt,
    ...takeSnapshot(root, probe),
    ...(typeof note === "string" ? { note } : {}),
  };
}

function describe(element: Element, at?: { fx: number; fy: number }): string {
  const tag = element.tagName.toLowerCase();
  return at
    ? `${tag} @ ${Math.round(at.fx * 100)}%,${Math.round(at.fy * 100)}%`
    : tag;
}

/**
 * The hover steps on an already settled live chart under `root`: first,
 * middle and last hover target, then leave.
 */
export async function captureHoverSteps(
  root: Element,
  hoverTargets: HoverTargets,
  signal?: AbortSignal,
  probe?: LabProbe | null
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
      signal,
      probe
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
        signal,
        probe
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
        signal,
        probe
      )
    );
  }
  return { steps, hoverTargetCount: targets.length };
}

/**
 * Runs `script` on an already settled live chart under `root`, settling and
 * snapshotting after every step. Restores the frame size at the end.
 */
export async function captureInteractionSteps(
  root: HTMLElement,
  script: InteractionScript,
  signal?: AbortSignal,
  probe?: LabProbe | null
): Promise<LiveStep[]> {
  const steps: LiveStep[] = [];
  const pointer = new SyntheticPointer(root);
  const original: FrameSize = frameSize(root);
  probe?.drain();
  try {
    for (const step of script) {
      if (signal?.aborted) {
        break;
      }
      steps.push(
        await settleAndSnapshot(
          `${INTERACTION_PREFIX}${step.id}`,
          step.label,
          root,
          () => performStep(root, pointer, step, original),
          signal,
          probe
        )
      );
    }
  } finally {
    restoreFrame(root, original);
  }
  return steps;
}

interface CaptureOptions {
  signal?: AbortSignal;
  /** Mounts the chart; called after the settle observer is attached. */
  mount?: () => void;
  /** Remounts the chart (fresh state) before the interaction steps. */
  remount?: () => void;
  hover: boolean;
  hoverTargets: HoverTargets;
  /** Run when set and non-empty. */
  interactions?: InteractionScript | null;
  probe?: LabProbe | null;
}

/** Enter (calling `mount`), then the hover steps, then the interactions. */
export async function captureLive(
  root: HTMLElement,
  {
    signal,
    mount,
    remount,
    hover,
    hoverTargets,
    interactions,
    probe,
  }: CaptureOptions
): Promise<LiveCapture> {
  probe?.reset();
  const enter = await settleAndSnapshot(
    "enter",
    "Enter",
    root,
    mount,
    signal,
    probe
  );
  const steps = [enter];
  let hoverTargetCount = 0;
  if (hover && !signal?.aborted) {
    const rest = await captureHoverSteps(root, hoverTargets, signal, probe);
    steps.push(...rest.steps);
    hoverTargetCount = rest.hoverTargetCount;
  }
  if (interactions && interactions.length > 0 && !signal?.aborted) {
    if (steps.length > 1 && remount) {
      probe?.reset();
      await settleAndSnapshot("ix-mount", "Remount", root, remount, signal);
    }
    steps.push(
      ...(await captureInteractionSteps(root, interactions, signal, probe))
    );
  }
  return { steps, hoverTargetCount };
}

function sameAttrs(a: GeometryNode, b: GeometryNode): boolean {
  const keys = Object.keys(a.attrs);
  if (a.tag !== b.tag || keys.length !== Object.keys(b.attrs).length) {
    return false;
  }
  return keys.every((key) => a.attrs[key] === b.attrs[key]);
}

function sameText(a: TextNode, b: TextNode): boolean {
  return a.text === b.text && a.box.every((value, i) => value === b.box[i]);
}

function patch<T extends { path: string }>(
  enter: readonly T[],
  live: readonly T[],
  same: (a: T, b: T) => boolean
): { changed: T[]; removed: string[] } {
  const enterByPath = new Map(enter.map((node) => [node.path, node]));
  const livePaths = new Set(live.map((node) => node.path));
  return {
    changed: live.filter((node) => {
      const before = enterByPath.get(node.path);
      return !(before && same(before, node));
    }),
    removed: enter
      .map((node) => node.path)
      .filter((path) => !livePaths.has(path)),
  };
}

function unpatch<T extends { path: string }>(
  enter: readonly T[],
  changed: readonly T[] = [],
  removed: readonly string[] = []
): T[] {
  const gone = new Set(removed);
  const byPath = new Map(changed.map((node) => [node.path, node]));
  const enterPaths = new Set(enter.map((node) => node.path));
  return [
    ...enter
      .filter((node) => !gone.has(node.path))
      .map((node) => byPath.get(node.path) ?? node),
    ...changed.filter((node) => !enterPaths.has(node.path)),
  ];
}

/** Stores later steps as a patch on top of enter. */
export function packSteps(steps: readonly LiveStep[]): BaselineStepRecord[] {
  const enter = steps[0];
  if (!enter) {
    return [];
  }
  return steps.map((step, index) => {
    const base = {
      id: step.id,
      label: step.label,
      status: step.status,
      settleMs: Math.round(step.settleMs),
      ...(step.note ? { note: step.note } : {}),
      ...(step.callbacks ? { callbacks: step.callbacks } : {}),
    };
    if (index === 0) {
      return { ...base, nodes: step.nodes, texts: step.texts };
    }
    const nodes = patch(enter.nodes, step.nodes, sameAttrs);
    const texts = patch(enter.texts, step.texts, sameText);
    return {
      ...base,
      changed: nodes.changed,
      removed: nodes.removed,
      changedTexts: texts.changed,
      removedTexts: texts.removed,
    };
  });
}

/** Full node / text lists of every stored step (patches applied to enter). */
export function unpackSteps(
  records: readonly BaselineStepRecord[]
): LiveStep[] {
  const enterNodes = records[0]?.nodes ?? [];
  const enterTexts = records[0]?.texts ?? [];
  return records.map((record, index) => ({
    id: record.id,
    label: record.label,
    status: record.status,
    settleMs: record.settleMs,
    nodes:
      index === 0
        ? enterNodes
        : unpatch(enterNodes, record.changed, record.removed),
    texts:
      index === 0
        ? enterTexts
        : unpatch(enterTexts, record.changedTexts, record.removedTexts),
    ...(record.callbacks ? { callbacks: record.callbacks } : {}),
    ...(record.note ? { note: record.note } : {}),
  }));
}

/** The baseline restricted to enter + the step kinds being compared. */
export function selectSteps(
  baseline: BaselineFile,
  kinds: { hover: boolean; interactions: boolean }
): BaselineFile {
  return {
    ...baseline,
    steps: baseline.steps.filter((step) => {
      const kind = stepKind(step.id);
      return (
        kind === "enter" ||
        (kind === "hover" && kinds.hover) ||
        (kind === "interaction" && kinds.interactions)
      );
    }),
  };
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
      match?.note && match.note !== step.note ? match.note : null,
      stepKind(step.id) === "hover" ? (countNote ?? null) : null,
    ].filter((note): note is string => note !== null);
    return {
      id: step.id,
      label: step.label,
      status: match?.status ?? "done",
      result: diffSnapshots(step, match ?? { nodes: [], texts: [] }),
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
        result: diffSnapshots({ nodes: [], texts: [] }, step),
        settleMs: { before: 0, after: step.settleMs },
        note: "Step missing in baseline",
      });
    }
  }
  return steps;
}
