"use client";

import { memo, type ReactNode } from "react";
import { StudioPropertiesPanel } from "@/components/studio-properties-panel";
import { EditorCollapsiblePane } from "@/editor/editor-collapsible-pane";
import { EditorExportSection } from "@/editor/editor-export-section";
import { EditorPropertiesSidebarFooter } from "@/editor/editor-properties-sidebar-footer";
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
  footerActions,
  onExportSvg = () => undefined,
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
  footerActions?: ReactNode;
  onExportSvg?: () => void;
}) {
  const { selectedComponent } = useStudioComponentSelection();

  return (
    <EditorCollapsiblePane className="h-full" label="Properties" side="right">
      <div className="flex h-full min-h-0 w-full flex-col">
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
        <EditorExportSection
          controlsDisabled={controlsDisabled}
          onExportSvg={onExportSvg}
        />
        <EditorPropertiesSidebarFooter actions={footerActions} />
      </div>
    </EditorCollapsiblePane>
  );
});
