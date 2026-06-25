"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns `paused: true` when the observed element is fully outside the viewport.
 * Use to stop decorative timers/animations while the user scrolls elsewhere.
 */
export function usePauseWhenOffscreen<T extends Element = HTMLDivElement>(
  rootMargin = "0px"
) {
  const ref = useRef<T>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPaused(entry ? !entry.isIntersecting : true);
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, paused };
}
