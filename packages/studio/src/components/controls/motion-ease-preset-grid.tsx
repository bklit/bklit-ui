"use client";

import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioSingleToggleGroup,
  ToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
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
    <div className="flex flex-col gap-2">
      <span className={studioFieldLabelClass}>{label}</span>
      <StudioSingleToggleGroup
        className="grid w-full grid-cols-2 gap-1.5"
        onValueChange={(id) => onSelect(id as Exclude<MotionEaseId, "custom">)}
        size="card"
        spacing={2}
        value={value}
        variant="studio"
      >
        {MOTION_EASE_IDS.filter((id) => id !== "custom").map((id) => (
          <ToggleGroupItem key={id} value={id}>
            <MotionEasePreviewIcon className="text-current" easeId={id} />
            <span className="text-center leading-tight">
              {MOTION_EASE_PRESETS[id].label}
            </span>
          </ToggleGroupItem>
        ))}
      </StudioSingleToggleGroup>
    </div>
  );
}
