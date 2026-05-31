"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import { MotionEasePreviewIcon } from "@/components/motion-ease-preview-icons";
import {
  MOTION_EASE_IDS,
  MOTION_EASE_PRESETS,
  type MotionEaseId,
} from "@/lib/motion-config";

export function MotionEasePresetGrid({
  value,
  label = "Presets",
  onSelect,
}: {
  value: MotionEaseId;
  label?: string;
  onSelect: (id: Exclude<MotionEaseId, "custom">) => void;
}) {
  return (
    <div className="space-y-2">
      <span className={studioFieldLabelClass}>{label}</span>
      <div className="grid grid-cols-2 gap-1.5">
        {MOTION_EASE_IDS.filter((id) => id !== "custom").map((id) => {
          const selected = value === id;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 transition-colors",
                selected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              key={id}
              onClick={() => onSelect(id)}
              type="button"
            >
              <MotionEasePreviewIcon className="text-current" easeId={id} />
              <span className="text-center text-[10px] leading-tight">
                {MOTION_EASE_PRESETS[id].label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
