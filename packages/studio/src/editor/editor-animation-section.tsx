"use client";

import { ControlField } from "@/components/controls/control-field";
import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import { studioMotionSectionClass } from "@/lib/studio-chrome-classes";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControl } from "@/lib/types";

export function EditorAnimationSection({
  defaultOpen = true,
  state,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
  extraControls,
}: {
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
  onMotionCurveDragActiveChange?: (dragging: boolean) => void;
  showMotionControls?: boolean;
  /** Chart-specific toggles shown above the motion curve (e.g. sparkline animate). */
  extraControls?: StudioControl[];
}) {
  if (!showMotionControls) {
    return (
      <StudioControlGroup
        collapsible
        defaultOpen={defaultOpen}
        title="Animation"
      >
        <EditorPanelEmptyState>
          Animation controls will appear here when your chart uses motion.
        </EditorPanelEmptyState>
      </StudioControlGroup>
    );
  }

  return (
    <StudioControlGroup
      className={studioMotionSectionClass}
      collapsible
      defaultOpen={defaultOpen}
      title="Animation"
      titleTrailing={<MotionResetButton onCommit={onCommit} state={state} />}
    >
      {extraControls?.map((control) => (
        <ControlField
          control={control}
          key={control.key}
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
          state={state}
        />
      ))}
      <MotionControl
        onChange={onChange}
        onCommit={onCommit}
        onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
        onPreview={onPreview}
        state={state}
      />
    </StudioControlGroup>
  );
}
