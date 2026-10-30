import { diffGeometry, type ParityResult, snapshotGeometry } from "./geometry";
import { center, fire } from "./hover";
import { waitForSettle } from "./settle";

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

export type HoverTargets = (root: Element) => Element[];

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
    result: diffGeometry(snapshotGeometry(before), snapshotGeometry(after)),
    settleMs: {
      before: settledBefore.settleMs,
      after: settledAfter.settleMs,
    },
  };
}

function pointOf(element: Element) {
  return center(element) ?? { x: 0, y: 0 };
}

/**
 * The out/over pair a real pointer produces when moving from `from` (or the
 * frame, `outside`) onto `target`. React derives `onMouseEnter` /
 * `onMouseLeave` from the `mouseout` (it ignores a `mouseover` whose
 * `relatedTarget` is a React node), so the out half is required even when
 * entering from the empty frame.
 */
function moveInto(target: Element, from: Element | null, outside: Element) {
  const point = pointOf(target);
  const source = from ?? outside;
  fire(source, "pointerout", point, target);
  fire(source, "mouseout", point, target);
  fire(target, "pointerover", point, source);
  fire(target, "mouseover", point, source);
  fire(target, "pointermove", point, null);
  fire(target, "mousemove", point, null);
}

/** Leaves `from` towards `outside` (the frame), firing React's leave path. */
function moveOut(from: Element, outside: Element) {
  const point = pointOf(from);
  fire(from, "pointerout", point, outside);
  fire(from, "mouseout", point, outside);
  fire(outside, "pointerover", point, from);
  fire(outside, "mouseover", point, from);
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

  let previous: { before: Element; after: Element } | null = null;
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
      `Hover #${k} (${targetBefore.tagName.toLowerCase()})`,
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
