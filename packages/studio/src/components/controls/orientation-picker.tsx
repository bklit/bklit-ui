"use client";

import { ArrowRightLeft, ArrowUpDown } from "lucide-react";
import { StudioSingleToggleGroup } from "@/components/controls/studio-toggle-group";
import { ToggleGroupItem } from "@/ui/toggle-group";

export function OrientationPicker({
  value,
  onChange,
}: {
  value: "vertical" | "horizontal";
  onChange: (value: "vertical" | "horizontal") => void;
}) {
  return (
    <StudioSingleToggleGroup
      onValueChange={onChange}
      size="icon"
      value={value}
      variant="studio"
    >
      <ToggleGroupItem aria-label="Vertical" title="Vertical" value="vertical">
        <ArrowUpDown className="size-5" strokeWidth={1.75} />
      </ToggleGroupItem>
      <ToggleGroupItem
        aria-label="Horizontal"
        title="Horizontal"
        value="horizontal"
      >
        <ArrowRightLeft className="size-5" strokeWidth={1.75} />
      </ToggleGroupItem>
    </StudioSingleToggleGroup>
  );
}
