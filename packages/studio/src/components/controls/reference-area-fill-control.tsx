"use client";

import { useEffect, useRef } from "react";
import { ColorControlField } from "@/components/controls/color-control-field";
import { ControlField } from "@/components/controls/control-field";
import { OpacityControl } from "@/components/controls/opacity-control";
import { PatternPicker } from "@/components/controls/pattern-picker";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { referenceAreaPatternDetailControls } from "@/lib/pattern-control-groups";
import { isStudioControlVisible } from "@/lib/pattern-control-visibility";
import type { PatternPresetId } from "@/lib/pattern-presets";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { SeriesFillMode } from "@/lib/studio-series-design";
import type { StudioControl } from "@/lib/types";

const FADE_EDGES_CONTROL: StudioControl = {
  type: "boolean",
  key: "referenceAreaFadeEdges",
  label: "Fade edges",
};

const FADE_SIZE_CONTROL: StudioControl = {
  type: "number",
  key: "referenceAreaFadeEdgesLength",
  label: "Fade size",
  min: 0,
  max: 45,
  step: 1,
  unit: "%",
  visibleWhen: { key: "referenceAreaFadeEdges", truthy: true },
};

export function ReferenceAreaFillControl({
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
  onPreview?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const commit = onCommit ?? onChange;
  const preview = onPreview ?? onChange;
  const lastPatternRef = useRef<PatternPresetId>("diagonal");

  useEffect(() => {
    if (state.referenceAreaPattern !== "none") {
      lastPatternRef.current = state.referenceAreaPattern;
    }
  }, [state.referenceAreaPattern]);

  const fillMode: SeriesFillMode =
    state.referenceAreaPattern === "none" ? "solid" : "pattern";

  const handleFillModeChange = (mode: SeriesFillMode) => {
    if (mode === "solid") {
      if (state.referenceAreaPattern !== "none") {
        lastPatternRef.current = state.referenceAreaPattern;
      }
      commit("referenceAreaPattern", "none");
      return;
    }

    const nextPattern =
      state.referenceAreaPattern === "none"
        ? lastPatternRef.current
        : state.referenceAreaPattern;
    commit("referenceAreaPattern", nextPattern);
  };

  const handlePatternChange = (pattern: PatternPresetId) => {
    if (pattern === "none") {
      handleFillModeChange("solid");
      return;
    }
    lastPatternRef.current = pattern;
    commit("referenceAreaPattern", pattern);
  };

  const patternPickerValue =
    state.referenceAreaPattern === "none"
      ? lastPatternRef.current
      : state.referenceAreaPattern;

  const patternDetails = referenceAreaPatternDetailControls()
    .filter((control) => control.key !== "referenceAreaFillOpacity")
    .filter((control) => isStudioControlVisible(control, state));

  return (
    <div className="space-y-3">
      <OpacityControl
        color="var(--chart-foreground-muted)"
        label="Opacity"
        max={1}
        min={0.1}
        onCommit={(value) => commit("referenceAreaFillOpacity", value)}
        onPreview={(value) => preview("referenceAreaFillOpacity", value)}
        step={0.05}
        value={state.referenceAreaFillOpacity}
      />

      <ControlField
        control={FADE_EDGES_CONTROL}
        hideGroupLabel
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />

      {isStudioControlVisible(FADE_SIZE_CONTROL, state) ? (
        <ControlField
          control={FADE_SIZE_CONTROL}
          hideGroupLabel
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
          state={state}
        />
      ) : null}

      <StudioToggleGroup
        layout="segmented"
        onValueChange={handleFillModeChange}
        value={fillMode}
      >
        <StudioToggleGroupItem value="solid">Solid</StudioToggleGroupItem>
        <StudioToggleGroupItem value="pattern">Pattern</StudioToggleGroupItem>
      </StudioToggleGroup>

      {fillMode === "solid" ? (
        <ColorControlField
          color={state.referenceAreaFill}
          keyName="referenceAreaFill"
          label=""
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
        />
      ) : (
        <>
          <PatternPicker
            onChange={handlePatternChange}
            value={patternPickerValue}
          />
          {patternDetails.map((control) => (
            <ControlField
              control={control}
              hideGroupLabel
              key={control.key}
              onChange={onChange}
              onCommit={onCommit}
              onPreview={onPreview}
              state={state}
            />
          ))}
        </>
      )}
    </div>
  );
}
