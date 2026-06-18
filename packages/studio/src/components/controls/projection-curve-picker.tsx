"use client";

import type { ProjectionCurveKind } from "@bklitui/ui/charts";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import { IconToggleButton, IconToggleGroup } from "./icon-toggle-group";

const PROJECTION_CURVE_LABELS: Record<ProjectionCurveKind, string> = {
  linear: "Linear",
  bezier: "S-curve",
};

export function ProjectionCurvePicker({
  value,
  onChange,
}: {
  value: ProjectionCurveKind;
  onChange: (value: ProjectionCurveKind) => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      <IconToggleButton
        icon="IconAnimationLinear"
        label="Linear"
        value="linear"
      />
      <IconToggleButton
        icon="IconAnimationEase"
        label="S-curve"
        value="bezier"
      />
    </IconToggleGroup>
  );
}

export function ProjectionCurvePickerField({
  label = "Curve",
  value,
  onChange,
}: {
  label?: string;
  value: ProjectionCurveKind;
  onChange: (value: ProjectionCurveKind) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={studioFieldLabelClass}>
        {label}: {PROJECTION_CURVE_LABELS[value]}
      </span>
      <ProjectionCurvePicker onChange={onChange} value={value} />
    </div>
  );
}
