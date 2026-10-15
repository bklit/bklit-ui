"use client";

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const SCROLL_FADE_THRESHOLD_PX = 4;

const SCROLL_FADE_WIDTH_PX = 60;

// Masks the scroll content itself so it fades to whatever sits behind it,
// instead of painting a gradient that has to match the surrounding color.
// --scroll-fade-left/right are registered in globals.css so they transition.
const fadeMaskClass =
  "[mask-image:linear-gradient(to_right,transparent,black_var(--scroll-fade-left),black_calc(100%-var(--scroll-fade-right)),transparent)] transition-[--scroll-fade-left,--scroll-fade-right] duration-200";

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
          fadeMaskClass,
          scrollClassName
        )}
        ref={scrollRef}
        style={
          {
            "--scroll-fade-left": `${showLeftFade ? SCROLL_FADE_WIDTH_PX : 0}px`,
            "--scroll-fade-right": `${showRightFade ? SCROLL_FADE_WIDTH_PX : 0}px`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
