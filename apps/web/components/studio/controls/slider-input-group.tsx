"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SliderInputGroup({
  label,
  value,
  min,
  max,
  step = 1,
  format,
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

  const display = format?.(local) ?? String(local);
  const iconNode = renderIcon?.(local) ?? icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-muted-foreground text-xs tabular-nums">
          {display}
        </span>
      </div>
      <div className="flex overflow-hidden rounded-lg border border-input bg-background shadow-xs">
        {iconNode ? (
          <div className="flex w-11 shrink-0 items-center justify-center border-input border-r bg-muted/40">
            {iconNode}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-3 py-2">
          <Slider
            className="w-full **:data-[slot=slider-thumb]:size-4 **:data-[slot=slider-track]:h-2"
            max={max}
            min={min}
            onValueChange={([v]) => {
              const next = clamp(v ?? min, min, max);
              setLocal(next);
              onPreview(next);
            }}
            onValueCommit={([v]) => {
              const next = clamp(v ?? min, min, max);
              setLocal(next);
              onCommit(next);
            }}
            step={step}
            value={[local]}
          />
        </div>
        <Input
          className="h-auto w-[4.25rem] shrink-0 rounded-none border-0 border-input border-l bg-transparent px-2 py-2 text-center text-xs tabular-nums shadow-none focus-visible:ring-0"
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
    </div>
  );
}
