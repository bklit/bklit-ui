"use client";

import { ArrowRightLeft, ArrowUpDown } from "lucide-react";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import { StudioSingleToggleGroup } from "@/components/controls/studio-toggle-group";
import { Label } from "@/ui/label";
import { ToggleGroupItem } from "@/ui/toggle-group";

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
      <StudioSingleToggleGroup
        onValueChange={onChange}
        size="icon"
        value={value}
        variant="studio"
      >
        <ToggleGroupItem
          aria-label="Vertical"
          title="Vertical"
          value="vertical"
        >
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
    </div>
  );
}
