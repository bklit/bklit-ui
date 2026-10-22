"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useTransform,
} from "motion/react";

const LINE_COUNT = 36;
/** How strongly lines are pulled toward the focus (must stay < 1). */
const PULL = 0.8;
/** Width of the compressed region, as a fraction of the rail height. */
const SPREAD = 0.15;

/**
 * Lens warp: pulls evenly spaced positions toward `focus`, so lines bunch up
 * around it and spread out further away. Monotonic while `PULL < 1`, so
 * lines never cross.
 */
function warp(position: number, focus: number): number {
  const offset = position - focus;
  const u = offset / SPREAD;
  return position - PULL * offset * Math.exp(-u * u);
}

function emphasis(position: number, focus: number): number {
  const u = (position - focus) / 0.1;
  return round(0.16 + 0.6 * Math.exp(-u * u));
}

/** Fixed precision so server and client render identical styles. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const positions = Array.from(
  { length: LINE_COUNT },
  (_, index) => index / (LINE_COUNT - 1)
);

function RailLine({
  position,
  focus,
}: {
  position: number;
  focus: MotionValue<number>;
}) {
  const y = useTransform(focus, (f) => `${round(warp(position, f) * 100)}%`);
  const opacity = useTransform(focus, (f) => emphasis(position, f));

  // Full-height wrapper so a percentage translate is relative to the rail.
  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <motion.div
        className="h-px w-4 bg-foreground will-change-[opacity]"
        style={{ opacity }}
      />
    </motion.div>
  );
}

/**
 * Changelog scroll-spy: the "compressed lines" motif rotated 90° — horizontal
 * lines whose spacing tightens around the reader's position in the feed,
 * with the current month riding alongside.
 */
export function ChangelogRail({
  focus,
  label,
}: {
  /** 0 = newest entry, 1 = oldest. Already smoothed by the caller. */
  focus: MotionValue<number>;
  label: string | undefined;
}) {
  const labelY = useTransform(focus, (f) => `${round(f * 100)}%`);

  return (
    <div aria-hidden className="relative h-full">
      {positions.map((position) => (
        <RailLine focus={focus} key={position} position={position} />
      ))}
      <motion.div className="absolute inset-0 left-8" style={{ y: labelY }}>
        <div className="relative -translate-y-1/2">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="block whitespace-nowrap font-heading text-foreground text-sm tabular-nums"
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
              key={label}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
