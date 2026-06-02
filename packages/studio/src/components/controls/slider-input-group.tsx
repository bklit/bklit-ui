"use client";

import type { ReactNode } from "react";
import {
  studioControlLabelClass,
  studioControlRowClass,
} from "@/components/controls/control-field-helpers";
import { ScrubNumberField } from "@/components/controls/scrub-number-field";
import { Label } from "@/ui/label";

export function SliderInputGroup({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  icon,
  scrubIcon,
  renderIcon,
  format,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: Intl.NumberFormatOptions;
  /** Preview icon shown between the label and input (e.g. opacity swatch). */
  icon?: ReactNode;
  /** Icon inside the scrub handle — overrides the default arrows. */
  scrubIcon?: ReactNode;
  /** Live icon while scrubbing (defaults to `icon`). */
  renderIcon?: (local: number) => ReactNode;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  const safe = Number.isFinite(value) ? value : min;
  const iconNode = renderIcon?.(safe) ?? icon;

  return (
    <div className={studioControlRowClass}>
      <Label className={studioControlLabelClass}>{label}</Label>
      {iconNode ? (
        <div className="flex size-7 shrink-0 items-center justify-center">
          {iconNode}
        </div>
      ) : null}
      <ScrubNumberField
        format={format}
        max={max}
        min={min}
        onCommit={onCommit}
        onPreview={onPreview}
        scrubIcon={scrubIcon}
        step={step}
        unit={unit}
        value={safe}
      />
    </div>
  );
}
