"use client";

import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { Label } from "@/ui/label";

export function TooltipDotVariantPicker({
  value,
  onChange,
  label = "Style",
}: {
  value: "dot" | "ring";
  onChange: (value: "dot" | "ring") => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>{label}</Label>
      <StudioToggleGroup
        layout="segmented"
        onValueChange={onChange}
        value={value}
      >
        <StudioToggleGroupItem value="dot">Dot</StudioToggleGroupItem>
        <StudioToggleGroupItem value="ring">Ring</StudioToggleGroupItem>
      </StudioToggleGroup>
    </div>
  );
}
