"use client";

import { ControlField } from "@/components/controls/control-field";
import { isGroupLabeledControlType } from "@/components/controls/control-field-helpers";
import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioChartConfig,
  StudioControlGroup as StudioControlGroupConfig,
} from "@/lib/types";

export function StudioControlGroups({
  groups,
  state,
  motionPanel,
  motionStagger,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
}: {
  groups: StudioControlGroupConfig[];
  state: StudioUrlState;
  motionPanel?: StudioChartConfig["motionPanel"];
  motionStagger?: StudioChartConfig["motionStagger"];
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
  onMotionCurveDragActiveChange?: (dragging: boolean) => void;
}) {
  return (
    <div className="studio-control-groups w-full min-w-0 space-y-7 pb-4">
      {motionPanel ? (
        <StudioControlGroup
          className="studio-motion-section"
          title="Motion"
          titleTrailing={
            <MotionResetButton onCommit={onCommit} state={state} />
          }
        >
          <MotionControl
            onChange={onChange}
            onCommit={onCommit}
            onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
            onPreview={onPreview}
            showStaggerScale={motionStagger}
            state={state}
          />
        </StudioControlGroup>
      ) : null}

      {groups.map((group) => (
        <StudioControlGroup key={group.title} title={group.title}>
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
    </div>
  );
}
