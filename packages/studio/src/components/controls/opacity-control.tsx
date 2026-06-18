"use client";

import { StudioSlider } from "@/ui/studio-slider";

export function OpacitySwatch({
  color,
  opacity,
  secondaryColor,
}: {
  color: string;
  opacity: number;
  secondaryColor?: string;
}) {
  return (
    <span className="relative block size-6 overflow-hidden rounded-full">
      {secondaryColor ? (
        <span
          className="absolute inset-0"
          style={{ background: secondaryColor }}
        />
      ) : null}
      <span
        className="absolute inset-0"
        style={{ background: color, opacity }}
      />
    </span>
  );
}

export function OpacityControl({
  label,
  value,
  min,
  max,
  step = 0.05,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  color?: string;
  secondaryColor?: string;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  const usePercentFormat = max <= 1 && min >= 0;

  return (
    <StudioSlider
      format={
        usePercentFormat ? (next) => `${Math.round(next * 100)}%` : undefined
      }
      label={label}
      max={max}
      min={min}
      onCommit={onCommit}
      onPreview={onPreview}
      step={step}
      value={value}
    />
  );
}
