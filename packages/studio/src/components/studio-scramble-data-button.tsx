"use client";

import { StudioControlSurface } from "@/ui/studio-control-surface";

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
    <StudioControlSurface
      className={className}
      disabled={disabled}
      onClick={onScramble}
      type="button"
    >
      Scramble data
    </StudioControlSurface>
  );
}
