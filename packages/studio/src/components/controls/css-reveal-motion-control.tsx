"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { SliderInputGroup } from "@/components/controls/slider-input-group";
import { motionDurationToAnimationMs } from "@/lib/chart-animation";
import { MOTION_EASE_IDS, MOTION_EASE_PRESETS } from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function CssRevealMotionControl({
  state,
  onChange,
  onPreview,
  onCommit,
}: {
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
}) {
  const syncDuration = (seconds: number, commit: boolean) => {
    const ms = motionDurationToAnimationMs(seconds);
    const apply = commit ? onCommit : onPreview;
    apply("motionDuration", seconds);
    apply("animationDuration", ms);
  };

  return (
    <div className="space-y-3">
      <SliderInputGroup
        label="Duration (s)"
        max={2}
        min={0.2}
        onCommit={(v) => syncDuration(v, true)}
        onPreview={(v) => syncDuration(v, false)}
        step={0.1}
        value={state.motionDuration}
      />

      <div className="space-y-2">
        <span className="font-medium text-muted-foreground text-xs">
          Easing
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {MOTION_EASE_IDS.filter((id) => id !== "custom").map((id) => (
            <button
              aria-pressed={state.motionEase === id}
              className={cn(
                "rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                state.motionEase === id
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              key={id}
              onClick={() => {
                onChange("motionType", "ease");
                onChange("motionEase", id);
                const b = MOTION_EASE_PRESETS[id].bezier;
                const bezier = `${b[0]}, ${b[1]}, ${b[2]}, ${b[3]}`;
                onChange("motionBezier", bezier);
                onCommit("motionBezier", bezier);
              }}
              type="button"
            >
              {MOTION_EASE_PRESETS[id].label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Easing presets apply when charts support custom enter timing. Duration
          drives the clip reveal in the preview.
        </p>
      </div>
    </div>
  );
}
