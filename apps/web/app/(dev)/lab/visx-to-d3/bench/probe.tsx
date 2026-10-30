"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";
import type { GeometryDiff } from "./geometry";

/**
 * Callback spies for the baselines: a variant wires a chart callback
 * (`onSelectionChange`, a zoom transform, …) to `useLabProbe()`, the capture
 * drains what was emitted after every step and stores it next to the
 * geometry. Outside a `LabProbeProvider` the probe is a no-op.
 */

export interface CallbackRecord {
  /** Emissions during the step (informational, not compared). */
  count: number;
  /** Last emitted value, JSON round-tripped (Dates become ISO strings). */
  last: unknown;
}

export type CallbackLog = Record<string, CallbackRecord>;

export class LabProbe {
  private readonly log = new Map<string, CallbackRecord>();

  emit(channel: string, value: unknown) {
    const last =
      value === undefined ? null : JSON.parse(JSON.stringify(value) ?? "null");
    const count = (this.log.get(channel)?.count ?? 0) + 1;
    this.log.set(channel, { count, last });
  }

  /** What was emitted since the last drain (`undefined`: nothing). */
  drain(): CallbackLog | undefined {
    if (this.log.size === 0) {
      return;
    }
    const out: CallbackLog = {};
    for (const [channel, record] of [...this.log].sort(([a], [b]) =>
      a < b ? -1 : 1
    )) {
      out[channel] = record;
    }
    this.log.clear();
    return out;
  }

  reset() {
    this.log.clear();
  }
}

const ProbeContext = createContext<LabProbe | null>(null);

export function LabProbeProvider({
  probe,
  children,
}: {
  probe: LabProbe | null;
  children: ReactNode;
}) {
  return (
    <ProbeContext.Provider value={probe}>{children}</ProbeContext.Provider>
  );
}

/** Stable `emit(channel, value)`; no-op outside a provider. */
export function useLabProbe(): (channel: string, value: unknown) => void {
  const probe = useContext(ProbeContext);
  const ref = useRef(probe);
  ref.current = probe;
  return useCallback((channel: string, value: unknown) => {
    ref.current?.emit(channel, value);
  }, []);
}

/**
 * Wraps `callback` so every call is also emitted on `channel`. Stable as long
 * as `callback` is, so it never adds renders to the chart it is passed to.
 */
export function useProbedCallback<T>(
  channel: string,
  callback: ((value: T) => void) | undefined
): (value: T) => void {
  const emit = useLabProbe();
  return useCallback(
    (value: T) => {
      emit(channel, value);
      callback?.(value);
    },
    [callback, channel, emit]
  );
}

/**
 * Emitted-or-not and the last value must match; the emission count is kept
 * in the file for reading but not compared (a rewrite may batch updates).
 */
export function diffCallbacks(
  before: CallbackLog | undefined,
  after: CallbackLog | undefined
): GeometryDiff[] {
  const diffs: GeometryDiff[] = [];
  const channels = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);
  for (const channel of [...channels].sort()) {
    const b = before?.[channel];
    const a = after?.[channel];
    const bj = b ? JSON.stringify(b.last) : null;
    const aj = a ? JSON.stringify(a.last) : null;
    if (bj !== aj) {
      diffs.push({
        path: `callback ${channel}`,
        attribute: b && a ? "last" : "(emitted)",
        before: bj,
        after: aj,
        maxDelta: null,
      });
    }
  }
  return diffs;
}
