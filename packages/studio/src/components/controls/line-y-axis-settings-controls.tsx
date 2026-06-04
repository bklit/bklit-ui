"use client";

import {
  Y_AXIS_MAX_TICK_COUNT,
  Y_AXIS_MIN_TICK_COUNT,
} from "@bklitui/ui/charts";
import type { LineYAxisId } from "@/lib/line-series-y-axis";
import {
  buildLineYAxisFormatLargeUpdate,
  buildLineYAxisNumTicksUpdate,
  getLineYAxisFormatLargeNumbers,
  getLineYAxisNumTicks,
} from "@/lib/line-y-axis-settings";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { Switch } from "@/ui/switch";
import { StudioControlRow } from "./control-field-helpers";
import { SliderInputGroup } from "./slider-input-group";

export function LineYAxisNumTicksControl({
  state,
  axis,
  label,
  onChange,
  onCommit,
}: {
  state: StudioUrlState;
  axis: LineYAxisId;
  label: string;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const value = getLineYAxisNumTicks(state, axis);
  const commit = onCommit ?? onChange;

  return (
    <SliderInputGroup
      label={label}
      max={Y_AXIS_MAX_TICK_COUNT}
      min={Y_AXIS_MIN_TICK_COUNT}
      onCommit={(n) =>
        commit(
          "lineYAxisNumTicks",
          buildLineYAxisNumTicksUpdate(state, axis, n)
        )
      }
      onPreview={(n) =>
        onChange(
          "lineYAxisNumTicks",
          buildLineYAxisNumTicksUpdate(state, axis, n)
        )
      }
      step={1}
      value={value}
    />
  );
}

export function LineYAxisFormatLargeControl({
  state,
  axis,
  label,
  onChange,
}: {
  state: StudioUrlState;
  axis: LineYAxisId;
  label: string;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const checked = getLineYAxisFormatLargeNumbers(state, axis);

  return (
    <StudioControlRow alignControl="end" label={label}>
      <Switch
        checked={checked}
        id={`line-y-axis-format-large-${axis}`}
        onCheckedChange={(formatLargeNumbers) =>
          onChange(
            "lineYAxisFormatLarge",
            buildLineYAxisFormatLargeUpdate(state, axis, formatLargeNumbers)
          )
        }
      />
    </StudioControlRow>
  );
}
