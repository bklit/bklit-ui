"use client";

import type { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { cn } from "@bklitui/ui/lib/utils";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  studioControlInputClass,
  studioInputSurfaceClass,
} from "@/components/controls/control-field-helpers";
import { useStudioShellState } from "@/components/use-studio-state";
import { useRafPreview } from "@/hooks/use-raf-preview";
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

const RAF_PREVIEW_REASONS =
  new Set<NumberFieldPrimitive.Root.ChangeEventReason>([
    "scrub",
    "wheel",
    "increment-press",
    "decrement-press",
  ]);

export function ScrubNumberField({
  className,
  value,
  min,
  max,
  step = 1,
  format,
  unit,
  scrubIcon,
  onLiveValueChange,
  onPreview,
  onCommit,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  unit?: string;
  /** Replaces the default scrub handle icon inside the input. */
  scrubIcon?: ReactNode;
  /** Fires on every local value change (for live icons without parent re-renders). */
  onLiveValueChange?: (value: number) => void;
  onPreview: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  const safe = Number.isFinite(value) ? clamp(value, min, max) : min;
  const [localValue, setLocalValue] = useState(safe);
  const { setNumberScrubbing } = useStudioShellState();
  const scrubbingRef = useRef(false);
  const {
    schedule: schedulePreview,
    flush: flushPreview,
    cancel: cancelPreview,
  } = useRafPreview(onPreview);

  useEffect(() => {
    setLocalValue(safe);
  }, [safe]);

  useEffect(
    () => () => {
      if (scrubbingRef.current) {
        scrubbingRef.current = false;
        setNumberScrubbing(false);
      }
    },
    [setNumberScrubbing]
  );

  const endScrubbing = () => {
    if (!scrubbingRef.current) {
      return;
    }
    scrubbingRef.current = false;
    setNumberScrubbing(false);
  };

  const beginScrubbing = () => {
    if (scrubbingRef.current) {
      return;
    }
    scrubbingRef.current = true;
    setNumberScrubbing(true);
  };

  const applyLocalValue = (next: number) => {
    const clamped = clamp(next, min, max);
    setLocalValue(clamped);
    onLiveValueChange?.(clamped);
    return clamped;
  };

  return (
    <NumberFieldRoot
      className={cn("min-w-0 flex-1", className)}
      disabled={disabled}
      format={format}
      max={max}
      min={min}
      onValueChange={(next, eventDetails) => {
        if (next === null) {
          return;
        }
        const clamped = applyLocalValue(next);
        if (RAF_PREVIEW_REASONS.has(eventDetails.reason)) {
          beginScrubbing();
          schedulePreview(clamped);
          return;
        }
        cancelPreview();
        onPreview(clamped);
      }}
      onValueCommitted={(next) => {
        if (next === null) {
          return;
        }
        const clamped = applyLocalValue(next);
        endScrubbing();
        flushPreview();
        onCommit(clamped);
      }}
      step={step}
      value={localValue}
    >
      <NumberFieldGroup
        className={cn(
          "flex h-8 w-full min-w-0 items-center overflow-hidden rounded-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          studioInputSurfaceClass
        )}
      >
        <NumberFieldScrubArea
          className="flex shrink-0 cursor-ew-resize select-none items-center self-stretch px-1.5 text-muted-foreground hover:text-foreground data-[scrubbing]:text-foreground"
          direction="horizontal"
          pixelSensitivity={5}
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
