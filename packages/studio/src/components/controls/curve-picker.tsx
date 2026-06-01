"use client";

import {
  StudioSingleToggleGroup,
  ToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { CURVE_OPTIONS, type CurveId } from "@/lib/curves";
import { CurvePreviewIcon } from "../curve-preview-icons";

export function CurvePicker({
  value,
  onChange,
}: {
  value: CurveId;
  onChange: (v: CurveId) => void;
}) {
  return (
    <StudioSingleToggleGroup
      className="grid w-full grid-cols-3 gap-1.5"
      onValueChange={onChange}
      size="card"
      spacing={2}
      value={value}
      variant="studio"
    >
      {CURVE_OPTIONS.map((opt) => (
        <ToggleGroupItem
          aria-label={opt.label}
          key={opt.value}
          title={opt.label}
          value={opt.value}
        >
          <CurvePreviewIcon className="text-current" curveId={opt.value} />
          <span className="text-center leading-tight">{opt.label}</span>
        </ToggleGroupItem>
      ))}
    </StudioSingleToggleGroup>
  );
}
