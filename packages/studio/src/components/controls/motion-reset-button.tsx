"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { RotateCcw } from "lucide-react";
import {
  DEFAULT_STUDIO_MOTION,
  resetStudioMotionKeys,
} from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function MotionResetButton({
  state,
  onCommit,
}: {
  state: StudioUrlState;
  onCommit: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const isDefault = resetStudioMotionKeys().every(
    (key) => state[key] === DEFAULT_STUDIO_MOTION[key]
  );

  return (
    <button
      aria-label="Reset motion to defaults"
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide transition-colors",
        "hover:bg-muted/60 hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40"
      )}
      disabled={isDefault}
      onClick={() => {
        for (const key of resetStudioMotionKeys()) {
          onCommit(key, DEFAULT_STUDIO_MOTION[key]);
        }
      }}
      type="button"
    >
      <RotateCcw className="size-3" />
      Reset
    </button>
  );
}
