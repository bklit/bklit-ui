"use client";

import { SliderInputGroup } from "@/components/controls/slider-input-group";
import { motionDurationToAnimationMs } from "@/lib/chart-animation";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function MotionStaggerControl({
  state,
  onPreview,
  onCommit,
}: {
  state: StudioUrlState;
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
      <SliderInputGroup
        label="Stagger"
        max={2}
        min={0.25}
        onCommit={(v) => onCommit("motionStaggerScale", v)}
        onPreview={(v) => onPreview("motionStaggerScale", v)}
        step={0.05}
        value={state.motionStaggerScale}
      />
    </div>
  );
}
