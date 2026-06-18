"use client";

import { MotionEasePresetGrid } from "@/components/controls/motion-ease-preset-grid";
import { motionDurationToAnimationMs } from "@/lib/chart-animation";
import { motionEasePresetUpdates } from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { StudioSlider } from "@/ui/studio-slider";

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
      <StudioSlider
        label="Duration"
        max={2}
        min={0.2}
        onCommit={(v) => syncDuration(v, true)}
        onPreview={(v) => syncDuration(v, false)}
        step={0.1}
        unit="s"
        value={state.motionDuration}
      />

      <MotionEasePresetGrid
        label="Easing"
        onSelect={(id) => {
          const preset = motionEasePresetUpdates(id);
          onChange("motionType", "ease");
          onCommit("motionEase", preset.motionEase);
          onCommit("motionBezier", preset.motionBezier);
        }}
        value={state.motionEase}
      />

      <p className="text-[11px] text-muted-foreground leading-snug">
        Easing presets apply when charts support custom enter timing. Duration
        drives the clip reveal in the preview.
      </p>
    </div>
  );
}
