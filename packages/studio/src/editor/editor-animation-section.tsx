"use client";

import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function EditorAnimationSection({
  state,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
}: {
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
}) {
  if (!showMotionControls) {
    return (
      <StudioControlGroup title="Animation">
        <EditorPanelEmptyState>
          Animation controls will appear here when your chart uses motion.
        </EditorPanelEmptyState>
      </StudioControlGroup>
    );
  }

  return (
    <StudioControlGroup
      className="studio-motion-section"
      title="Animation"
      titleTrailing={<MotionResetButton onCommit={onCommit} state={state} />}
    >
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
