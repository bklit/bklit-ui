"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const pillSurfaceClassName =
  "relative z-1 inline-flex w-full items-center gap-0 rounded-full bg-background px-0.5 py-0.5 text-xs shadow-sm";

export function GradientBorderPill({
  children,
  className,
  href,
  paused = false,
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode; paused?: boolean }) {
  return (
    <div className="relative inline-flex rounded-full p-px">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <div
          className={cn(
            "studio-pill-border-gradient absolute top-1/2 left-1/2 aspect-square w-[max(200%,12rem)] -translate-x-1/2 -translate-y-1/2",
            !paused && "motion-safe:animate-studio-pill-border-spin"
          )}
        />
      </div>

      <Link
        className={cn(pillSurfaceClassName, className)}
        href={href}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}
