"use client";

import { PanelLeftOpen } from "lucide-react";
import { EditorLeftPanelContent } from "@/editor/editor-left-panel-content";
import { EditorRightPanelContent } from "@/editor/editor-right-panel-content";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControlGroup as StudioControlGroupConfig } from "@/lib/types";
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
        label="Open motion controls"
        onClick={onLeftOpen}
        side="left"
      />
      <MobilePanelTrigger
        className="absolute top-3 right-3 z-20"
        label="Open chart controls"
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
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
  showMotionControls = false,
  controlGroups = [],
  header,
}: {
  leftOpen: boolean;
  rightOpen: boolean;
  onLeftOpenChange: (open: boolean) => void;
  onRightOpenChange: (open: boolean) => void;
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
  controlGroups?: StudioControlGroupConfig[];
  header?: React.ReactNode;
}) {
  return (
    <>
      <Sheet onOpenChange={onLeftOpenChange} open={leftOpen}>
        <SheetContent
          className="flex w-[min(100vw,360px)] flex-col gap-0 p-0 sm:max-w-[360px]"
          side="left"
        >
          <SheetTitle className="sr-only">Motion controls</SheetTitle>
          <SheetDescription className="sr-only">
            Animation and motion settings for the chart preview.
          </SheetDescription>
          <EditorLeftPanelContent
            onChange={onChange}
            onCommit={onCommit}
            onMotionCurveDragActiveChange={onMotionCurveDragActiveChange}
            onPreview={onPreview}
            showMotionControls={showMotionControls}
            state={state}
          />
        </SheetContent>
      </Sheet>

      <Sheet onOpenChange={onRightOpenChange} open={rightOpen}>
        <SheetContent
          className="flex w-[min(100vw,360px)] flex-col gap-0 p-0 sm:max-w-[360px]"
          side="right"
        >
          <SheetTitle className="sr-only">Chart controls</SheetTitle>
          <SheetDescription className="sr-only">
            Line chart data and styling controls.
          </SheetDescription>
          <EditorRightPanelContent
            controlGroups={controlGroups}
            header={header}
            onChange={onChange}
            onCommit={onCommit}
            onPreview={onPreview}
            state={state}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
