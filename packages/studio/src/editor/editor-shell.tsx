"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useState } from "react";
import { EditorLeftPanel } from "@/editor/editor-left-panel";
import { EditorMainPane } from "@/editor/editor-main-pane";
import { EditorMobilePanelSheets } from "@/editor/editor-mobile-panel-sheets";
import { EditorRightPanel } from "@/editor/editor-right-panel";
import { useEditorCompactLayout } from "@/editor/use-editor-compact-layout";
import { useEditorFixedViewport } from "@/editor/use-editor-fixed-viewport";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioChartConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EditorShell({
  className,
  size,
  frameTitle,
  chartState,
  config,
  showMotionControls = false,
  chartSelector,
  propertiesHeaderActions,
  showFpsCounter = false,
  controlsDisabled = false,
  onScramble,
  children,
}: {
  className?: string;
  size: { width: number; height: number };
  frameTitle: string;
  showMotionControls?: boolean;
  config: StudioChartConfig;
  chartSelector?: ReactNode;
  propertiesHeaderActions?: ReactNode;
  showFpsCounter?: boolean;
  controlsDisabled?: boolean;
  onScramble: () => void;
  chartState: {
    displayState: StudioUrlState;
    state: StudioUrlState;
    setParam: <K extends keyof StudioUrlState>(
      key: K,
      value: StudioUrlState[K]
    ) => void;
    setStudioParams: (updates: Partial<StudioUrlState>) => void;
    setPreviewParams: (updates: Partial<StudioUrlState>) => void;
    setPreviewParam: <K extends keyof StudioUrlState>(
      key: K,
      value: StudioUrlState[K]
    ) => void;
    commitParam: <K extends keyof StudioUrlState>(
      key: K,
      value: StudioUrlState[K]
    ) => void;
    motionCurveDragging: boolean;
    setMotionCurveDragging: (dragging: boolean) => void;
  };
  children: (ctx: {
    size: { width: number; height: number };
    boundsRef: RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    mobileViewport: boolean;
    canvasScaleRef: RefObject<number>;
  }) => ReactNode;
}) {
  const { compact: compactLayout, ready: layoutReady } =
    useEditorCompactLayout();
  const [sidebarsOpen, setSidebarsOpen] = useState(true);
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  const mobileShell = layoutReady && compactLayout;
  const showInlineSidebars = layoutReady && !mobileShell && sidebarsOpen;

  useEffect(() => {
    if (mobileShell) {
      setLeftSheetOpen(false);
      setRightSheetOpen(false);
      setSidebarsOpen(false);
    }
  }, [mobileShell]);

  useEditorFixedViewport(mobileShell);

  return (
    <div
      className={cn(
        "flex overflow-hidden bg-background",
        mobileShell ? "fixed inset-0 h-dvh w-full" : "h-dvh",
        className
      )}
    >
      {showInlineSidebars ? (
        <EditorLeftPanel
          chartSelector={chartSelector}
          config={config}
          controlsDisabled={controlsDisabled}
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onMotionCurveDragActiveChange={chartState.setMotionCurveDragging}
          onPreview={chartState.setPreviewParam}
          onScramble={onScramble}
          showMotionControls={showMotionControls}
          state={chartState.displayState}
        />
      ) : null}

      <EditorMainPane
        className="min-h-0 min-w-0 flex-1"
        frameTitle={frameTitle}
        mobileViewport={mobileShell}
        onLeftSheetOpen={() => setLeftSheetOpen(true)}
        onRightSheetOpen={() => setRightSheetOpen(true)}
        onSidebarsOpenChange={setSidebarsOpen}
        showFpsCounter={showFpsCounter}
        showSidebarToggle={!mobileShell}
        sidebarsOpen={sidebarsOpen}
        size={size}
      >
        {children}
      </EditorMainPane>

      {showInlineSidebars ? (
        <EditorRightPanel
          config={config}
          controlsDisabled={controlsDisabled}
          headerActions={propertiesHeaderActions}
          onBatchChange={chartState.setStudioParams}
          onBatchPreview={chartState.setPreviewParams}
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onPreview={chartState.setPreviewParam}
          state={chartState.displayState}
        />
      ) : null}

      {mobileShell ? (
        <EditorMobilePanelSheets
          chartSelector={chartSelector}
          config={config}
          controlsDisabled={controlsDisabled}
          headerActions={propertiesHeaderActions}
          leftOpen={leftSheetOpen}
          onBatchChange={chartState.setStudioParams}
          onBatchPreview={chartState.setPreviewParams}
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onLeftOpenChange={setLeftSheetOpen}
          onMotionCurveDragActiveChange={chartState.setMotionCurveDragging}
          onPreview={chartState.setPreviewParam}
          onRightOpenChange={setRightSheetOpen}
          onScramble={onScramble}
          rightOpen={rightSheetOpen}
          showMotionControls={showMotionControls}
          state={chartState.displayState}
        />
      ) : null}
    </div>
  );
}
