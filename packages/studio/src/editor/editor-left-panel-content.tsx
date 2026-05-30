"use client";

import { MotionControl } from "@/components/controls/motion-control";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { StudioControlGroup } from "@/components/studio-control-group";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function EditorLeftPanelContent({
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
      <EditorPanelEmptyState>
        Animation controls will appear here when your chart uses motion.
      </EditorPanelEmptyState>
    );
  }

  return (
    <StudioScrollArea className="min-h-0 min-w-0 flex-1">
      <div className="p-3 pb-4">
        <StudioControlGroup
          className="studio-motion-section"
          title="Animation"
          titleTrailing={
            <MotionResetButton onCommit={onCommit} state={state} />
          }
        >
          <MotionControl
            onChange={onChange}
            onCommit={onCommit}
            onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
            onPreview={onPreview}
            state={state}
          />
        </StudioControlGroup>
      </div>
    </StudioScrollArea>
  );
}
