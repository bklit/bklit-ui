export interface SettleOptions {
  /** No DOM mutation for this long counts as settled. Default 400 ms. */
  quietMs?: number;
  /** Give up after this long and report `settled: false`. Default 8000 ms. */
  timeoutMs?: number;
  /** When the work being observed started (defaults to now). */
  startedAt?: number;
  signal?: AbortSignal;
}

export interface SettleResult {
  settled: boolean;
  /** `performance.now()` of the last observed mutation (or `startedAt`). */
  lastMutationAt: number;
  /** `lastMutationAt - startedAt`: when motion actually stopped. */
  settleMs: number;
  mutationRecords: number;
}

const POLL_MS = 50;

/**
 * Resolves once `target`'s subtree has gone `quietMs` without any attribute,
 * child list or text mutation. Motion writes `d`, `transform` and inline
 * styles straight to the DOM every frame, so a quiet window means every enter
 * tween / spring has come to rest. Starts observing immediately: call it
 * before (or in the same task as) the change you want to time.
 */
export function waitForSettle(
  target: Node,
  options: SettleOptions = {}
): Promise<SettleResult> {
  const {
    quietMs = 400,
    timeoutMs = 8000,
    startedAt = performance.now(),
    signal,
  } = options;

  return new Promise((resolve) => {
    let lastMutationAt = startedAt;
    let mutationRecords = 0;
    const observer = new MutationObserver((records) => {
      lastMutationAt = performance.now();
      mutationRecords += records.length;
    });
    observer.observe(target, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (settled: boolean) => {
      observer.disconnect();
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve({
        settled,
        lastMutationAt,
        settleMs: lastMutationAt - startedAt,
        mutationRecords,
      });
    };
    const onAbort = () => finish(false);
    signal?.addEventListener("abort", onAbort);

    const poll = () => {
      // Flush records the observer has queued but not yet delivered.
      const pending = observer.takeRecords();
      if (pending.length > 0) {
        lastMutationAt = performance.now();
        mutationRecords += pending.length;
      }
      const now = performance.now();
      if (now - lastMutationAt >= quietMs) {
        finish(true);
        return;
      }
      if (now - startedAt >= timeoutMs) {
        finish(false);
        return;
      }
      timer = setTimeout(poll, POLL_MS);
    };
    timer = setTimeout(poll, POLL_MS);
  });
}

export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
