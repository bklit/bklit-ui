"use client";

import type { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { studioControlInputClass } from "@/components/controls/control-field-helpers";
import { useStudioNumberScrubbing } from "@/components/use-studio-state";
import { useRafPreview } from "@/hooks/use-raf-preview";
import { studioScrubSurfaceClass } from "@/lib/studio-chrome-classes";
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

function snapToStep(value: number, step: number, min: number) {
  if (step <= 0) {
    return value;
  }
  const precision = Math.max(0, -Math.floor(Math.log10(step)));
  const snapped = min + Math.round((value - min) / step) * step;
  return Number(snapped.toFixed(precision));
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
  const latestValueRef = useRef(safe);
  const scrubAreaRef = useRef<HTMLDivElement>(null);
  const scrubHoverRef = useRef(false);
  const wheelIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setNumberScrubbing = useStudioNumberScrubbing();
  const scrubbingRef = useRef(false);
  const {
    schedule: schedulePreview,
    flush: flushPreview,
    cancel: cancelPreview,
  } = useRafPreview(onPreview);

  useEffect(() => {
    setLocalValue(safe);
    latestValueRef.current = safe;
  }, [safe]);

  const endScrubbing = useCallback(() => {
    if (!scrubbingRef.current) {
      return;
    }
    scrubbingRef.current = false;
    setNumberScrubbing(false);
  }, [setNumberScrubbing]);

  const beginScrubbing = useCallback(() => {
    if (scrubbingRef.current) {
      return;
    }
    scrubbingRef.current = true;
    setNumberScrubbing(true);
  }, [setNumberScrubbing]);

  useEffect(() => {
    const el = scrubAreaRef.current;
    if (!el || disabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!scrubHoverRef.current) {
        return;
      }

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (delta === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const range = max - min;
      const rect = el.getBoundingClientRect();
      const valueDelta = (-delta / rect.width) * range;

      beginScrubbing();
      const next = snapToStep(
        clamp(latestValueRef.current + valueDelta, min, max),
        step,
        min
      );
      latestValueRef.current = next;
      setLocalValue(next);
      onLiveValueChange?.(next);
      schedulePreview(next);

      if (wheelIdleRef.current) {
        clearTimeout(wheelIdleRef.current);
      }
      wheelIdleRef.current = setTimeout(() => {
        wheelIdleRef.current = null;
        endScrubbing();
        flushPreview();
        onCommit(latestValueRef.current);
      }, 120);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelIdleRef.current) {
        clearTimeout(wheelIdleRef.current);
      }
    };
  }, [
    beginScrubbing,
    disabled,
    endScrubbing,
    flushPreview,
    max,
    min,
    onCommit,
    onLiveValueChange,
    schedulePreview,
    step,
  ]);

  useEffect(
    () => () => {
      if (scrubbingRef.current) {
        scrubbingRef.current = false;
        setNumberScrubbing(false);
      }
    },
    [setNumberScrubbing]
  );

  const applyLocalValue = (next: number) => {
    const clamped = clamp(next, min, max);
    latestValueRef.current = clamped;
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
          "flex h-10 w-full min-w-0 items-center overflow-hidden focus-within:ring-3 focus-within:ring-ring/50",
          studioScrubSurfaceClass
        )}
      >
        <NumberFieldScrubArea
          className="flex shrink-0 cursor-ew-resize select-none items-center self-stretch px-2 text-muted-foreground hover:text-foreground data-scrubbing:text-foreground"
          direction="horizontal"
          onPointerEnter={() => {
            scrubHoverRef.current = true;
          }}
          onPointerLeave={() => {
            scrubHoverRef.current = false;
          }}
          pixelSensitivity={5}
          ref={scrubAreaRef}
        >
          {scrubIcon ?? (
            <Icon aria-hidden className="size-4" name="IconArrowTopBottom" />
          )}
          <NumberFieldScrubAreaCursor className="pointer-events-none rounded-sm bg-foreground px-1 py-0.5 text-background shadow-md">
            <Icon aria-hidden className="size-3" name="IconArrowLeftRight" />
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
          <span className="shrink-0 px-2 font-mono text-muted-foreground text-xs tabular-nums">
            {unit}
          </span>
        ) : null}
      </NumberFieldGroup>
    </NumberFieldRoot>
  );
}
