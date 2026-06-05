"use client";

import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function EditorAnimationSection({
  defaultOpen = true,
  state,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
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
      className="studio-motion-section"
      collapsible
      defaultOpen={defaultOpen}
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
