"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const pillSurfaceClassName =
  "relative z-0 inline-flex w-full items-center rounded-full bg-background px-0.5 py-0.5 text-xs dark:bg-background";

export function StaticBorderPill({
  children,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { children: ReactNode }) {
  return (
    <div className="relative inline-flex overflow-visible rounded-full p-px ring-1 ring-chart-1/35">
      <button
        className={cn(pillSurfaceClassName, className)}
        type={type}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
