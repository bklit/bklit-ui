"use client";

import { type ReactNode, useEffect, useState } from "react";
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
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
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
  const [liveValue, setLiveValue] = useState(safe);

  useEffect(() => {
    setLiveValue(safe);
  }, [safe]);

  const iconNode = renderIcon?.(liveValue) ?? icon;

  return (
    <div
      className={studioControlRowClass}
      data-disabled={disabled ? "" : undefined}
    >
      <Label
        className={studioControlLabelClass}
        data-disabled={disabled ? "" : undefined}
      >
        {label}
      </Label>
      {iconNode ? (
        <div className="flex size-7 shrink-0 items-center justify-center">
          {iconNode}
        </div>
      ) : null}
      <ScrubNumberField
        disabled={disabled}
        format={format}
        max={max}
        min={min}
        onCommit={onCommit}
        onLiveValueChange={setLiveValue}
        onPreview={onPreview}
        scrubIcon={scrubIcon}
        step={step}
        unit={unit}
        value={safe}
      />
    </div>
  );
}
