"use client";

import { ArrowRightLeft, ArrowUpDown } from "lucide-react";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioTab,
  StudioTabs,
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
      <StudioTabs layout="icons" onValueChange={onChange} value={value}>
        <StudioTab aria-label="Vertical" title="Vertical" value="vertical">
          <ArrowUpDown className="size-5" strokeWidth={1.75} />
        </StudioTab>
        <StudioTab
          aria-label="Horizontal"
          title="Horizontal"
          value="horizontal"
        >
          <ArrowRightLeft className="size-5" strokeWidth={1.75} />
        </StudioTab>
      </StudioTabs>
    </div>
  );
}
