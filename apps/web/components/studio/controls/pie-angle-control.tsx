"use client";

import { motion } from "motion/react";
import { SliderInputGroup } from "./slider-input-group";

function degToRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function PieStartAngleIcon({ angleDeg }: { angleDeg: number }) {
  const cx = 12;
  const cy = 12;
  const r = 8;
  const rad = degToRad(angleDeg);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  return (
    <svg aria-hidden={true} className="size-6" viewBox="0 0 24 24">
      <circle
        className="stroke-muted-foreground/25"
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

function PieEndAngleIcon({
  startDeg,
  endDeg,
}: {
  startDeg: number;
  endDeg: number;
}) {
  const cx = 12;
  const cy = 12;
  const r = 8;
  const start = degToRad(startDeg);
  const end = degToRad(endDeg);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg >= startDeg ? 1 : 0;

  return (
    <svg aria-hidden={true} className="size-6" viewBox="0 0 24 24">
      <circle
        className="stroke-muted-foreground/25"
        cx={cx}
        cy={cy}
        fill="none"
        r={r}
        strokeWidth={1.5}
      />
      <motion.path
        animate={{
          d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`,
        }}
        className="fill-accent/25 stroke-accent"
        initial={false}
        strokeWidth={1.5}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />
    </svg>
  );
}

export function PieStartAngleControl({
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
      renderIcon={(local) => <PieStartAngleIcon angleDeg={local} />}
      step={1}
      value={value}
    />
  );
}

export function PieEndAngleControl({
  label,
  value,
  startAngle,
  min,
  max,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  startAngle: number;
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
      renderIcon={(local) => (
        <PieEndAngleIcon endDeg={local} startDeg={startAngle} />
      )}
      step={1}
      value={value}
    />
  );
}
