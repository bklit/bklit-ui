"use client";

import { Icon } from "@bklitui/icons";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import type { LineYAxisId } from "@/lib/line-series-y-axis";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { StudioControlRow } from "./control-field-helpers";

export function ReferenceAreaYAxisControl({
  state,
  label,
  onChange,
  onCommit,
}: {
  state: StudioUrlState;
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
  const value = state.referenceAreaYAxis;
  const commit = onCommit ?? onChange;

  return (
    <StudioControlRow label={label}>
      <StudioToggleGroup
        layout="icons"
        onValueChange={(axisId) =>
          commit("referenceAreaYAxis", axisId as LineYAxisId)
        }
        value={value}
      >
        <StudioToggleGroupItem aria-label="Left axis" title="Left" value="left">
          <Icon className="size-5" name="IconLayoutAlignLeft" />
        </StudioToggleGroupItem>
        <StudioToggleGroupItem
          aria-label="Right axis"
          title="Right"
          value="right"
        >
          <Icon className="size-5" name="IconLayoutAlignRight" />
        </StudioToggleGroupItem>
      </StudioToggleGroup>
    </StudioControlRow>
  );
}
