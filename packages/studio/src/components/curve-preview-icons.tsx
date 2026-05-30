"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { CurveId } from "@/lib/curves";

const CURVE_PATHS: Record<CurveId, string> = {
  natural: "M 0,12 C 6,12 10,6 16,8 S 26,3 32,4",
  monotoneX: "M 0,12 C 10,12 14,5 22,7 S 30,2 32,3",
  linear: "M 0,12 L 32,4",
  step: "M 0,12 H 16 V 6 H 32",
  basis: "M 0,12 C 4,11 8,9 16,8 S 28,5 32,4",
  catmullRom: "M 0,12 C 8,11 12,5 20,7 S 28,2 32,3",
};

export function CurvePreviewIcon({
  curveId,
  className,
}: {
  curveId: CurveId;
  className?: string;
}) {
  return (
    <svg
      aria-hidden={true}
      className={cn("shrink-0 text-foreground", className)}
      height={16}
      viewBox="0 0 32 16"
      width={32}
    >
      <path
        d={CURVE_PATHS[curveId]}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
