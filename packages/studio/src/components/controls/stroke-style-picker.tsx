"use client";

import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";

export function StrokeStylePicker({
  value,
  onChange,
}: {
  value: "solid" | "dashed";
  onChange: (value: "solid" | "dashed") => void;
}) {
  return (
    <StudioToggleGroup onValueChange={onChange} value={value}>
      <StudioToggleGroupItem aria-label="Solid" value="solid">
        Solid
      </StudioToggleGroupItem>
      <StudioToggleGroupItem aria-label="Dashed" value="dashed">
        Dashed
      </StudioToggleGroupItem>
    </StudioToggleGroup>
  );
}
