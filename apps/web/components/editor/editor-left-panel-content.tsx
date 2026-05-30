"use client";

import {
  MotionControl,
  MotionResetButton,
  StudioControlGroup,
  type StudioUrlState,
} from "@bklitui/studio";
import { DocsScrollArea } from "@/components/docs/docs-scroll-area";
import { EditorPanelEmptyState } from "@/components/editor/editor-panel-empty-state";

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
    <DocsScrollArea className="studio-sidebar-scroll min-h-0 min-w-0 flex-1">
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
    </DocsScrollArea>
  );
}
