"use client";

import { ControlField } from "@/components/controls/control-field";
import { isGroupLabeledControlType } from "@/components/controls/control-field-helpers";
import { StudioControlGroup } from "@/components/studio-control-group";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControlGroup as StudioControlGroupConfig } from "@/lib/types";

export function EditorDataSection({
  groups,
  defaultOpen = true,
  state,
  onChange,
  onPreview,
  onCommit,
}: {
  groups: StudioControlGroupConfig[];
  defaultOpen?: boolean;
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onPreview: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <>
      {groups.map((group) => (
        <StudioControlGroup
          collapsible
          defaultOpen={defaultOpen}
          key={group.title}
          title={group.title}
        >
          {group.controls.map((control) => (
            <ControlField
              control={control}
              hideGroupLabel={isGroupLabeledControlType(control.type)}
              key={control.key}
              onChange={onChange}
              onCommit={onCommit}
              onPreview={onPreview}
              state={state}
            />
          ))}
        </StudioControlGroup>
      ))}
    </>
  );
}
