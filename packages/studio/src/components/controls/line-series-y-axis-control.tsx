"use client";

import {
  buildLineSeriesYAxesUpdate,
  getLineSeriesYAxisId,
  LINE_Y_AXIS_OPTIONS,
  type LineYAxisId,
} from "@/lib/line-series-y-axis";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { StudioControlRow } from "./control-field-helpers";

export function LineSeriesYAxisControl({
  state,
  seriesIndex,
  label,
  onChange,
  onCommit,
}: {
  state: StudioUrlState;
  seriesIndex: number;
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
  const value = getLineSeriesYAxisId(state, seriesIndex);
  const commit = onCommit ?? onChange;

  return (
    <StudioControlRow label={label}>
      <Select
        onValueChange={(axisId) =>
          commit(
            "lineSeriesYAxes",
            buildLineSeriesYAxesUpdate(
              state,
              seriesIndex,
              axisId as LineYAxisId
            )
          )
        }
        value={value}
      >
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LINE_Y_AXIS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </StudioControlRow>
  );
}
