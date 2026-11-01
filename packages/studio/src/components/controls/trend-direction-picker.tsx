"use client";

import { Icon } from "@bklitui/icons";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { Label } from "@/ui/label";

export function TrendDirectionPicker({
  value,
  onChange,
  label = "Trend",
}: {
  value: "up" | "down";
  onChange: (value: "up" | "down") => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>{label}</Label>
      <StudioToggleGroup layout="icons" onValueChange={onChange} value={value}>
        <StudioToggleGroupItem
          aria-label="Trend up"
          title="Trend up"
          value="up"
        >
          <Icon className="size-5" name="IconTrending3" />
        </StudioToggleGroupItem>
        <StudioToggleGroupItem
          aria-label="Trend down"
          title="Trend down"
          value="down"
        >
          <Icon className="size-5" name="IconTrending6" />
        </StudioToggleGroupItem>
      </StudioToggleGroup>
    </div>
  );
}
