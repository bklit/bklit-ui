"use client";

import { useCallback, useEffect, useRef } from "react";

/** Coalesce high-frequency preview updates to one commit per animation frame. */
export function useRafPreview<T>(onPreview: (value: T) => void) {
  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<T | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const pending = pendingRef.current;
    if (pending === null) {
      return;
    }
    pendingRef.current = null;
    onPreviewRef.current(pending);
  }, []);

  const schedule = useCallback(
    (value: T) => {
      pendingRef.current = value;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    },
    [flush]
  );

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { schedule, flush, cancel };
}
