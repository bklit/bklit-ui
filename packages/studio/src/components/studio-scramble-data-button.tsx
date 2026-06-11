"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

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
    <Button
      className={cn("h-8 w-full text-xs", className)}
      disabled={disabled}
      onClick={onScramble}
      type="button"
      variant="outline"
    >
      Scramble data
    </Button>
  );
}
