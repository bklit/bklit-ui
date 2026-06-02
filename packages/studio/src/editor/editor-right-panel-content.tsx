"use client";

import { StudioControlGroups } from "@/components/studio-control-groups";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControlGroup as StudioControlGroupConfig } from "@/lib/types";

export function EditorRightPanelContent({
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
  if (controlGroups.length === 0 && !header) {
    return (
      <EditorPanelEmptyState>
        Chart controls will appear here as you add props and settings.
      </EditorPanelEmptyState>
    );
  }

  return (
    <StudioScrollArea className="min-h-0 min-w-0 flex-1">
      <div className="flex flex-col gap-5 p-3 pb-4">
        {header}
        {controlGroups.length > 0 ? (
          <StudioControlGroups
            groups={controlGroups}
            onChange={onChange}
            onCommit={onCommit}
            onPreview={onPreview}
            state={state}
          />
        ) : null}
      </div>
    </StudioScrollArea>
  );
}
