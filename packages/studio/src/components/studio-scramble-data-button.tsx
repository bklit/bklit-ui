"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { studioSurfaceClasses } from "@/ui/toggle";

export function StudioScrambleDataButton({
  className,
  disabled,
  onScramble,
}: {
  className?: string;
  disabled?: boolean;
  onScramble: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-8 w-full items-center justify-center px-2.5 text-center font-medium text-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        studioSurfaceClasses,
        className
      )}
      disabled={disabled}
      onClick={onScramble}
      type="button"
    >
      Scramble data
    </button>
  );
}
