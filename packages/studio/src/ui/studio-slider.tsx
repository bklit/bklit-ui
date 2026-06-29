"use client";

import {
  type PointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { studioControlRadiusClass } from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";

const SLIDER_PROGRESS_SPRING =
  "transition-[width] duration-[350ms] ease-[linear(0,0.5148,1.0017,1.0923,1.0353,0.9962,0.9919,0.9976,1.0006,1.0007,1.0002,1)] motion-reduce:transition-none";

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

function defaultFormat(value: number, step: number) {
  if (step >= 1) {
    return String(Math.round(value));
  }
  const decimals = String(step).includes(".")
    ? (String(step).split(".")[1]?.length ?? 2)
    : 2;
  return value.toFixed(decimals);
}

function valueFromClientX(
  clientX: number,
  rect: DOMRect,
  min: number,
  max: number,
  step: number
) {
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
  return snapToStep(min + ratio * (max - min), step, min);
}

function SliderRuler({ ticks = 51 }: { ticks?: number }) {
  return (
    <div
      aria-hidden
      className="mask-[linear-gradient(to_right,transparent,black_30%,black_70%,transparent)] pointer-events-none absolute inset-0 flex touch-none items-center justify-between px-3"
      data-slot="studio-slider-ruler"
    >
      {Array.from({ length: ticks }, (_, index) => {
        const isMajor = index % 10 === 0;
        return (
          <span
            className={cn(
              "w-px shrink-0",
              isMajor
                ? "h-3 bg-muted-foreground/55"
                : "h-1.5 bg-muted-foreground/22"
            )}
            key={index}
          />
        );
      })}
    </div>
  );
}

function StudioSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  format,
  onPreview,
  onCommit,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (value: number) => string;
  onPreview?: (value: number) => void;
  onCommit?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const hoveredRef = useRef(false);
  const wheelIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isWheeling, setIsWheeling] = useState(false);
  const safe = Number.isFinite(value) ? clamp(value, min, max) : min;
  const [localValue, setLocalValue] = useState(safe);
  const latestValueRef = useRef(safe);

  useEffect(() => {
    setLocalValue(safe);
    latestValueRef.current = safe;
  }, [safe]);

  const isScrubbing = isDragging || isWheeling;
  const displayValue = isScrubbing ? localValue : safe;
  const percent = ((displayValue - min) / (max - min)) * 100;
  const formatted = format
    ? format(displayValue)
    : defaultFormat(displayValue, step);

  const applyValue = useCallback(
    (next: number, commit: boolean) => {
      const snapped = snapToStep(clamp(next, min, max), step, min);
      latestValueRef.current = snapped;
      setLocalValue(snapped);
      onPreview?.(snapped);
      if (commit) {
        onCommit?.(snapped);
      }
    },
    [max, min, onCommit, onPreview, step]
  );

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      applyValue(valueFromClientX(clientX, rect, min, max, step), false);
    },
    [applyValue, max, min, step]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el || disabled) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!(hoveredRef.current || document.activeElement === el)) {
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

      const rect = el.getBoundingClientRect();
      const range = max - min;
      const valueDelta = (-delta / rect.width) * range;

      setIsWheeling(true);
      applyValue(latestValueRef.current + valueDelta, false);

      if (wheelIdleRef.current) {
        clearTimeout(wheelIdleRef.current);
      }
      wheelIdleRef.current = setTimeout(() => {
        wheelIdleRef.current = null;
        setIsWheeling(false);
        onCommit?.(latestValueRef.current);
      }, 120);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelIdleRef.current) {
        clearTimeout(wheelIdleRef.current);
      }
    };
  }, [applyValue, disabled, max, min, onCommit]);

  const endDrag = useCallback(
    (pointerId: number) => {
      if (!draggingRef.current) {
        return;
      }
      draggingRef.current = false;
      setIsDragging(false);
      trackRef.current?.releasePointerCapture(pointerId);
      onCommit?.(latestValueRef.current);
    },
    [onCommit]
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    draggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }
    updateFromClientX(event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    endDrag(event.pointerId);
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    endDrag(event.pointerId);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = clamp(displayValue + step, min, max);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = clamp(displayValue - step, min, max);
    } else if (event.key === "Home") {
      next = min;
    } else if (event.key === "End") {
      next = max;
    }

    if (next == null) {
      return;
    }

    event.preventDefault();
    applyValue(next, true);
  };

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel ?? label}
      aria-labelledby={`${id}-label`}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={displayValue}
      className={cn(
        studioControlRadiusClass,
        "relative h-10 w-full min-w-0 cursor-ew-resize touch-none select-none overflow-hidden bg-input/50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-slot="studio-slider"
      onKeyDown={onKeyDown}
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      onPointerEnter={() => {
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 bg-accent/80",
          percent >= 99.5 ? studioControlRadiusClass : "rounded-l-lg",
          !isScrubbing && SLIDER_PROGRESS_SPRING
        )}
        data-slot="studio-slider-progress"
        style={{ width: `${percent}%` }}
      />

      <div className="relative z-10 flex h-full items-center justify-between gap-3 px-3 font-medium text-xs">
        <span className="shrink-0 text-muted-foreground" id={`${id}-label`}>
          {label}
        </span>
        <span className="shrink-0 text-foreground tabular-nums">
          {formatted}
          {unit}
        </span>
      </div>

      <SliderRuler />
    </div>
  );
}

export { SliderRuler, StudioSlider };
