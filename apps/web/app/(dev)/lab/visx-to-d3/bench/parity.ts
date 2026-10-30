import type { ParityResult } from "./geometry";
import { center, fire } from "./hover";
import { waitForSettle } from "./settle";
import { diffSnapshots, takeSnapshot } from "./snapshot";

/** One compared moment: after the enter animation, or after a hover step. */
export interface ParityStep {
  id: string;
  label: string;
  /** `timeout`: a side never went quiet, so it was compared mid-motion. */
  status: "done" | "timeout";
  result: ParityResult;
  settleMs: { before: number; after: number };
  /** Set when the step could not run as intended (e.g. target missing). */
  note?: string;
}

/**
 * Where a hover step points: an element, optionally at a fraction of its
 * bounding box (cartesian charts hover by x on one big hit rect, so several
 * steps share the element and differ in position). Default is the centre.
 */
export interface HoverTarget {
  element: Element;
  at?: { fx: number; fy: number };
}

export type HoverTargets = (root: Element) => HoverTarget[];

/** Wraps plain elements as centre-pointed hover targets. */
export function atCenters(elements: Iterable<Element>): HoverTarget[] {
  return [...elements].map((element) => ({ element }));
}

/** Client point a hover target resolves to right now. */
export function targetPoint(target: HoverTarget): { x: number; y: number } {
  if (!target.at) {
    return center(target.element) ?? { x: 0, y: 0 };
  }
  const rect = target.element.getBoundingClientRect();
  return {
    x: rect.left + rect.width * target.at.fx,
    y: rect.top + rect.height * target.at.fy,
  };
}

function describeTarget(target: HoverTarget): string {
  const tag = target.element.tagName.toLowerCase();
  return target.at
    ? `${tag} @ ${Math.round(target.at.fx * 100)}%,${Math.round(target.at.fy * 100)}%`
    : tag;
}

interface StepOptions {
  signal?: AbortSignal;
  startedAt?: number;
}

/**
 * Starts settle observers on both frames, runs `act` (which may be nothing
 * if the change was already kicked off), waits for both to go quiet and diffs
 * their geometry.
 */
export async function settleAndDiff(
  id: string,
  label: string,
  before: Element,
  after: Element,
  act?: () => void,
  { signal, startedAt = performance.now() }: StepOptions = {}
): Promise<ParityStep> {
  const options = { startedAt, signal };
  const settling = Promise.all([
    waitForSettle(before, options),
    waitForSettle(after, options),
  ]);
  act?.();
  const [settledBefore, settledAfter] = await settling;
  return {
    id,
    label,
    status: settledBefore.settled && settledAfter.settled ? "done" : "timeout",
    result: diffSnapshots(takeSnapshot(before), takeSnapshot(after)),
    settleMs: {
      before: settledBefore.settleMs,
      after: settledAfter.settleMs,
    },
  };
}

/**
 * The out/over pair a real pointer produces when moving from `from` (or the
 * frame, `outside`) onto `target`. React derives `onMouseEnter` /
 * `onMouseLeave` from the `mouseout` (it ignores a `mouseover` whose
 * `relatedTarget` is a React node), so the out half is required even when
 * entering from the empty frame.
 */
export function moveInto(
  target: HoverTarget,
  from: HoverTarget | null,
  outside: Element
) {
  const point = targetPoint(target);
  const element = target.element;
  // Same element, new position: a real pointer only produces moves.
  if (from?.element !== element) {
    const source = from?.element ?? outside;
    fire(source, "pointerout", point, element);
    fire(source, "mouseout", point, element);
    fire(element, "pointerover", point, source);
    fire(element, "mouseover", point, source);
  }
  fire(element, "pointermove", point, null);
  fire(element, "mousemove", point, null);
}

/** Leaves `from` towards `outside` (the frame), firing React's leave path. */
export function moveOut(from: HoverTarget, outside: Element) {
  const point = targetPoint(from);
  const element = from.element;
  fire(element, "pointerout", point, outside);
  fire(element, "mouseout", point, outside);
  fire(outside, "pointerover", point, element);
  fire(outside, "mouseover", point, element);
}

/** Target indices hovered in turn: first, middle and last (deduplicated). */
export function hoverIndices(count: number): number[] {
  if (count === 0) {
    return [];
  }
  return [...new Set([0, Math.floor(count / 2), count - 1])];
}

/**
 * Hover parity: dispatches the same pointer sequence onto target k of each
 * side (events go straight to the element, so it works in overlay modes and
 * off-screen stages), lets both settle and diffs after every step, then
 * leaves and diffs once more.
 */
export async function runHoverParity(
  before: Element,
  after: Element,
  hoverTargets: HoverTargets,
  signal?: AbortSignal
): Promise<ParityStep[]> {
  const beforeTargets = hoverTargets(before);
  const afterTargets = hoverTargets(after);
  const steps: ParityStep[] = [];
  const indices = hoverIndices(
    Math.min(beforeTargets.length, afterTargets.length)
  );
  const countNote =
    beforeTargets.length === afterTargets.length
      ? undefined
      : `Hover target count differs: ${beforeTargets.length} before / ${afterTargets.length} after`;

  if (indices.length === 0) {
    const step = await settleAndDiff(
      "hover",
      "Hover",
      before,
      after,
      undefined,
      {
        signal,
      }
    );
    return [{ ...step, note: countNote ?? "No hover targets found" }];
  }

  let previous: { before: HoverTarget; after: HoverTarget } | null = null;
  for (const k of indices) {
    if (signal?.aborted) {
      return steps;
    }
    const targetBefore = beforeTargets[k];
    const targetAfter = afterTargets[k];
    if (!(targetBefore && targetAfter)) {
      continue;
    }
    const from = previous;
    const step = await settleAndDiff(
      `hover-${k}`,
      `Hover #${k} (${describeTarget(targetBefore)})`,
      before,
      after,
      () => {
        moveInto(targetBefore, from?.before ?? null, before);
        moveInto(targetAfter, from?.after ?? null, after);
      },
      { signal }
    );
    steps.push(countNote ? { ...step, note: countNote } : step);
    previous = { before: targetBefore, after: targetAfter };
  }

  if (previous && !signal?.aborted) {
    const last = previous;
    steps.push(
      await settleAndDiff(
        "hover-leave",
        "Leave",
        before,
        after,
        () => {
          moveOut(last.before, before);
          moveOut(last.after, after);
        },
        { signal }
      )
    );
  }
  return steps;
}

export type StepVerdict = "identical" | "diffs" | "timeout";

export function stepVerdict(step: ParityStep): StepVerdict {
  if (step.status === "timeout") {
    return "timeout";
  }
  return step.result.identical && !step.note ? "identical" : "diffs";
}

/** Worst verdict over several steps (timeout > diffs > identical). */
export function combinedVerdict(steps: readonly ParityStep[]): StepVerdict {
  const verdicts = steps.map(stepVerdict);
  if (verdicts.includes("timeout")) {
    return "timeout";
  }
  return verdicts.includes("diffs") ? "diffs" : "identical";
}

export function diffCount(steps: readonly ParityStep[]): number {
  return steps.reduce((sum, step) => sum + step.result.diffs.length, 0);
}
