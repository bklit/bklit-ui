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

const leftFadeClass =
  "pointer-events-none absolute inset-y-0 left-0 z-10 w-[60px] bg-linear-to-r from-background via-background/90 to-transparent transition-opacity duration-200";

const rightFadeClass =
  "pointer-events-none absolute inset-y-0 right-0 z-10 w-[60px] bg-linear-to-l from-background via-background/90 to-transparent transition-opacity duration-200";

export function HorizontalScrollArea({
  children,
  className,
  scrollClassName,
  scrollRef: scrollRefProp,
}: {
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollRefProp ?? internalRef;
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const canScroll =
      el.scrollWidth > el.clientWidth + SCROLL_FADE_THRESHOLD_PX;
    const atEnd =
      el.scrollLeft + el.clientWidth >=
      el.scrollWidth - SCROLL_FADE_THRESHOLD_PX;

    setShowLeftFade(canScroll && el.scrollLeft > SCROLL_FADE_THRESHOLD_PX);
    setShowRightFade(canScroll && !atEnd);
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
    <div className={cn("relative min-w-0 overflow-hidden", className)}>
      <div
        className={cn(
          "no-scrollbar min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain",
          scrollClassName
        )}
        ref={scrollRef}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          leftFadeClass,
          showLeftFade ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          rightFadeClass,
          showRightFade ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
