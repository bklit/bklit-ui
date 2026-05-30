"use client";

import { motion } from "motion/react";
import { SliderInputGroup } from "./slider-input-group";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function InnerRadiusRingIcon({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  const cx = 12;
  const cy = 12;
  const outerR = 8;
  const t = max === min ? 0 : clamp((value - min) / (max - min), 0, 1);
  const innerR = t * (outerR - 1);
  const strokeWidth = outerR - innerR;
  const midR = innerR + strokeWidth / 2;

  return (
    <svg aria-hidden className="size-6" viewBox="0 0 24 24">
      <title>Inner radius</title>
      <circle
        className="stroke-muted-foreground/25"
        cx={cx}
        cy={cy}
        fill="none"
        r={outerR}
        strokeWidth={1}
      />
      <motion.circle
        animate={{ r: midR, strokeWidth }}
        className="stroke-accent"
        cx={cx}
        cy={cy}
        fill="none"
        initial={false}
        strokeLinecap="round"
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />
    </svg>
  );
}

export function InnerRadiusControl({
  label,
  value,
  min,
  max,
  step = 1,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  return (
    <SliderInputGroup
      label={label}
      max={max}
      min={min}
      onCommit={onCommit}
      onPreview={onPreview}
      renderIcon={(local) => (
        <InnerRadiusRingIcon max={max} min={min} value={local} />
      )}
      step={step}
      value={value}
    />
  );
}
