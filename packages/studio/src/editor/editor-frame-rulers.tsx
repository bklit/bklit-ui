"use client";

import NumberFlow from "@number-flow/react";
import { motion, type Transition } from "motion/react";

export const EDITOR_FRAME_RULER_OFFSET = 16;

export const editorFrameRulerFade: Transition = {
  duration: 0.2,
  ease: [0.215, 0.61, 0.355, 1],
};

function RulerValue({ value }: { value: number }) {
  return (
    <span className="font-medium text-[10px] text-muted-foreground tabular-nums leading-none">
      <NumberFlow
        format={{ maximumFractionDigits: 0 }}
        suffix="px"
        value={value}
        willChange
      />
    </span>
  );
}

export function EditorFrameRulerX({
  width,
  transition = editorFrameRulerFade,
}: {
  width: number;
  transition?: Transition;
}) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute left-0 z-30 flex flex-col items-stretch gap-1"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      style={{
        top: `calc(100% + ${EDITOR_FRAME_RULER_OFFSET}px)`,
        width,
      }}
      transition={transition}
    >
      <div aria-hidden className="flex w-full items-center">
        <span className="h-2 w-px shrink-0 bg-foreground/50" />
        <span className="h-px min-w-0 flex-1 bg-foreground/50" />
        <span className="h-2 w-px shrink-0 bg-foreground/50" />
      </div>
      <div className="flex justify-center">
        <RulerValue value={width} />
      </div>
    </motion.div>
  );
}

export function EditorFrameRulerY({
  height,
  transition = editorFrameRulerFade,
}: {
  height: number;
  transition?: Transition;
}) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute top-0 z-30 flex items-center gap-1.5"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      style={{
        left: `calc(100% + ${EDITOR_FRAME_RULER_OFFSET}px)`,
        height,
      }}
      transition={transition}
    >
      <div aria-hidden className="flex h-full flex-col items-center">
        <span className="h-px w-2 shrink-0 bg-foreground/50" />
        <span className="min-h-0 w-px flex-1 bg-foreground/50" />
        <span className="h-px w-2 shrink-0 bg-foreground/50" />
      </div>
      <RulerValue value={height} />
    </motion.div>
  );
}
