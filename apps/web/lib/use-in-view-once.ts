"use client";

import { useEffect, useRef, useState } from "react";

export interface UseInViewOnceOptions {
  /** Preload margin around the viewport (IntersectionObserver rootMargin). */
  rootMargin?: string;
  /** Fraction of the target that must be visible before activating. */
  threshold?: number;
}

/**
 * Activates once when the observed element enters the viewport, then stays active.
 * Useful for deferring heavy chart mounts until the user scrolls near them.
 */
export function useInViewOnce(options?: UseInViewOnceOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const rootMargin = options?.rootMargin ?? "120px";
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    if (inView) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, rootMargin, threshold]);

  return { ref, inView };
}
