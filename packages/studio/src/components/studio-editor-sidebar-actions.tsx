"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { StudioCodeSheetTrigger } from "@/components/studio-code-sheet-trigger";
import { StudioExportSvgButton } from "@/components/studio-export-svg-button";
import { StudioRecordPopover } from "@/components/studio-record-popover";
import { EditorReplayButton } from "@/editor/editor-replay-button";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioRecordingAspect,
  StudioRecordingFormat,
  StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import { supportsStudioExportFeatures } from "@/lib/studio-runtime";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function StudioEditorSidebarActions({
  state,
  controlsDisabled,
  recordingBlocked,
  isRecording,
  onReplay,
  onExportSvg,
  onRecordPopoverOpenChange,
  onStartRecording,
  onStopRecording,
  renderCodeSheet,
}: {
  state: StudioUrlState;
  controlsDisabled: boolean;
  recordingBlocked: boolean;
  isRecording: boolean;
  onReplay: () => void;
  onExportSvg: () => void;
  onRecordPopoverOpenChange: (open: boolean) => void;
  onStartRecording: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStopRecording: () => void;
  renderCodeSheet?: (state: StudioUrlState) => ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "r" && event.key !== "R") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      onReplay();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onReplay]);

  const showExportFeatures = supportsStudioExportFeatures();

  return (
    <>
      <EditorReplayButton disabled={controlsDisabled} onReplay={onReplay} />

      {showExportFeatures ? (
        <>
          <StudioRecordPopover
            disabled={recordingBlocked}
            isRecording={isRecording}
            onOpenChange={onRecordPopoverOpenChange}
            onStart={onStartRecording}
            onStop={onStopRecording}
            size="icon-sm"
            variant="ghost"
          />

          <StudioExportSvgButton
            disabled={controlsDisabled}
            onExport={onExportSvg}
            size="icon-sm"
            variant="ghost"
          />
        </>
      ) : null}

      {renderCodeSheet ? (
        renderCodeSheet(state)
      ) : (
        <StudioCodeSheetTrigger
          state={state}
          triggerClassName="font-mono text-xs"
          triggerSize="sm"
        />
      )}
    </>
  );
}
