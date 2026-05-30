"use client";

import type { StudioControlGroupConfig, StudioUrlState } from "@bklitui/studio";
import type { ReactNode, RefObject } from "react";
import { useEffect, useState } from "react";
import { EditorLeftPanel } from "@/components/editor/editor-left-panel";
import { EditorMainPane } from "@/components/editor/editor-main-pane";
import { EditorMobilePanelSheets } from "@/components/editor/editor-mobile-panel-sheets";
import { EditorRightPanel } from "@/components/editor/editor-right-panel";
import { useEditorCompactLayout } from "@/components/editor/use-editor-compact-layout";
import { useEditorFixedViewport } from "@/components/editor/use-editor-fixed-viewport";
import type { ViewportPreset } from "@/components/editor/viewport-presets";
import { cn } from "@/lib/utils";

function isMobileViewport(viewport: ViewportPreset | null) {
  return viewport === "mobile";
}

export function EditorShell({
  className,
  viewport,
  size,
  onViewportChange,
  onSizeChange,
  onReplay,
  chartState,
  showMotionControls = false,
  controlGroups = [],
  children,
}: {
  className?: string;
  viewport: ViewportPreset | null;
  size: { width: number; height: number };
  onViewportChange: (preset: ViewportPreset | null) => void;
  onSizeChange: (width: number, height: number) => void;
  onReplay: () => void;
  showMotionControls?: boolean;
  controlGroups?: StudioControlGroupConfig[];
  chartState: {
    displayState: StudioUrlState;
    state: StudioUrlState;
    setParam: <K extends keyof StudioUrlState>(
      key: K,
      value: StudioUrlState[K]
    ) => void;
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
  }) => ReactNode;
}) {
  const { compact: compactLayout, ready: layoutReady } =
    useEditorCompactLayout();
  const [sidebarsOpen, setSidebarsOpen] = useState(true);
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  const mobileShell =
    layoutReady && (compactLayout || isMobileViewport(viewport));
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
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onMotionCurveDragActiveChange={chartState.setMotionCurveDragging}
          onPreview={chartState.setPreviewParam}
          showMotionControls={showMotionControls}
          state={chartState.displayState}
        />
      ) : null}

      <EditorMainPane
        className="min-h-0 min-w-0 flex-1"
        mobileViewport={mobileShell}
        onLeftSheetOpen={() => setLeftSheetOpen(true)}
        onReplay={onReplay}
        onRightSheetOpen={() => setRightSheetOpen(true)}
        onSidebarsOpenChange={setSidebarsOpen}
        onSizeChange={onSizeChange}
        onViewportChange={onViewportChange}
        showSidebarToggle={!mobileShell}
        sidebarsOpen={sidebarsOpen}
        size={size}
        viewport={viewport}
      >
        {children}
      </EditorMainPane>

      {showInlineSidebars ? (
        <EditorRightPanel
          controlGroups={controlGroups}
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onPreview={chartState.setPreviewParam}
          state={chartState.displayState}
        />
      ) : null}

      {mobileShell ? (
        <EditorMobilePanelSheets
          controlGroups={controlGroups}
          leftOpen={leftSheetOpen}
          onChange={chartState.setParam}
          onCommit={chartState.commitParam}
          onLeftOpenChange={setLeftSheetOpen}
          onMotionCurveDragActiveChange={chartState.setMotionCurveDragging}
          onPreview={chartState.setPreviewParam}
          onRightOpenChange={setRightSheetOpen}
          rightOpen={rightSheetOpen}
          showMotionControls={showMotionControls}
          state={chartState.displayState}
        />
      ) : null}
    </div>
  );
}
