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

const topFadeClass =
  "pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-linear-to-b from-background via-background/90 to-transparent transition-opacity duration-200";

const bottomFadeClass =
  "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-linear-to-t from-background via-background/90 to-transparent transition-opacity duration-200";

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
  scrollRef?: RefObject<HTMLDivElement | null>;
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
          className="pointer-events-none absolute top-0 right-0 z-10 h-full w-px bg-linear-to-b from-transparent via-card-foreground/20 to-background"
        />
      ) : null}
    </div>
  );
}
