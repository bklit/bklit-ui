"use client";

import { memo, type ReactNode } from "react";
import { StudioPropertiesPanel } from "@/components/studio-properties-panel";
import { EditorCollapsiblePane } from "@/editor/editor-collapsible-pane";
import { EditorExportSection } from "@/editor/editor-export-section";
import { EditorPropertiesSidebarHeader } from "@/editor/editor-properties-sidebar-header";
import { useStudioComponentSelection } from "@/editor/studio-component-selection";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioRecordingAspect,
  StudioRecordingFormat,
  StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
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
  isRecording = false,
  recordingBlocked = false,
  onExportSvg = () => undefined,
  onStartRecording = () => undefined,
  onStopRecording = () => undefined,
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
  isRecording?: boolean;
  recordingBlocked?: boolean;
  onExportSvg?: () => void;
  onStartRecording?: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStopRecording?: () => void;
}) {
  const { selectedComponent } = useStudioComponentSelection();

  return (
    <EditorCollapsiblePane className="h-full" label="Properties" side="right">
      <div className="flex h-full min-h-0 w-full flex-col">
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
        <EditorExportSection
          controlsDisabled={controlsDisabled}
          isRecording={isRecording}
          onExportSvg={onExportSvg}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          recordingBlocked={recordingBlocked}
        />
      </div>
    </EditorCollapsiblePane>
  );
});
