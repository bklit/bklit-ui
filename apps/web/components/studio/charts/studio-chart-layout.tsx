"use client";

import type { StudioFrameSize } from "@/components/studio/studio-chart-viewport";

/** Max square diameter that fits inside the studio frame (px). */
export function studioFitDiameter(frame: StudioFrameSize, ratio = 0.9) {
  return Math.round(Math.min(frame.width, frame.height) * ratio);
}

/** Radial chart diameter from frame size and scale percent (50–100). */
export function studioRadialSize(
  frame: StudioFrameSize,
  scalePercent: number,
  padding = 32,
  minDiameter = 320
) {
  const fit = studioFitDiameter(
    {
      width: Math.max(0, frame.width - padding),
      height: Math.max(0, frame.height - padding),
    },
    0.92
  );
  const scale = Math.max(0.5, Math.min(1, scalePercent / 100));
  return Math.round(Math.min(fit, Math.max(minDiameter, fit * scale)));
}

/** Largest width/height that fits in the frame while preserving aspect (width ÷ height). */
export function studioFitAspectSize(
  frame: StudioFrameSize,
  widthOverHeight: number,
  padding = 32
) {
  const maxW = Math.max(120, frame.width - padding);
  const maxH = Math.max(120, frame.height - padding);
  let width = maxW;
  let height = width / widthOverHeight;
  if (height > maxH) {
    height = maxH;
    width = height * widthOverHeight;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

import { cn } from "@/lib/utils";

/** Wraps ParentSize cartesian charts so they fill the frame instead of using aspect-ratio. */
export function StudioCartesianFill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "studio-cartesian-fill size-full min-h-0 min-w-0",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Centers fixed-size radial charts and scales them to the frame. */
export function StudioRadialCenter({
  frame,
  children,
}: {
  frame: StudioFrameSize;
  children: React.ReactNode;
}) {
  return (
    <div className="flex size-full min-h-0 min-w-0 items-center justify-center">
      <div
        className="flex max-h-full max-w-full items-center justify-center"
        style={{
          width: frame.width,
          height: frame.height,
        }}
      >
        {children}
      </div>
    </div>
  );
}
