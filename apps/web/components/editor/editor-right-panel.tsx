"use client";

import { EditorCollapsiblePane } from "@/components/editor/editor-collapsible-pane";
import { EditorRightPanelContent } from "@/components/editor/editor-right-panel-content";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";
import type { StudioControlGroup } from "@/lib/studio/types";

export function EditorRightPanel({
  state,
  onChange,
  onPreview,
  onCommit,
  controlGroups = [],
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
  controlGroups?: StudioControlGroup[];
}) {
  return (
    <EditorCollapsiblePane label="Controls" side="right">
      <EditorRightPanelContent
        controlGroups={controlGroups}
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />
    </EditorCollapsiblePane>
  );
}
