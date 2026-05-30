"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  studioControlLabelClass,
  studioControlRowClass,
} from "@/components/controls/control-field-helpers";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Slider } from "@/ui/slider";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SliderInputGroup({
  label,
  value,
  min,
  max,
  step = 1,
  icon,
  renderIcon,
  onPreview,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  icon?: ReactNode;
  /** Live icon while dragging (defaults to `icon`). */
  renderIcon?: (local: number) => ReactNode;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  const safe = Number.isFinite(value) ? value : min;
  const [local, setLocal] = useState(safe);

  useEffect(() => {
    setLocal(Number.isFinite(value) ? value : min);
  }, [min, value]);

  const iconNode = renderIcon?.(local) ?? icon;

  return (
    <div className={studioControlRowClass}>
      <Label className={studioControlLabelClass}>{label}</Label>
      {iconNode ? (
        <div className="flex size-7 shrink-0 items-center justify-center">
          {iconNode}
        </div>
      ) : null}
      <Slider
        className="min-w-0 flex-1 **:data-[slot=slider-thumb]:size-3.5 **:data-[slot=slider-track]:h-1.5"
        max={max}
        min={min}
        onValueChange={(v) => {
          const raw = Array.isArray(v) ? v[0] : v;
          const next = clamp(raw ?? min, min, max);
          setLocal(next);
          onPreview(next);
        }}
        onValueCommitted={(v) => {
          const raw = Array.isArray(v) ? v[0] : v;
          const next = clamp(raw ?? min, min, max);
          setLocal(next);
          onCommit(next);
        }}
        step={step}
        value={local}
      />
      <Input
        className="h-8 w-16 shrink-0 px-1.5 text-center text-xs tabular-nums"
        max={max}
        min={min}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) {
            const next = clamp(parsed, min, max);
            setLocal(next);
            onPreview(next);
            onCommit(next);
          }
        }}
        step={step}
        type="number"
        value={local}
      />
    </div>
  );
}
