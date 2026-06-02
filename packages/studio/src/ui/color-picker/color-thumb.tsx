"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { CSSProperties } from "react";

export function ColorThumb({
  className,
  dragging = false,
  style,
}: {
  className?: string;
  dragging?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
        dragging && "size-4.5",
        className
      )}
      style={style}
    />
  );
}
