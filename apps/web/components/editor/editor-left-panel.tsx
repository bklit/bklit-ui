"use client";

import type { StudioUrlState } from "@bklitui/studio";
import { EditorCollapsiblePane } from "@/components/editor/editor-collapsible-pane";
import { EditorLeftPanelContent } from "@/components/editor/editor-left-panel-content";

export function EditorLeftPanel({
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
  return (
    <EditorCollapsiblePane label="Motion" side="left">
      <EditorLeftPanelContent
        onChange={onChange}
        onCommit={onCommit}
        onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
        onPreview={onPreview}
        showMotionControls={showMotionControls}
        state={state}
      />
    </EditorCollapsiblePane>
  );
}
