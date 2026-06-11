"use client";

import { Icon } from "@bklitui/icons";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import {
  MOTION_EASE_IDS,
  MOTION_EASE_PRESETS,
  type MotionEaseId,
  type MotionEaseUrlValue,
  normalizeMotionEaseId,
} from "@/lib/motion-config";

export function MotionEasePresetGrid({
  value,
  label = "Presets",
  onSelect,
}: {
  value: MotionEaseUrlValue;
  label?: string;
  onSelect: (id: Exclude<MotionEaseId, "custom">) => void;
}) {
  const selected = normalizeMotionEaseId(value);
  const selectedName =
    selected === "custom" ? "Custom" : MOTION_EASE_PRESETS[selected].label;
  return (
    <div className="flex flex-col gap-2">
      <span className={studioFieldLabelClass}>
        {label}: {selectedName}
      </span>
      <StudioToggleGroup
        layout="icons"
        onValueChange={(id) => onSelect(id as Exclude<MotionEaseId, "custom">)}
        value={selected === "custom" ? "" : selected}
      >
        {MOTION_EASE_IDS.filter((id) => id !== "custom").map((id) => (
          <StudioToggleGroupItem
            aria-label={MOTION_EASE_PRESETS[id].label}
            key={id}
            title={MOTION_EASE_PRESETS[id].label}
            value={id}
          >
            <Icon className="size-5" name={MOTION_EASE_PRESETS[id].icon} />
          </StudioToggleGroupItem>
        ))}
      </StudioToggleGroup>
    </div>
  );
}
