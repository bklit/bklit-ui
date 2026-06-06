"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  StudioTab,
  StudioTabs,
} from "@/components/controls/studio-toggle-group";
import { StudioControlGroup } from "@/components/studio-control-group";
import {
  STUDIO_RECORDING_ASPECT_OPTIONS,
  STUDIO_RECORDING_FORMAT_OPTIONS,
  STUDIO_RECORDING_INTERACTION_OPTIONS,
  type StudioRecordingAspect,
  type StudioRecordingFormat,
  type StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import { supportsStudioExportFeatures } from "@/lib/studio-runtime";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

type ExportMode = "svg" | "recording";

export function EditorExportSection({
  controlsDisabled = false,
  recordingBlocked = false,
  isRecording = false,
  onExportSvg,
  onStartRecording,
  onStopRecording,
}: {
  controlsDisabled?: boolean;
  recordingBlocked?: boolean;
  isRecording?: boolean;
  onExportSvg: () => void;
  onStartRecording: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStopRecording: () => void;
}) {
  const [mode, setMode] = useState<ExportMode>("svg");
  const [interactionMs, setInteractionMs] =
    useState<StudioRecordingInteractionMs>(5000);
  const [aspect, setAspect] = useState<StudioRecordingAspect>("16:9");
  const [format, setFormat] = useState<StudioRecordingFormat>("webm");

  if (!supportsStudioExportFeatures()) {
    return null;
  }

  return (
    <StudioControlGroup
      className="shrink-0 border-border/60 border-t px-3 pb-3"
      collapsible
      defaultOpen
      title="Export"
    >
      {isRecording ? (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            Recording in progress…
          </p>
          <Button
            className="w-full"
            onClick={onStopRecording}
            type="button"
            variant="destructive"
          >
            <span className="mr-2 size-2 rounded-sm bg-current" />
            Stop recording
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <StudioTabs
            layout="segmented"
            onValueChange={(value) => setMode(value as ExportMode)}
            value={mode}
          >
            <StudioTab value="svg">SVG</StudioTab>
            <StudioTab value="recording">Recording</StudioTab>
          </StudioTabs>

          {mode === "recording" ? (
            <>
              <div>
                <p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                  Aspect ratio
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STUDIO_RECORDING_ASPECT_OPTIONS.map((opt) => {
                    const selected = aspect === opt.value;
                    return (
                      <button
                        className={cn(
                          "rounded-md border px-2 py-2 text-left text-xs transition-colors",
                          selected
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        key={opt.value}
                        onClick={() => setAspect(opt.value)}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                  Interaction time
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STUDIO_RECORDING_INTERACTION_OPTIONS.map((opt) => {
                    const selected = interactionMs === opt.value;
                    return (
                      <button
                        className={cn(
                          "rounded-md border px-2 py-2 text-left text-xs transition-colors",
                          selected
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        key={opt.value}
                        onClick={() => setInteractionMs(opt.value)}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                  Export format
                </p>
                <RadioGroup
                  className="flex flex-row items-center gap-4"
                  onValueChange={(value) =>
                    setFormat(value as StudioRecordingFormat)
                  }
                  value={format}
                >
                  {STUDIO_RECORDING_FORMAT_OPTIONS.map((opt) => (
                    <div className="flex items-center gap-2" key={opt.value}>
                      <RadioGroupItem
                        id={`studio-export-format-${opt.value}`}
                        value={opt.value}
                      />
                      <Label
                        className="cursor-pointer font-normal text-xs"
                        htmlFor={`studio-export-format-${opt.value}`}
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          ) : null}

          <Button
            className="w-full"
            disabled={
              controlsDisabled || (mode === "recording" && recordingBlocked)
            }
            onClick={() => {
              if (mode === "svg") {
                onExportSvg();
                return;
              }
              onStartRecording(interactionMs, aspect, format);
            }}
            type="button"
          >
            {mode === "svg" ? (
              <>
                <HugeiconsIcon
                  className="mr-2"
                  icon={Download01Icon}
                  size={16}
                  strokeWidth={1.5}
                />
                Export SVG
              </>
            ) : (
              <>
                <VideoCameraIcon aria-hidden className="mr-2 size-4" />
                Start recording
              </>
            )}
          </Button>
        </div>
      )}
    </StudioControlGroup>
  );
}
