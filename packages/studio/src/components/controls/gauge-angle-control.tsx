"use client";

import { motion } from "motion/react";
import { SliderInputGroup } from "./slider-input-group";

function GaugeArcIcon({ angleDeg }: { angleDeg: number }) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = 12;
  const cy = 12;
  const r = 8;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  return (
    <svg aria-hidden={true} className="size-6" viewBox="0 0 24 24">
      <circle
        className="stroke-muted-foreground/30"
        cx={cx}
        cy={cy}
        fill="none"
        r={r}
        strokeWidth={1.5}
      />
      <motion.line
        animate={{ x2: x, y2: y }}
        className="stroke-accent"
        initial={false}
        strokeLinecap="round"
        strokeWidth={2}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        x1={cx}
        x2={x}
        y1={cy}
        y2={y}
      />
    </svg>
  );
}

export function GaugeAngleControl({
  label,
  value,
  min,
  max,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
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
      renderIcon={(local) => <GaugeArcIcon angleDeg={local} />}
      step={1}
      value={value}
    />
  );
}
