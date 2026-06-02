"use client";

import { MotionEasePresetGrid } from "@/components/controls/motion-ease-preset-grid";
import { SliderInputGroup } from "@/components/controls/slider-input-group";
import {
  StudioTab,
  StudioTabs,
} from "@/components/controls/studio-toggle-group";
import { motionDurationToAnimationMs } from "@/lib/chart-animation";
import { MOTION_EASE_PRESETS, type MotionType } from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";

const MOTION_TYPE_LABELS: Record<MotionType, string> = {
  ease: "Ease",
  spring: "Spring",
};

import { MotionCurveEditor } from "./motion-curve-editor";

function MotionTypeToggle({
  value,
  onChange,
}: {
  value: MotionType;
  onChange: (v: MotionType) => void;
}) {
  return (
    <StudioTabs layout="segmented" onValueChange={onChange} value={value}>
      {(["ease", "spring"] as const).map((type) => (
        <StudioTab key={type} value={type}>
          {MOTION_TYPE_LABELS[type]}
        </StudioTab>
      ))}
    </StudioTabs>
  );
}

export function MotionControl({
  state,
  showStaggerScale = false,
  onChange,
  onPreview,
  onCommit,
  onMotionCurveDragActiveChange,
}: {
  state: StudioUrlState;
  /** Stagger multiplier for charts with sequenced enter (gauge, radar, funnel). */
  showStaggerScale?: boolean;
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
}) {
  const syncDuration = (seconds: number, commit: boolean) => {
    const ms = motionDurationToAnimationMs(seconds);
    const apply = commit ? onCommit : onPreview;
    apply("motionDuration", seconds);
    apply("animationDuration", ms);
  };
  const motionSlice = {
    motionType: state.motionType,
    motionDuration: state.motionDuration,
    motionBounce: state.motionBounce,
    motionEase: state.motionEase,
    motionBezier: state.motionBezier,
  };

  return (
    <div className="flex flex-col gap-4">
      <MotionTypeToggle
        onChange={(v) => onChange("motionType", v)}
        value={state.motionType}
      />

      <MotionCurveEditor
        onCommit={onCommit}
        onDragActiveChange={onMotionCurveDragActiveChange}
        onPreview={onPreview}
        state={motionSlice}
      />

      <div className="flex flex-col gap-3">
        <SliderInputGroup
          label="Duration"
          max={2}
          min={0.2}
          onCommit={(v) => syncDuration(v, true)}
          onPreview={(v) => syncDuration(v, false)}
          step={0.1}
          unit="s"
          value={state.motionDuration}
        />

        {showStaggerScale ? (
          <SliderInputGroup
            label="Stagger"
            max={2}
            min={0.25}
            onCommit={(v) => onCommit("motionStaggerScale", v)}
            onPreview={(v) => onPreview("motionStaggerScale", v)}
            step={0.05}
            value={state.motionStaggerScale}
          />
        ) : null}

        {state.motionType === "spring" ? (
          <SliderInputGroup
            label="Bounce"
            max={1}
            min={0}
            onCommit={(v) => onCommit("motionBounce", v)}
            onPreview={(v) => onPreview("motionBounce", v)}
            step={0.05}
            value={state.motionBounce}
          />
        ) : (
          <MotionEasePresetGrid
            onSelect={(id) => {
              onChange("motionEase", id);
              const b = MOTION_EASE_PRESETS[id].bezier;
              onChange("motionBezier", `${b[0]}, ${b[1]}, ${b[2]}, ${b[3]}`);
            }}
            value={state.motionEase}
          />
        )}
      </div>
    </div>
  );
}
