"use client";

import {
  domAnimation,
  LazyMotion,
  type MotionValue,
  m,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { memo, type RefObject, useLayoutEffect, useMemo, useRef } from "react";

const TICKER_ITEM_HEIGHT = 24;
const TICKER_SPRING = { stiffness: 400, damping: 35 };
/** Full scroll stacks are skipped above this count — single label + instant updates. */
const COMPACT_TICKER_THRESHOLD = 60;

/** Retarget a spring, or snap it when motion should be instant. */
function driveSpring(
  value: MotionValue<number>,
  target: number,
  instant: boolean
) {
  if (instant) {
    value.jump(target);
  } else {
    value.set(target);
  }
}

interface TickerSegment {
  value: string;
  key: string;
  startIndex: number;
}

/** One entry per consecutive run of equal values, keyed by its start index. */
function toSegments(values: readonly string[]): TickerSegment[] {
  const segments: TickerSegment[] = [];
  values.forEach((value, index) => {
    if (segments.at(-1)?.value !== value) {
      segments.push({ value, key: `${value}-${index}`, startIndex: index });
    }
  });
  return segments;
}

/** Index of the segment containing label `index` (0 when out of range). */
function segmentIndexAt(
  segments: readonly TickerSegment[],
  index: number,
  total: number
) {
  if (index < 0 || index >= total) {
    return 0;
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    if (segment && segment.startIndex <= index) {
      return i;
    }
  }
  return 0;
}

/**
 * Widths of a stack's `[data-ticker-item]` children, re-measured when the
 * items or loaded fonts change. Drives `width` toward the active item so the
 * pill hugs the current label instead of the longest one (e.g. when switching
 * between Persian and Latin labels).
 *
 * `cacheKey` (compact ticker: the label text) reuses widths already measured
 * for that key instead of forcing layout on every label change. The cache is
 * dropped whenever a font finishes loading, since widths depend on it.
 */
function useActiveItemWidth(
  stackRef: RefObject<HTMLElement | null>,
  items: readonly unknown[],
  activeIndex: number,
  width: MotionValue<number>,
  reduceMotion: boolean,
  cacheKey?: string
) {
  const widthsRef = useRef<number[]>([]);
  const activeIndexRef = useRef(activeIndex);
  const widthCacheRef = useRef<Map<string, number[]> | null>(null);
  const cacheKeyRef = useRef(cacheKey);
  const fontsPendingRef = useRef(false);
  const mountedRef = useRef(true);
  // Synced before the measure effect below (layout effects run in order).
  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
    cacheKeyRef.current = cacheKey;
  });

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // `items` is a dep (unused in the body): new items change the rendered
  // stack, so re-measure.
  useLayoutEffect(() => {
    const measure = (snap: boolean) => {
      const stack = stackRef.current;
      if (!(mountedRef.current && stack)) {
        return;
      }
      widthsRef.current = Array.from(
        stack.querySelectorAll<HTMLElement>("[data-ticker-item]"),
        (node) => node.getBoundingClientRect().width
      );
      const key = cacheKeyRef.current;
      if (key !== undefined) {
        widthCacheRef.current ??= new Map();
        widthCacheRef.current.set(key, widthsRef.current);
      }
      const next = widthsRef.current[activeIndexRef.current];
      if (next === undefined) {
        return;
      }
      // First measure snaps so the pill never grows in from zero.
      driveSpring(width, next, snap || reduceMotion);
    };

    const cached =
      cacheKey === undefined ? undefined : widthCacheRef.current?.get(cacheKey);
    if (cached) {
      widthsRef.current = cached;
      const next = cached[activeIndexRef.current];
      if (next !== undefined) {
        driveSpring(width, next, reduceMotion);
      }
    } else {
      measure(widthsRef.current.length === 0);
    }

    // Measuring can start a web-font load (e.g. a `unicode-range` face for a
    // new script). Re-measure once it lands; one registration at a time.
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    if (fonts && fonts.status === "loading" && !fontsPendingRef.current) {
      fontsPendingRef.current = true;
      fonts.ready.then(() => {
        fontsPendingRef.current = false;
        widthCacheRef.current?.clear();
        measure(false);
      });
    }
  }, [stackRef, items, width, reduceMotion, cacheKey]);

  // Follow the active item. A layout effect (not render) so the spring
  // retargets before paint without reading refs / mutating during render.
  useLayoutEffect(() => {
    const target = widthsRef.current[activeIndex];
    if (target !== undefined) {
      driveSpring(width, target, reduceMotion);
    }
  }, [activeIndex, width, reduceMotion]);
}

export interface DateTickerProps {
  currentIndex: number;
  labels: string[];
  visible: boolean;
}

