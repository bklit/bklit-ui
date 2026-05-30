"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import {
  STUDIO_RECORDING_ASPECT_OPTIONS,
  STUDIO_RECORDING_FORMAT_OPTIONS,
  STUDIO_RECORDING_INTERACTION_OPTIONS,
  type StudioRecordingAspect,
  type StudioRecordingFormat,
  type StudioRecordingInteractionMs,
} from "@/lib/studio-recording";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

export function StudioRecordPopover({
  disabled,
  isRecording,
  onOpenChange,
  onStart,
  onStop,
}: {
  disabled?: boolean;
  isRecording: boolean;
  onOpenChange?: (open: boolean) => void;
  onStart: (
    interactionMs: StudioRecordingInteractionMs,
    aspect: StudioRecordingAspect,
    format: StudioRecordingFormat
  ) => void;
  onStop: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [interactionMs, setInteractionMs] =
    useState<StudioRecordingInteractionMs>(5000);
  const [aspect, setAspect] = useState<StudioRecordingAspect>("16:9");
  const [format, setFormat] = useState<StudioRecordingFormat>("webm");

  if (isRecording) {
    return (
      <Button
        aria-label="Stop recording"
        className="size-10"
        onClick={onStop}
        size="icon"
        title="Stop recording"
        type="button"
        variant="outline"
      >
        <span className="size-2.5 rounded-sm bg-destructive" />
      </Button>
    );
  }

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}
      open={open}
    >
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button
                aria-expanded={open}
                aria-label="Record animation"
                className="size-10"
                disabled={disabled}
                size="icon"
                type="button"
                variant="outline"
              />
            }
          >
            <VideoCameraIcon aria-hidden className="size-5" />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {disabled ? "Recording requires motion" : "Record"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className="w-72 p-4"
        side="bottom"
        sideOffset={8}
      >
        <p className="font-medium text-sm">Record chart</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          Resize to your chosen aspect, capture the enter animation, then
          interact live. Best in Chrome.
        </p>

        <div className="mt-4">
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

        <div className="mt-4">
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

        <div className="mt-4">
          <p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
            Export format
          </p>
          <RadioGroup
            className="flex flex-row items-center gap-4"
            onValueChange={(value) => setFormat(value as StudioRecordingFormat)}
            value={format}
          >
            {STUDIO_RECORDING_FORMAT_OPTIONS.map((opt) => (
              <div className="flex items-center gap-2" key={opt.value}>
                <RadioGroupItem
                  id={`studio-format-${opt.value}`}
                  value={opt.value}
                />
                <Label
                  className="cursor-pointer font-normal text-xs"
                  htmlFor={`studio-format-${opt.value}`}
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => {
            onStart(interactionMs, aspect, format);
            setOpen(false);
          }}
          type="button"
        >
          <VideoCameraIcon aria-hidden className="mr-2 size-4" />
          Start recording
        </Button>
      </PopoverContent>
    </Popover>
  );
}
