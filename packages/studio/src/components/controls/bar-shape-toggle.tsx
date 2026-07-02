"use client";

import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { Label } from "@/ui/label";

export type BarShapeValue = "classic" | "shape";

export function normalizeBarVariant(value: string): BarShapeValue {
  return value === "shape" || value === "squares" ? "shape" : "classic";
}

export function BarShapeToggle({
  value,
  onChange,
  label = "Shape",
}: {
  value: string;
  onChange: (value: BarShapeValue) => void;
  label?: string;
}) {
  const normalized = normalizeBarVariant(value);

  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>{label}</Label>
      <StudioToggleGroup
        layout="segmented"
        onValueChange={(next) => onChange(normalizeBarVariant(next))}
        value={normalized}
      >
        <StudioToggleGroupItem value="classic">Classic</StudioToggleGroupItem>
        <StudioToggleGroupItem value="shape">Shape</StudioToggleGroupItem>
      </StudioToggleGroup>
    </div>
  );
}
