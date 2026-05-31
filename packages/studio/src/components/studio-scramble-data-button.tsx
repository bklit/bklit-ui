"use client";

import { ShuffleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      aria-label="Scramble data"
      className={cn("h-8 w-full justify-start gap-2 px-2 text-xs", className)}
      disabled={disabled}
      onClick={onScramble}
      size="sm"
      type="button"
      variant="outline"
    >
      <HugeiconsIcon icon={ShuffleIcon} size={14} strokeWidth={1.5} />
      Scramble data
    </Button>
  );
}
