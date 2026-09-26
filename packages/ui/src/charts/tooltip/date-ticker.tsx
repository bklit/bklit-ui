"use client";

import { motion, useSpring } from "motion/react";
import { memo, useMemo, useRef } from "react";

const TICKER_ITEM_HEIGHT = 24;
/** Full scroll stacks are skipped above this count — single label + instant updates. */
const COMPACT_TICKER_THRESHOLD = 60;

export interface DateTickerProps {
  currentIndex: number;
  labels: string[];
  visible: boolean;
}

const DateTickerCompact = memo(function DateTickerCompact({
  currentIndex,
  labels,
}: Omit<DateTickerProps, "visible">) {
  const label = labels[currentIndex] ?? labels[0] ?? "";

  return (
    <motion.div
      className="inline-flex w-fit max-w-max overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      layout
      transition={{ layout: { duration: 0.28, ease: "easeOut" } }}
    >
      <div className="flex h-6 items-center justify-center">
        <span className="whitespace-nowrap font-bold text-sm">{label}</span>
      </div>
    </motion.div>
  );
});

const DateTickerInner = memo(function DateTickerInner({
  currentIndex,
  labels,
}: Omit<DateTickerProps, "visible">) {
  // Parse labels into month and day parts
  const parsedLabels = useMemo(() => {
    return labels.map((label, index) => {
      const parts = label.split(" ");
      const month = parts[0] || "";
      const day = parts[1] || "";
      return { month, day, full: label, key: `${label}::${index}` };
    });
  }, [labels]);

  // Month segments: one entry per consecutive run (Jan → Feb → …), keyed by start index
  const monthSegments = useMemo(() => {
    const segments: { month: string; key: string; startIndex: number }[] = [];

    parsedLabels.forEach((label, index) => {
      const prev = segments.at(-1);
      if (!prev || prev.month !== label.month) {
        segments.push({
          month: label.month,
          key: `${label.month}-${index}`,
          startIndex: index,
        });
      }
    });

    return segments;
  }, [parsedLabels]);

  // Index into monthSegments for the current data point
  const currentMonthIndex = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= parsedLabels.length) {
      return 0;
    }
    for (let i = monthSegments.length - 1; i >= 0; i--) {
      const segment = monthSegments[i];
      if (segment && segment.startIndex <= currentIndex) {
        return i;
      }
    }
    return 0;
  }, [currentIndex, parsedLabels.length, monthSegments]);

  const secondPartSegments = useMemo(() => {
    const segments: { value: string; key: string; startIndex: number }[] = [];

    parsedLabels.forEach((label, index) => {
      const prev = segments.at(-1);
      if (!prev || prev.value !== label.day) {
        segments.push({
          value: label.day,
          key: `${label.day}-${index}`,
          startIndex: index,
        });
      }
    });

    return segments;
  }, [parsedLabels]);

  const currentSecondPartIndex = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= parsedLabels.length) {
      return 0;
    }
    for (let i = secondPartSegments.length - 1; i >= 0; i--) {
      const segment = secondPartSegments[i];
      if (segment && segment.startIndex <= currentIndex) {
        return i;
      }
    }
    return 0;
  }, [currentIndex, parsedLabels.length, secondPartSegments]);

  const currentLabel = parsedLabels[currentIndex] ?? parsedLabels[0];

  // Track previous month index
  const prevMonthIndexRef = useRef(-1);

  // Animated Y offsets
  const secondPartY = useSpring(0, { stiffness: 400, damping: 35 });
  const monthY = useSpring(0, { stiffness: 400, damping: 35 });

  secondPartY.set(-currentSecondPartIndex * TICKER_ITEM_HEIGHT);

  if (currentMonthIndex >= 0) {
    const isFirstRender = prevMonthIndexRef.current === -1;
    const monthChanged = prevMonthIndexRef.current !== currentMonthIndex;
    if (isFirstRender || monthChanged) {
      monthY.set(-currentMonthIndex * TICKER_ITEM_HEIGHT);
      prevMonthIndexRef.current = currentMonthIndex;
    }
  }

  return (
    <motion.div
      className="inline-flex w-fit max-w-max overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      layout
      transition={{ layout: { duration: 0.28, ease: "easeOut" } }}
    >
      <div className="flex items-center justify-center gap-1">
        {/* Month stack */}
        <div className="relative inline-grid h-6">
          <span className="invisible col-start-1 row-start-1 whitespace-nowrap font-bold text-sm">
            {currentLabel?.month}
          </span>
          <div className="absolute inset-0 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: monthY }}>
              {monthSegments.map((segment) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={segment.key}
                >
                  <span className="whitespace-nowrap font-bold text-sm">
                    {segment.month}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* The second segment stays still until it changes (year for monthly data, day for daily data). */}
        <div className="relative inline-grid h-6">
          <span className="invisible col-start-1 row-start-1 whitespace-nowrap font-bold text-sm">
            {currentLabel?.day}
          </span>
          <div className="absolute inset-0 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: secondPartY }}>
              {secondPartSegments.map((segment) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={segment.key}
                >
                  <span className="whitespace-nowrap font-bold text-sm">
                    {segment.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export function DateTicker({ currentIndex, labels, visible }: DateTickerProps) {
  if (!visible || labels.length === 0) {
    return null;
  }

  if (labels.length > COMPACT_TICKER_THRESHOLD) {
    return <DateTickerCompact currentIndex={currentIndex} labels={labels} />;
  }

  return <DateTickerInner currentIndex={currentIndex} labels={labels} />;
}

DateTicker.displayName = "DateTicker";

export default DateTicker;
