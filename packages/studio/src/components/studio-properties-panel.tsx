"use client";

import { StudioDesignControls } from "@/components/controls/studio-design-controls";
import { StudioControlGroups } from "@/components/studio-control-groups";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { EditorPanelEmptyState } from "@/editor/editor-panel-empty-state";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioChartConfig, StudioComponentDefinition } from "@/lib/types";

export function StudioPropertiesPanel({
  component,
  state,
  config,
  onChange,
  onBatchChange,
  onBatchPreview,
  onPreview,
  onCommit,
  disabled = false,
}: {
  component: StudioComponentDefinition | undefined;
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
  disabled?: boolean;
}) {
  if (!component) {
    return (
      <EditorPanelEmptyState>
        Select a component to edit its properties.
      </EditorPanelEmptyState>
    );
  }

  const hasControls = component.controlGroups.some(
    (group) => group.controls.length > 0
  );
  const hasDesign = Boolean(component.design);

  if (!(hasControls || hasDesign)) {
    return (
      <EditorPanelEmptyState>
        No configurable properties for {component.label}.
      </EditorPanelEmptyState>
    );
  }

  return (
    <StudioScrollArea className="min-h-0 min-w-0 flex-1">
      <div className="flex flex-col gap-5 p-3 pb-4">
        {hasDesign && component.design ? (
          <StudioDesignControls
            design={component.design}
            disabled={disabled}
            onBatchChange={onBatchChange}
            onBatchPreview={onBatchPreview}
            state={state}
            supportsPatterns={
              component.design.supportsPattern ?? config.supportsPatterns
            }
          />
        ) : null}

        {hasControls ? (
          <StudioControlGroups
            groups={component.controlGroups}
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
