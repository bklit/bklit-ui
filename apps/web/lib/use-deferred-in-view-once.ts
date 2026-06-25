"use client";

import { useEffect, useState } from "react";
import {
  getHomeMountPriority,
  type HomeMountKey,
  requestHomeMount,
} from "@/lib/home-mount-queue";
import {
  type UseInViewOnceOptions,
  useInViewOnce,
} from "@/lib/use-in-view-once";

export interface UseDeferredInViewOnceOptions extends UseInViewOnceOptions {
  /** Extra delay after entering the viewport before joining the mount queue. */
  deferMs?: number;
  /**
   * Homepage mount slot — serial queue with stable top-to-bottom priority.
   * Prefer this over `staggerIndex`.
   */
  mountKey?: HomeMountKey | string;
  /**
   * Fallback priority when `mountKey` is omitted (multiplied by 150ms locally).
   * @deprecated Prefer `mountKey` for homepage heavy mounts.
   */
  staggerIndex?: number;
}

/**
 * Like `useInViewOnce`, but waits for the homepage mount queue (plus idle frame)
 * before setting `mounted` so charts/editor mounts don't coincide with scroll.
 */
export function useDeferredInViewOnce(options?: UseDeferredInViewOnceOptions) {
  const {
    deferMs = 0,
    mountKey,
    staggerIndex = 0,
    ...inViewOptions
  } = options ?? {};
  const { ref, inView } = useInViewOnce(inViewOptions);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!inView || mounted) {
      return;
    }

    let cancelled = false;
    let cancelMount: (() => void) | undefined;
    let deferTimeoutId: number | undefined;

    const joinMountQueue = () => {
      if (cancelled) {
        return;
      }

      const priority = mountKey ? getHomeMountPriority(mountKey) : staggerIndex;

      cancelMount = requestHomeMount(priority, () => {
        if (!cancelled) {
          setMounted(true);
        }
      });
    };

    if (deferMs > 0) {
      deferTimeoutId = window.setTimeout(joinMountQueue, deferMs);
    } else {
      joinMountQueue();
    }

    return () => {
      cancelled = true;
      if (deferTimeoutId !== undefined) {
        window.clearTimeout(deferTimeoutId);
      }
      cancelMount?.();
    };
  }, [deferMs, inView, mountKey, mounted, staggerIndex]);

  return {
    ref,
    inView,
    mounted,
    /** True while the slot is visible but heavy content is still deferred. */
    pending: inView && !mounted,
  };
}
