"use client";

import {
  StudioTab,
  StudioTabs,
} from "@/components/controls/studio-toggle-group";

export function StrokeStylePicker({
  value,
  onChange,
}: {
  value: "solid" | "dashed";
  onChange: (value: "solid" | "dashed") => void;
}) {
  return (
    <StudioTabs onValueChange={onChange} value={value}>
      <StudioTab aria-label="Solid" value="solid">
        Solid
      </StudioTab>
      <StudioTab aria-label="Dashed" value="dashed">
        Dashed
      </StudioTab>
    </StudioTabs>
  );
}
