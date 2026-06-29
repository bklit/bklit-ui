"use client";

import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioToggleGroupItem } from "@/components/controls/studio-toggle-group";
import type { CurveId } from "@/lib/curves";
import { CURVE_OPTIONS } from "@/lib/curves";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildProjectionScopedControlUpdate,
  getProjectionScopedControlValue,
} from "@/lib/studio-projection-props";
import {
  buildSeriesScopedControlUpdate,
  getSeriesScopedControlValue,
} from "@/lib/studio-series-line-props";
import type { StudioControl } from "@/lib/types";
import { CurvePreviewIcon } from "../curve-preview-icons";

export function CurvePicker({
  value,
  onChange,
}: {
  value: CurveId;
  onChange: (v: CurveId) => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      {CURVE_OPTIONS.map((opt) => (
        <StudioToggleGroupItem
          aria-label={opt.label}
          key={opt.value}
          title={opt.label}
          value={opt.value}
        >
          <CurvePreviewIcon className="text-current" curveId={opt.value} />
        </StudioToggleGroupItem>
      ))}
    </IconToggleGroup>
  );
}

export function CurvePickerField({
  label = "Curve",
  value,
  onChange,
}: {
  label?: string;
  value: CurveId;
  onChange: (v: CurveId) => void;
}) {
  const selectedName =
    CURVE_OPTIONS.find((opt) => opt.value === value)?.label ?? value;

  return (
    <div className="flex flex-col gap-2">
      <span className={studioFieldLabelClass}>
        {label}: {selectedName}
      </span>
      <CurvePicker onChange={onChange} value={value} />
    </div>
  );
}

export function LineCurveField({
  control,
  state,
  onChange,
}: {
  control: Extract<StudioControl, { type: "curve" }>;
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const seriesIndex = control.seriesIndex;
  const projectionIndex = control.projectionIndex;
  let value:
    | StudioUrlState["curve"]
    | ReturnType<typeof getProjectionScopedControlValue>;
  if (projectionIndex !== undefined) {
    value = getProjectionScopedControlValue(
      state,
      control.key,
      projectionIndex
    );
  } else if (seriesIndex === undefined) {
    value = state.curve;
  } else {
    value = getSeriesScopedControlValue(state, "curve", seriesIndex);
  }

  return (
    <CurvePickerField
      label={control.label}
      onChange={(next) => {
        if (projectionIndex !== undefined) {
          const updates = buildProjectionScopedControlUpdate(
            state,
            control.key,
            projectionIndex,
            next
          );
          for (const [key, updateValue] of Object.entries(updates)) {
            onChange(
              key as keyof StudioUrlState,
              updateValue as StudioUrlState[keyof StudioUrlState]
            );
          }
          return;
        }
        if (seriesIndex !== undefined) {
          const updates = buildSeriesScopedControlUpdate(
            state,
            "curve",
            seriesIndex,
            next
          );
          for (const [key, updateValue] of Object.entries(updates)) {
            onChange(
              key as keyof StudioUrlState,
              updateValue as StudioUrlState[keyof StudioUrlState]
            );
          }
          return;
        }
        onChange("curve", next);
      }}
      value={value as CurveId}
    />
  );
}
