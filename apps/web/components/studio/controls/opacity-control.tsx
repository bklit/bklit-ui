"use client";

import { SliderInputGroup } from "./slider-input-group";

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
    <span className="relative block size-6 overflow-hidden rounded-full ring-1 ring-border">
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
  color,
  secondaryColor,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  color: string;
  secondaryColor?: string;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  return (
    <SliderInputGroup
      format={(v) => v.toFixed(2)}
      label={label}
      max={max}
      min={min}
      onCommit={onCommit}
      onPreview={onPreview}
      renderIcon={(local) => (
        <OpacitySwatch
          color={color}
          opacity={local}
          secondaryColor={secondaryColor}
        />
      )}
      step={step}
      value={value}
    />
  );
}
