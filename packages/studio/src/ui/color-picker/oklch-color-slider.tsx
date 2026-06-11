"use client";

import { cn } from "@bklitui/ui/lib/utils";
import {
  type CSSProperties,
  type PointerEvent,
  type RefObject,
  useState,
} from "react";
import { oklchToSrgbBytes } from "@/lib/oklch-color";
import type { OklchPickerState } from "@/lib/studio-color-picker-value";
import { ColorThumb } from "@/ui/color-picker/color-thumb";
import {
  oklchAlphaTrackBackground,
  oklchHueTrackBackground,
} from "@/ui/color-picker/oklch-picker-styles";
import { useSurfacePointer } from "@/ui/color-picker/use-surface-pointer";

type HueChange = Pick<OklchPickerState, "h">;
type AlphaChange = Pick<OklchPickerState, "alpha">;

export function OklchHueSlider({
  value,
  disabled = false,
  onChange,
  onChangeEnd,
}: {
  value: OklchPickerState;
  disabled?: boolean;
  onChange: (next: HueChange) => void;
  onChangeEnd?: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  const { ref, onPointerDown, onPointerMove, onPointerUp } = useSurfacePointer({
    disabled,
    axis: "x",
    onPick: (x) => {
      onChange({ h: x * 360 });
    },
    onPickEnd: onChangeEnd,
  });

  const thumbLeft = `${(value.h / 360) * 100}%`;

  return (
    <OklchSliderTrack
      ariaLabel="Hue"
      ariaValueMax={360}
      ariaValueMin={0}
      ariaValueNow={Math.round(value.h)}
      disabled={disabled}
      dragging={dragging}
      onPointerDown={(event) => {
        setDragging(true);
        onPointerDown(event);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => {
        setDragging(false);
        onPointerUp(event);
      }}
      ref={ref}
      style={{ background: disabled ? undefined : oklchHueTrackBackground() }}
      thumbColor={hueThumbColor(value.h)}
      thumbLeft={thumbLeft}
    />
  );
}

function hueThumbColor(h: number): string {
  const { r, g, b } = oklchToSrgbBytes(0.65, 0.2, h);
  return `rgb(${r} ${g} ${b})`;
}

export function OklchAlphaSlider({
  value,
  disabled = false,
  onChange,
  onChangeEnd,
}: {
  value: OklchPickerState;
  disabled?: boolean;
  onChange: (next: AlphaChange) => void;
  onChangeEnd?: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  const { ref, onPointerDown, onPointerMove, onPointerUp } = useSurfacePointer({
    disabled,
    axis: "x",
    onPick: (x) => {
      onChange({ alpha: x });
    },
    onPickEnd: onChangeEnd,
  });

  const thumbLeft = `${value.alpha * 100}%`;

  return (
    <OklchSliderTrack
      ariaLabel="Opacity"
      ariaValueMax={100}
      ariaValueMin={0}
      ariaValueNow={Math.round(value.alpha * 100)}
      disabled={disabled}
      dragging={dragging}
      onPointerDown={(event) => {
        setDragging(true);
        onPointerDown(event);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => {
        setDragging(false);
        onPointerUp(event);
      }}
      ref={ref}
      style={{
        background: disabled
          ? undefined
          : oklchAlphaTrackBackground(value.l, value.c, value.h),
      }}
      thumbColor={alphaThumbColor(value)}
      thumbLeft={thumbLeft}
    />
  );
}

function alphaThumbColor(value: OklchPickerState): string {
  const { r, g, b } = oklchToSrgbBytes(value.l, value.c, value.h);
  return value.alpha >= 0.999
    ? `rgb(${r} ${g} ${b})`
    : `rgba(${r} ${g} ${b} / ${value.alpha})`;
}

function OklchSliderTrack({
  ariaLabel,
  ariaValueMin,
  ariaValueMax,
  ariaValueNow,
  disabled,
  dragging,
  thumbLeft,
  thumbColor,
  style,
  ref,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  ariaLabel: string;
  ariaValueMin: number;
  ariaValueMax: number;
  ariaValueNow: number;
  disabled?: boolean;
  dragging: boolean;
  thumbLeft: string;
  thumbColor?: string;
  style?: CSSProperties;
  ref: RefObject<HTMLDivElement | null>;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-valuemax={ariaValueMax}
      aria-valuemin={ariaValueMin}
      aria-valuenow={ariaValueNow}
      className={cn(
        "relative h-3 w-full touch-none select-none rounded-md",
        disabled && "pointer-events-none bg-muted opacity-50"
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={ref}
      role="slider"
      style={style}
      tabIndex={disabled ? -1 : 0}
    >
      <ColorThumb
        className="size-3.5"
        dragging={dragging}
        style={{
          left: thumbLeft,
          top: "50%",
          backgroundColor: thumbColor,
        }}
      />
    </div>
  );
}
