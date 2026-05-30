"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { motion } from "motion/react";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function t(value: number, min: number, max: number) {
  return max === min ? 0.5 : clamp((value - min) / (max - min), 0, 1);
}

/** Concentric rings — stroke width scales with value. */
export function RingWidthPreviewIcon({
  value,
  min,
  max,
  className,
}: {
  value: number;
  min: number;
  max: number;
  className?: string;
}) {
  const cx = 12;
  const cy = 12;
  const progress = t(value, min, max);
  const strokeWidth = 1.5 + progress * 4.5;
  const radii = [9, 6.5, 4];

  return (
    <svg aria-hidden className={cn("size-6", className)} viewBox="0 0 24 24">
      <title>Ring width</title>
      {radii.map((r) => (
        <circle
          className="stroke-muted-foreground/20"
          cx={cx}
          cy={cy}
          fill="none"
          key={`track-${r}`}
          r={r}
          strokeWidth={1}
        />
      ))}
      <motion.circle
        animate={{ strokeWidth }}
        className="stroke-accent"
        cx={cx}
        cy={cy}
        fill="none"
        initial={false}
        r={radii[0]}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />
    </svg>
  );
}

/** Gap between rings increases with value. */
export function RingGapPreviewIcon({
  value,
  min,
  max,
  className,
}: {
  value: number;
  min: number;
  max: number;
  className?: string;
}) {
  const cx = 12;
  const cy = 12;
  const gap = t(value, min, max) * 3;
  const rings = [
    { r: 9, opacity: 0.35 },
    { r: 9 - gap - 2.5, opacity: 0.65 },
    { r: 9 - gap * 2 - 5, opacity: 1 },
  ];

  return (
    <svg aria-hidden className={cn("size-6", className)} viewBox="0 0 24 24">
      <title>Ring gap</title>
      {rings.map((ring) => (
        <motion.circle
          animate={{ r: ring.r, opacity: ring.opacity }}
          className="stroke-accent"
          cx={cx}
          cy={cy}
          fill="none"
          initial={false}
          key={ring.r}
          strokeWidth={2}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      ))}
    </svg>
  );
}

/** Overall ring chart scale. */
export function RingScalePreviewIcon({
  value,
  min,
  max,
  className,
}: {
  value: number;
  min: number;
  max: number;
  className?: string;
}) {
  const cx = 12;
  const cy = 12;
  const scale = 0.55 + t(value, min, max) * 0.4;
  const r = 9 * scale;

  return (
    <svg aria-hidden className={cn("size-6", className)} viewBox="0 0 24 24">
      <title>Scale</title>
      <circle
        className="stroke-muted-foreground/20"
        cx={cx}
        cy={cy}
        fill="none"
        r={9}
        strokeWidth={1}
      />
      <motion.circle
        animate={{ r }}
        className="stroke-accent"
        cx={cx}
        cy={cy}
        fill="none"
        initial={false}
        strokeWidth={2.5}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />
    </svg>
  );
}
