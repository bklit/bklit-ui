"use client";

import { Icon } from "@bklitui/icons";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { Label } from "@/ui/label";

export function OrientationPicker({
  value,
  onChange,
  label = "Orientation",
}: {
  value: "vertical" | "horizontal";
  onChange: (value: "vertical" | "horizontal") => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>{label}</Label>
      <StudioToggleGroup layout="icons" onValueChange={onChange} value={value}>
        <StudioToggleGroupItem
          aria-label="Vertical"
          title="Vertical"
          value="vertical"
        >
          <Icon className="size-5" name="IconSortArrowUpDown" />
        </StudioToggleGroupItem>
        <StudioToggleGroupItem
          aria-label="Horizontal"
          title="Horizontal"
          value="horizontal"
        >
          <Icon className="size-5" name="IconArrowRightLeft" />
        </StudioToggleGroupItem>
      </StudioToggleGroup>
    </div>
  );
}
