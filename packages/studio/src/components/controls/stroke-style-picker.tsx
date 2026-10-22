"use client";

import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import type { StrokeStyleOption } from "@/lib/types";

const DEFAULT_OPTIONS: readonly StrokeStyleOption[] = ["solid", "dashed"];

const LABELS: Record<StrokeStyleOption, string> = {
  solid: "Solid",
  dashed: "Dashed",
  gradient: "Gradient",
};

export function StrokeStylePicker({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: {
  value: StrokeStyleOption;
  onChange: (value: StrokeStyleOption) => void;
  options?: readonly StrokeStyleOption[];
}) {
  return (
    <StudioToggleGroup onValueChange={onChange} value={value}>
      {options.map((option) => (
        <StudioToggleGroupItem
          aria-label={LABELS[option]}
          key={option}
          value={option}
        >
          {LABELS[option]}
        </StudioToggleGroupItem>
      ))}
    </StudioToggleGroup>
  );
}
