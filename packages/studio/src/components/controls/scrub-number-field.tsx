"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  studioControlInputClass,
  studioInputSurfaceClass,
} from "@/components/controls/control-field-helpers";
import {
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldRoot,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from "@/ui/number-field";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ScrubNumberField({
  className,
  value,
  min,
  max,
  step = 1,
  format,
  unit,
  scrubIcon,
  onPreview,
  onCommit,
}: {
  className?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  unit?: string;
  /** Replaces the default scrub handle icon inside the input. */
  scrubIcon?: ReactNode;
  onPreview: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  const safe = Number.isFinite(value) ? clamp(value, min, max) : min;

  return (
    <NumberFieldRoot
      className={cn("min-w-0 flex-1", className)}
      format={format}
      max={max}
      min={min}
      onValueChange={(next) => {
        if (next !== null) {
          onPreview(clamp(next, min, max));
        }
      }}
      onValueCommitted={(next) => {
        if (next !== null) {
          onCommit(clamp(next, min, max));
        }
      }}
      step={step}
      value={safe}
    >
      <NumberFieldGroup
        className={cn(
          "flex h-8 w-full min-w-0 items-center overflow-hidden rounded-md focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          studioInputSurfaceClass
        )}
      >
        <NumberFieldScrubArea
          className="flex shrink-0 cursor-ew-resize select-none items-center self-stretch border-border border-r px-1.5 text-muted-foreground hover:text-foreground data-[scrubbing]:text-foreground"
          direction="horizontal"
        >
          {scrubIcon ?? (
            <ArrowUpDown aria-hidden className="size-3.5" strokeWidth={1.75} />
          )}
          <NumberFieldScrubAreaCursor className="pointer-events-none rounded-sm bg-foreground px-1 py-0.5 text-background shadow-md">
            <ArrowLeftRight aria-hidden className="size-3" strokeWidth={2} />
          </NumberFieldScrubAreaCursor>
        </NumberFieldScrubArea>
        <NumberFieldInput
          className={cn(
            "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-1.5 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0",
            studioControlInputClass,
            "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
        />
        {unit ? (
          <span className="shrink-0 border-border border-l px-2 font-mono text-muted-foreground text-xs tabular-nums">
            {unit}
          </span>
        ) : null}
      </NumberFieldGroup>
    </NumberFieldRoot>
  );
}
