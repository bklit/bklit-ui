"use client";

import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioTab,
  StudioTabs,
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
      <StudioTabs
        layout="cards-2"
        onValueChange={(id) => onSelect(id as Exclude<MotionEaseId, "custom">)}
        value={value}
      >
        {MOTION_EASE_IDS.filter((id) => id !== "custom").map((id) => (
          <StudioTab key={id} value={id}>
            <MotionEasePreviewIcon className="text-current" easeId={id} />
            <span className="text-center leading-tight">
              {MOTION_EASE_PRESETS[id].label}
            </span>
          </StudioTab>
        ))}
      </StudioTabs>
    </div>
  );
}
