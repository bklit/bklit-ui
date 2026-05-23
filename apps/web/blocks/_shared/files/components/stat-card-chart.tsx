"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bleeds charts edge-to-edge inside stat card content padding. */
export function StatCardChart({
  children,
  className,
  height = 96,
}: {
  children: ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn(
        "relative -mx-4 -mb-3 overflow-hidden",
        "[&_.relative.w-full]:aspect-auto! [&_.relative.w-full]:h-[var(--stat-card-chart-h)]!",
        className
      )}
      style={
        {
          "--stat-card-chart-h": `${height}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
