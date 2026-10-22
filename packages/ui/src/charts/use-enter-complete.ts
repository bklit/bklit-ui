"use client";

import type { MotionValue } from "motion/react";
import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Returns true once a mount-progress MotionValue reaches 1.
 * Use to swap animated MotionValue-driven props for static values after
 * enter completes — drops per-frame subscriptions during pan/hover.
 */
export function useEnterComplete(mountProgress: MotionValue<number>): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => mountProgress.on("change", onStoreChange),
    [mountProgress]
  );
  const getSnapshot = () => mountProgress.get() >= 1;
  // Boolean snapshot: re-renders only when progress crosses 1, not per frame.
  const reachedEnd = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Latch: once enter has completed, stay complete (a replay resetting
  // progress to 0 must not swap static paths back to animated ones).
  const [latched, setLatched] = useState(reachedEnd);
  if (reachedEnd && !latched) {
    setLatched(true);
  }

  return latched || reachedEnd;
}
