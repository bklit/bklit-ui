"use client";

import {
  StudioToggleGroup,
  StudioToggleGroupItem,
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
    <StudioToggleGroup layout="cards-3" onValueChange={onChange} value={value}>
      {CURVE_OPTIONS.map((opt) => (
        <StudioToggleGroupItem
          aria-label={opt.label}
          key={opt.value}
          title={opt.label}
          value={opt.value}
        >
          <CurvePreviewIcon className="text-current" curveId={opt.value} />
          <span className="text-center leading-tight">{opt.label}</span>
        </StudioToggleGroupItem>
      ))}
    </StudioToggleGroup>
  );
}
