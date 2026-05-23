"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BlockPreviewFrame({
  children,
  maxWidth = 400,
  className,
}: {
  children: ReactNode;
  maxWidth?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ maxWidth: `${maxWidth}px` }}
    >
      {children}
    </div>
  );
}
