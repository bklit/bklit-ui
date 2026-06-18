"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@/lib/utils";

export function StudioScrambleDataButton({
  disabled,
  onScramble,
}: {
  disabled?: boolean;
  onScramble: () => void;
}) {
  return (
    <button
      aria-label="Scramble data"
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide transition-colors",
        "hover:bg-muted/60 hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40"
      )}
      disabled={disabled}
      onClick={onScramble}
      type="button"
    >
      <Icon className="size-3" name="IconShuffle" />
      Scramble
    </button>
  );
}
