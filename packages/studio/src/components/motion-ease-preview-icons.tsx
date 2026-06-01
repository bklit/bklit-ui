"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useMemo } from "react";
import {
  MOTION_EASE_PRESETS,
  type MotionEaseId,
  sampleBezierCurve,
} from "@/lib/motion-config";

const VIEW_W = 32;
const VIEW_H = 16;
const PADDING = 2;
const Y_MAX = 1.08;

function motionEasePreviewPath(bezier: [number, number, number, number]) {
  const samples = sampleBezierCurve(bezier, 48);
  const innerW = VIEW_W - PADDING * 2;
  const innerH = VIEW_H - PADDING * 2;

  const toSvg = (t: number, y: number) => ({
    x: PADDING + t * innerW,
    y: PADDING + innerH - (Math.min(Y_MAX, Math.max(0, y)) / Y_MAX) * innerH,
  });

  return samples
    .map((point, index) => {
      const { x, y } = toSvg(point.t, point.y);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MotionEasePreviewIcon({
  easeId,
  className,
}: {
  easeId: Exclude<MotionEaseId, "custom">;
  className?: string;
}) {
  const path = useMemo(
    () => motionEasePreviewPath(MOTION_EASE_PRESETS[easeId].bezier),
    [easeId]
  );

  return (
    <svg
      aria-hidden={true}
      className={cn("shrink-0", className)}
      height={VIEW_H}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={VIEW_W}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
