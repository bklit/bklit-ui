"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
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
  const [measureRef, bounds] = useMeasure();

  const markerKey = children ? "has-marker" : "no-marker";

  return (
    <motion.div
      animate={{ height: bounds.height || "auto" }}
      className="overflow-hidden"
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.8,
      }}
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
