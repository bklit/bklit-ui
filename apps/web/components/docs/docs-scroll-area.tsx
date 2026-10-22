"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const SCROLL_FADE_THRESHOLD_PX = 4;

/** Fade color follows `--docs-scroll-fade` (set by the parent surface), else `--background`. */
const fadeColorClass =
  "from-[var(--docs-scroll-fade,var(--background))] via-[color-mix(in_oklab,var(--docs-scroll-fade,var(--background))_90%,transparent)] to-transparent";

const topFadeClass = `pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-linear-to-b ${fadeColorClass} transition-opacity duration-200`;

const bottomFadeClass = `pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-linear-to-t ${fadeColorClass} transition-opacity duration-200`;

export function DocsScrollArea({
  children,
  className,
  contentClassName,
  scrollRef: scrollRefProp,
  showEdgeGradient = false,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Optional external ref (e.g. fumadocs TOC ScrollProvider). */
  scrollRef?: RefObject<HTMLDivElement | null>;
  /** Right-edge vertical fade — docs nav sidebar only. */
  showEdgeGradient?: boolean;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollRefProp ?? internalRef;
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const canScroll =
      el.scrollHeight > el.clientHeight + SCROLL_FADE_THRESHOLD_PX;
    const atBottom =
      el.scrollTop + el.clientHeight >=
      el.scrollHeight - SCROLL_FADE_THRESHOLD_PX;

    setShowTopFade(el.scrollTop > SCROLL_FADE_THRESHOLD_PX);
    setShowBottomFade(canScroll && !atBottom);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFades);
      ro.disconnect();
    };
  }, [scrollRef, updateFades]);

  return (
    <div className={cn("relative min-h-0 overflow-hidden", className)}>
      <div
        className="docs-scroll-area h-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain"
        ref={scrollRef}
      >
        <div className={cn("min-w-0 pb-4", contentClassName)}>{children}</div>
      </div>
      <div
        aria-hidden
        className={cn(topFadeClass, showTopFade ? "opacity-100" : "opacity-0")}
      />
      <div
        aria-hidden
        className={cn(
          bottomFadeClass,
          showBottomFade ? "opacity-100" : "opacity-0"
        )}
      />

      {showEdgeGradient ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 z-10 h-full w-px bg-linear-to-b from-transparent via-border to-transparent"
        />
      ) : null}
    </div>
  );
}
