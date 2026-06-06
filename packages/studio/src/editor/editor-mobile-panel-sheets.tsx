"use client";

import { PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { StudioComponentsPanel } from "@/components/studio-components-panel";
import { StudioPropertiesPanel } from "@/components/studio-properties-panel";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { EditorAnimationSection } from "@/editor/editor-animation-section";
import { EditorDataSection } from "@/editor/editor-data-section";
import { EditorExportSection } from "@/editor/editor-export-section";
import { EditorPropertiesSidebarHeader } from "@/editor/editor-properties-sidebar-header";
import { useStudioComponentSelection } from "@/editor/studio-component-selection";
import { isCartesianLoadingMode } from "@/lib/line-chart-mode";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioRecordingAspect,
  StudioRecordingFormat,
  StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import type { StudioChartConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/ui/sheet";

function MobilePanelTrigger({
  side,
  label,
  onClick,
  className,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      aria-label={label}
      className={cn("size-8", className)}
      onClick={onClick}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      <PanelLeftOpen
        className={side === "right" ? "scale-x-[-1]" : undefined}
      />
    </Button>
  );
}

export function EditorMobilePanelTriggers({
  onLeftOpen,
  onRightOpen,
}: {
  onLeftOpen: () => void;
  onRightOpen: () => void;
}) {
  return (
    <>
      <MobilePanelTrigger
        className="absolute top-3 left-3 z-20"
        label="Open chart and components"
        onClick={onLeftOpen}
        side="left"
      />
      <MobilePanelTrigger
        className="absolute top-3 right-3 z-20"
        label="Open properties"
        onClick={onRightOpen}
        side="right"
      />
    </>
  );
}

export function EditorMobilePanelSheets({
  leftOpen,
  rightOpen,
  onLeftOpenChange,
  onRightOpenChange,
  state,
  config,
  onChange,
  onBatchChange,
  onBatchPreview,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
  chartSelector,
  controlsDisabled = false,
  headerActions,
  onScramble,
  isRecording = false,
  recordingBlocked = false,
  onExportSvg = () => undefined,
  onStartRecording = () => undefined,
  onStopRecording = () => undefined,
}: {
  leftOpen: boolean;
  rightOpen: boolean;
  onLeftOpenChange: (open: boolean) => void;
  onRightOpenChange: (open: boolean) => void;
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
  onMotionCurveDragActiveChange?: (dragging: boolean) => void;
  showMotionControls?: boolean;
  chartSelector?: React.ReactNode;
  controlsDisabled?: boolean;
  headerActions?: ReactNode;
  onScramble: () => void;
  isRecording?: boolean;
  recordingBlocked?: boolean;
  onExportSvg: () => void;
  onStartRecording: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStopRecording: () => void;
}) {
  const {
    components,
    dataControlGroups,
    selectedComponentId,
    setSelectedComponentId,
    selectedComponent,
  } = useStudioComponentSelection();
  const isCartesianLoading = isCartesianLoadingMode(state);
  const dataSectionDefaultOpen = !isCartesianLoading;
  const animationSectionDefaultOpen = showMotionControls || !isCartesianLoading;

  return (
    <>
      <Sheet onOpenChange={onLeftOpenChange} open={leftOpen}>
        <SheetContent
          className="flex w-[min(100vw,360px)] flex-col gap-0 p-0 sm:max-w-[360px]"
          side="left"
        >
          <SheetTitle className="sr-only">Chart and components</SheetTitle>
          <SheetDescription className="sr-only">
            Chart type, layer list, and animation controls.
          </SheetDescription>
          <StudioScrollArea className="min-h-0 flex-1">
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
                onScramble={onScramble}
                onSelect={setSelectedComponentId}
                scrambleDisabled={isCartesianLoading}
                selectedId={selectedComponentId}
                state={state}
              />
              <EditorDataSection
                defaultOpen={dataSectionDefaultOpen}
                groups={dataControlGroups}
                onChange={onChange}
                onCommit={onCommit}
                onPreview={onPreview}
                state={state}
              />
              <EditorAnimationSection
                defaultOpen={animationSectionDefaultOpen}
                onChange={onChange}
                onCommit={onCommit}
                onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
                onPreview={onPreview}
                showMotionControls={showMotionControls}
                state={state}
              />
            </div>
          </StudioScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet onOpenChange={onRightOpenChange} open={rightOpen}>
        <SheetContent
          className="flex w-[min(100vw,360px)] flex-col gap-0 p-0 sm:max-w-[360px]"
          side="right"
        >
          <SheetTitle className="sr-only">Properties</SheetTitle>
          <SheetDescription className="sr-only">
            Configurable options for the selected chart component.
          </SheetDescription>
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
        </SheetContent>
      </Sheet>
    </>
  );
}
