"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { oklchToSrgbBytes } from "@/lib/oklch-color";
import type { OklchPickerState } from "@/lib/studio-color-picker-value";
import { OKLCH_PICKER_CHROMA_MAX } from "@/lib/studio-color-picker-value";
import { ColorThumb } from "@/ui/color-picker/color-thumb";
import { paintOklchColorPlane } from "@/ui/color-picker/paint-oklch-plane";
import { useSurfacePointer } from "@/ui/color-picker/use-surface-pointer";

const PLANE_DPR_CAP = 2;

function redrawPlane(canvas: HTMLCanvasElement, hue: number) {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.round(rect.width));
  const cssHeight = Math.max(1, Math.round(rect.height));
  const dpr = Math.min(PLANE_DPR_CAP, window.devicePixelRatio || 1);
  const pixelWidth = Math.round(cssWidth * dpr);
  const pixelHeight = Math.round(cssHeight * dpr);

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    return;
  }

  paintOklchColorPlane(ctx, pixelWidth, pixelHeight, hue);
}

export function OklchColorArea({
  value,
  disabled = false,
  onChange,
  onChangeEnd,
}: {
  value: OklchPickerState;
  disabled?: boolean;
  onChange: (next: Pick<OklchPickerState, "l" | "c">) => void;
  onChangeEnd?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    ref: pointerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useSurfacePointer({
    disabled,
    axis: "xy",
    onPick: (x, y) => {
      onChange({
        c: x * OKLCH_PICKER_CHROMA_MAX,
        l: 1 - y,
      });
    },
    onPickEnd: onChangeEnd,
  });

  const mergeContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    pointerRef.current = node;
  };

  useEffect(() => {
    if (disabled) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!(canvas && container)) {
      return;
    }

    const paint = () => {
      redrawPlane(canvas, value.h);
    };

    paint();

    const observer = new ResizeObserver(paint);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [disabled, value.h]);

  const thumbColor = oklchToSrgbBytes(value.l, value.c, value.h);
  const thumbLeft = `${(value.c / OKLCH_PICKER_CHROMA_MAX) * 100}%`;
  const thumbTop = `${(1 - value.l) * 100}%`;

  return (
    <fieldset
      className={cn(
        "relative m-0 aspect-[4/3] w-full min-w-0 shrink-0 touch-none select-none overflow-hidden rounded-md border-0 p-0 ring-1 ring-border",
        disabled && "pointer-events-none bg-muted opacity-50"
      )}
      disabled={disabled}
      onPointerDown={(event) => {
        setDragging(true);
        onPointerDown(event);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => {
        setDragging(false);
        onPointerUp(event);
      }}
      ref={mergeContainerRef}
    >
      <legend className="sr-only">Chroma and lightness</legend>
      {disabled ? null : (
        <canvas
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
          ref={canvasRef}
        />
      )}
      <ColorThumb
        dragging={dragging}
        style={{
          left: thumbLeft,
          top: thumbTop,
          backgroundColor: `rgb(${thumbColor.r} ${thumbColor.g} ${thumbColor.b})`,
        }}
      />
    </fieldset>
  );
}