const DateTickerCompact = memo(function DateTickerCompact({
  currentIndex,
  labels,
}: Omit<DateTickerProps, "visible">) {
  const reduceMotion = useReducedMotion() === true;
  const label = labels[currentIndex] ?? labels[0] ?? "";
  const labelItems = useMemo(() => [label], [label]);
  const stackRef = useRef<HTMLDivElement>(null);
  const width = useSpring(0, TICKER_SPRING);
  useActiveItemWidth(stackRef, labelItems, 0, width, reduceMotion, label);

  return (
    <div className="overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
      <m.div className="relative h-6" style={{ width }}>
        <m.div
          className="absolute top-0 left-1/2 flex h-6 items-center"
          ref={stackRef}
          style={{ x: "-50%" }}
        >
          <span
            className="whitespace-nowrap font-medium text-sm"
            data-ticker-item
          >
            {label}
          </span>
        </m.div>
      </m.div>
    </div>
  );
});

const DateTickerInner = memo(function DateTickerInner({
  currentIndex,
  labels,
}: Omit<DateTickerProps, "visible">) {
  const reduceMotion = useReducedMotion() === true;

  // Parse labels into month and second-part (day or year) values
  const parsedLabels = useMemo(() => {
    return labels.map((label) => {
      const parts = label.split(" ");
      return { month: parts[0] || "", day: parts[1] || "" };
    });
  }, [labels]);

  // One segment per consecutive run (Jan → Feb → …). The second part (day for
  // daily data, year for monthly data) is segmented the same way, so it stays
  // still until it actually changes instead of scrolling through repeats.
  const monthSegments = useMemo(
    () => toSegments(parsedLabels.map((label) => label.month)),
    [parsedLabels]
  );
  const daySegments = useMemo(
    () => toSegments(parsedLabels.map((label) => label.day)),
    [parsedLabels]
  );

  const currentMonthIndex = segmentIndexAt(
    monthSegments,
    currentIndex,
    parsedLabels.length
  );
  const currentDayIndex = segmentIndexAt(
    daySegments,
    currentIndex,
    parsedLabels.length
  );

  // Animated Y offsets
  const dayY = useSpring(0, TICKER_SPRING);
  const monthY = useSpring(0, TICKER_SPRING);

  // Each stack's width follows its active item, so the pill resizes per label.
  const monthStackRef = useRef<HTMLDivElement>(null);
  const dayStackRef = useRef<HTMLDivElement>(null);
  const monthWidth = useSpring(0, TICKER_SPRING);
  const dayWidth = useSpring(0, TICKER_SPRING);
  useActiveItemWidth(
    monthStackRef,
    monthSegments,
    currentMonthIndex,
    monthWidth,
    reduceMotion
  );
  useActiveItemWidth(
    dayStackRef,
    daySegments,
    currentDayIndex,
    dayWidth,
    reduceMotion
  );

  // Scroll the stacks to the active day / month before paint.
  useLayoutEffect(() => {
    driveSpring(dayY, -currentDayIndex * TICKER_ITEM_HEIGHT, reduceMotion);
  }, [currentDayIndex, dayY, reduceMotion]);

  useLayoutEffect(() => {
    driveSpring(monthY, -currentMonthIndex * TICKER_ITEM_HEIGHT, reduceMotion);
  }, [currentMonthIndex, monthY, reduceMotion]);

  return (
    <div className="overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
      <div className="relative h-6 overflow-hidden">
        <div className="flex items-center justify-center gap-1">
          {/* Month stack */}
          <m.div
            className="relative h-6 overflow-hidden"
            style={{ width: monthWidth }}
          >
            <m.div
              className="absolute top-0 left-1/2 flex flex-col items-center"
              ref={monthStackRef}
              style={{ x: "-50%", y: monthY }}
            >
              {monthSegments.map((segment) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  data-ticker-item
                  key={segment.key}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {segment.value}
                  </span>
                </div>
              ))}
            </m.div>
          </m.div>

          {/* Second-part stack (day or year) */}
          <m.div
            className="relative h-6 overflow-hidden"
            style={{ width: dayWidth }}
          >
            <m.div
              className="absolute top-0 left-1/2 flex flex-col items-center"
              ref={dayStackRef}
              style={{ x: "-50%", y: dayY }}
            >
              {daySegments.map((segment) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  data-ticker-item
                  key={segment.key}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {segment.value}
                  </span>
                </div>
              ))}
            </m.div>
          </m.div>
        </div>
      </div>
    </div>
  );
});

export function DateTicker({ currentIndex, labels, visible }: DateTickerProps) {
  if (!visible || labels.length === 0) {
    return null;
  }

  // Own feature scope: the ticker also renders outside chart roots.
  return (
    <LazyMotion features={domAnimation}>
      {labels.length > COMPACT_TICKER_THRESHOLD ? (
        <DateTickerCompact currentIndex={currentIndex} labels={labels} />
      ) : (
        <DateTickerInner currentIndex={currentIndex} labels={labels} />
      )}
    </LazyMotion>
  );
}

DateTicker.displayName = "DateTicker";

export default DateTicker;
