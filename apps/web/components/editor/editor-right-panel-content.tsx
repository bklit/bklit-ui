"use client";

import {
  type StudioControlGroupConfig,
  StudioControlGroups,
  type StudioUrlState,
} from "@bklitui/studio";
import { DocsScrollArea } from "@/components/docs/docs-scroll-area";
import { EditorPanelEmptyState } from "@/components/editor/editor-panel-empty-state";

export function EditorRightPanelContent({
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
  controlGroups?: StudioControlGroupConfig[];
}) {
  if (controlGroups.length === 0) {
    return (
      <EditorPanelEmptyState>
        Chart controls will appear here as you add props and settings.
      </EditorPanelEmptyState>
    );
  }

  return (
    <DocsScrollArea className="studio-sidebar-scroll min-h-0 min-w-0 flex-1">
      <div className="p-3 pb-4">
        <StudioControlGroups
          groups={controlGroups}
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
          state={state}
        />
      </div>
    </DocsScrollArea>
  );
}
