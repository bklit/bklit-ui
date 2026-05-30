"use client";

import { EditorCollapsiblePane } from "@/editor/editor-collapsible-pane";
import { EditorRightPanelContent } from "@/editor/editor-right-panel-content";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControlGroup as StudioControlGroupConfig } from "@/lib/types";

export function EditorRightPanel({
  state,
  onChange,
  onPreview,
  onCommit,
  controlGroups = [],
  header,
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
  controlGroups?: StudioControlGroupConfig[];
  header?: React.ReactNode;
}) {
  return (
    <EditorCollapsiblePane label="Controls" side="right">
      <EditorRightPanelContent
        controlGroups={controlGroups}
        header={header}
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />
    </EditorCollapsiblePane>
  );
}
