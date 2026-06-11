"use client";

import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioToggleGroupItem } from "@/components/controls/studio-toggle-group";
import type { CurveId } from "@/lib/curves";
import { CURVE_OPTIONS } from "@/lib/curves";
import type { StudioUrlState } from "@/lib/studio-parsers";
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

export function LineGroupHeaderCurve({
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
  const value =
    seriesIndex === undefined
      ? state.curve
      : getSeriesScopedControlValue(state, "curve", seriesIndex);

  return (
    <CurvePicker
      onChange={(next) => {
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
