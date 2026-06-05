"use client";

import { memo, type ReactNode } from "react";
import { StudioPropertiesPanel } from "@/components/studio-properties-panel";
import { EditorCollapsiblePane } from "@/editor/editor-collapsible-pane";
import { EditorPropertiesSidebarHeader } from "@/editor/editor-properties-sidebar-header";
import { useStudioComponentSelection } from "@/editor/studio-component-selection";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioChartConfig } from "@/lib/types";

export const EditorRightPanel = memo(function EditorRightPanel({
  state,
  config,
  onChange,
  onBatchChange,
  onBatchPreview,
  onPreview,
  onCommit,
  controlsDisabled = false,
  headerActions,
}: {
  state: StudioUrlState;
  config: StudioChartConfig;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onBatchChange: (updates: Partial<StudioUrlState>) => void;
  onBatchPreview?: (updates: Partial<StudioUrlState>) => void;
  onPreview: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  controlsDisabled?: boolean;
  headerActions?: ReactNode;
}) {
  const { selectedComponent } = useStudioComponentSelection();

  return (
    <EditorCollapsiblePane label="Properties" side="right">
      <EditorPropertiesSidebarHeader actions={headerActions} />
      <StudioPropertiesPanel
        component={selectedComponent}
        config={config}
        disabled={controlsDisabled}
        onBatchChange={onBatchChange}
        onBatchPreview={onBatchPreview}
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />
    </EditorCollapsiblePane>
  );
});
