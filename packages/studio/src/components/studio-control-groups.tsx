"use client";

import { ControlField } from "@/components/controls/control-field";
import { isGroupLabeledControlType } from "@/components/controls/control-field-helpers";
import { LineCurveField } from "@/components/controls/curve-picker";
import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import { isStudioControlVisible } from "@/lib/pattern-control-visibility";
import { studioMotionSectionClass } from "@/lib/studio-chrome-classes";
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
    <div className="studio-control-groups w-full min-w-0 space-y-0 pb-4">
      {motionPanel ? (
        <StudioControlGroup
          className={studioMotionSectionClass}
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

      {groups.map((group) => {
        const visibleControls = group.controls.filter((control) =>
          isStudioControlVisible(control, state)
        );
        if (visibleControls.length === 0) {
          return null;
        }

        const curveControl = visibleControls.find(
          (control): control is Extract<typeof control, { type: "curve" }> =>
            control.type === "curve"
        );
        const fieldControls = curveControl
          ? visibleControls.filter((control) => control !== curveControl)
          : visibleControls;
        const showLineCurveField =
          group.title === "Line" && curveControl !== undefined;

        return (
          <StudioControlGroup
            collapsible={group.collapsible}
            defaultOpen={group.defaultOpen ?? true}
            key={group.title}
            title={group.title}
          >
            {showLineCurveField ? (
              <LineCurveField
                control={curveControl}
                onChange={onChange}
                state={state}
              />
            ) : null}
            {fieldControls.map((control) => (
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
        );
      })}
    </div>
  );
}
