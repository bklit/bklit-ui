"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import useMeasure from "react-use-measure";

export interface TooltipRow {
  color: string;
  label: string;
  value: string | number;
}

export interface TooltipContentProps {
  title?: string;
  rows: TooltipRow[];
  /** Optional additional content (e.g., markers) */
  children?: ReactNode;
}

export function TooltipContent({ title, rows, children }: TooltipContentProps) {
  const [measureRef, bounds] = useMeasure({ debounce: 0, scroll: false });
  const prevHeightRef = useRef<number | null>(null);
  const prevHasChildrenRef = useRef<boolean>(!!children);
  const skipNextAnimationRef = useRef(false);

  const hasChildren = !!children;
  const markerKey = hasChildren ? "has-marker" : "no-marker";

  // Detect when children appear/disappear - skip animation for this structural change
  // because the measurement may not be stable on the first frame
  if (prevHasChildrenRef.current !== hasChildren) {
    skipNextAnimationRef.current = true;
    prevHasChildrenRef.current = hasChildren;
  }

  // Track if this is a real height change (not initial measurement)
  const currentHeight = bounds.height > 0 ? bounds.height : null;
  const isHeightChange =
    prevHeightRef.current !== null &&
    currentHeight !== null &&
    prevHeightRef.current !== currentHeight;

  // Only animate if height changed AND we're not skipping due to structural change
  const shouldAnimate = isHeightChange && !skipNextAnimationRef.current;

  // Update refs after render
  useEffect(() => {
    if (currentHeight !== null) {
      prevHeightRef.current = currentHeight;
      // Reset the skip flag after we've applied the instant transition
      if (skipNextAnimationRef.current) {
        skipNextAnimationRef.current = false;
      }
    }
  }, [currentHeight]);

  return (
    <motion.div
      // Only animate if we have a valid height, otherwise use auto
      animate={currentHeight !== null ? { height: currentHeight } : undefined}
      className="overflow-hidden"
      // Skip initial animation
      initial={false}
      // Only apply spring transition for smooth height changes
      transition={
        shouldAnimate
          ? {
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.8,
            }
          : { duration: 0 }
      }
    >
      <div className="px-3 py-2.5" ref={measureRef}>
        {title && (
          <div className="mb-2 font-medium text-xs text-zinc-400">{title}</div>
        )}
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-4"
              key={`${row.label}-${row.color}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-sm text-zinc-100">{row.label}</span>
              </div>
              <span className="font-medium text-sm text-white tabular-nums">
                {typeof row.value === "number"
                  ? row.value.toLocaleString()
                  : row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Animated additional content */}
        <AnimatePresence mode="wait">
          {children && (
            <motion.div
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="mt-2"
              exit={{ opacity: 0, filter: "blur(4px)" }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              key={markerKey}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

TooltipContent.displayName = "TooltipContent";

export default TooltipContent;
