"use client";

import { StudioComponentsPanel } from "@/components/studio-components-panel";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { EditorAnimationSection } from "@/editor/editor-animation-section";
import { EditorCollapsiblePane } from "@/editor/editor-collapsible-pane";
import { EditorDataSection } from "@/editor/editor-data-section";
import { useStudioComponentSelection } from "@/editor/studio-component-selection";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioChartConfig } from "@/lib/types";

export function EditorLeftPanel({
  config,
  state,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
  chartSelector,
  controlsDisabled = false,
  onScramble,
}: {
  config: StudioChartConfig;
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
  chartSelector?: React.ReactNode;
  controlsDisabled?: boolean;
  onScramble: () => void;
}) {
  const {
    components,
    dataControlGroups,
    selectedComponentId,
    setSelectedComponentId,
  } = useStudioComponentSelection();
  const showScramble = config.scrambleData !== false;

  return (
    <EditorCollapsiblePane label="Controls" side="left">
      <StudioScrollArea className="min-h-0 min-w-0 flex-1">
        <div className="flex flex-col gap-0 p-3 pb-4">
          {chartSelector ? (
            <section className="border-border/60 border-b pb-4">
              {chartSelector}
            </section>
          ) : null}

          <StudioComponentsPanel
            components={components}
            controlsDisabled={controlsDisabled}
            onChange={onChange}
            onScramble={showScramble ? onScramble : undefined}
            onSelect={setSelectedComponentId}
            selectedId={selectedComponentId}
            state={state}
          />

          <EditorDataSection
            groups={dataControlGroups}
            onChange={onChange}
            onCommit={onCommit}
            onPreview={onPreview}
            state={state}
          />

          <EditorAnimationSection
            onChange={onChange}
            onCommit={onCommit}
            onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
            onPreview={onPreview}
            showMotionControls={showMotionControls}
            state={state}
          />
        </div>
      </StudioScrollArea>
    </EditorCollapsiblePane>
  );
}
