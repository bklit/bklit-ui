"use client";

import { ShuffleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { PresetSelect } from "@/components/controls/preset-select";
import { StudioCodeSheetTrigger } from "@/components/studio-code-sheet-trigger";
import { StudioExportSvgButton } from "@/components/studio-export-svg-button";
import { StudioRecordPopover } from "@/components/studio-record-popover";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioRecordingAspect,
  StudioRecordingFormat,
  StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import { Button } from "@/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

export function StudioEditorMenuActions({
  displayState,
  state,
  controlsDisabled,
  recordingBlocked,
  isRecording,
  onScramble,
  onExportSvg,
  onRecordPopoverOpenChange,
  onStartRecording,
  onStopRecording,
  onPresetChange,
  renderCodeSheet,
}: {
  displayState: StudioUrlState;
  state: StudioUrlState;
  controlsDisabled: boolean;
  recordingBlocked: boolean;
  isRecording: boolean;
  onScramble: () => void;
  onExportSvg: () => void;
  onRecordPopoverOpenChange: (open: boolean) => void;
  onStartRecording: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStopRecording: () => void;
  onPresetChange: (value: StudioUrlState["preset"]) => void;
  renderCodeSheet?: (state: StudioUrlState) => ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button
            aria-label="Scramble data"
            className="size-8"
            disabled={controlsDisabled}
            onClick={onScramble}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon icon={ShuffleIcon} size={16} strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Scramble data</TooltipContent>
      </Tooltip>

      <StudioExportSvgButton
        disabled={controlsDisabled}
        onExport={onExportSvg}
      />

      <StudioRecordPopover
        disabled={recordingBlocked}
        isRecording={isRecording}
        onOpenChange={onRecordPopoverOpenChange}
        onStart={onStartRecording}
        onStop={onStopRecording}
      />

      <PresetSelect
        disabled={controlsDisabled}
        onChange={onPresetChange}
        value={displayState.preset}
      />

      {renderCodeSheet ? (
        renderCodeSheet(state)
      ) : (
        <StudioCodeSheetTrigger state={state} />
      )}
    </div>
  );
}
