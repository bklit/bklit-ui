"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const PREVIEW_MIN_HEIGHT = 420;

export function ComponentShowcase({
  children,
  previewMinHeight = PREVIEW_MIN_HEIGHT,
  className,
}: {
  children: ReactNode;
  previewMinHeight?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-border shadow-sm",
        className
      )}
    >
      <div className="w-full" style={{ minHeight: previewMinHeight }}>
        {children}
      </div>
    </div>
  );
}
