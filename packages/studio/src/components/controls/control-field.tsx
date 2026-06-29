"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useState } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildProjectionScopedControlUpdate,
  getProjectionScopedControlValue,
  isPerProjectionControlKey,
} from "@/lib/studio-projection-props";
import {
  buildSeriesScopedControlUpdate,
  getSeriesScopedControlValue,
  isPerSeriesLineControlKey,
} from "@/lib/studio-series-line-props";
import type { StudioControl } from "@/lib/types";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { StudioSlider } from "@/ui/studio-slider";
import { YesNoSwitch } from "@/ui/yes-no-switch";
import {
  RingGapPreviewIcon,
  RingScalePreviewIcon,
  RingWidthPreviewIcon,
} from "../ring-preview-icons";
import { ChartStateToggle } from "./chart-state-toggle";
import { ColorControlField } from "./color-control-field";
import {
  ControlFieldLabel,
  isGroupLabeledControlType,
  StudioControlRow,
  studioControlInputClass,
  studioControlLabelClass,
  studioControlRowClass,
} from "./control-field-helpers";
import { ControlFieldInputs } from "./control-field-inputs";
import { GaugeAngleControl } from "./gauge-angle-control";
import { HeatmapLevelPaneControl } from "./heatmap-level-pane-control";
import { InnerRadiusControl } from "./inner-radius-control";
import { LegendPositionPicker } from "./legend-position-picker";
import { LineSeriesYAxisControl } from "./line-series-y-axis-control";
import {
  LineYAxisFormatLargeControl,
  LineYAxisNumTicksControl,
} from "./line-y-axis-settings-controls";
import { OpacityControl } from "./opacity-control";
import { PieEndAngleControl, PieStartAngleControl } from "./pie-angle-control";
import { ProjectionStrokeControl } from "./projection-stroke-control";
import { ReferenceAreaFillControl } from "./reference-area-fill-control";
import { ReferenceAreaYAxisControl } from "./reference-area-y-axis-control";
import { SliderInputGroup } from "./slider-input-group";

function numberControlPreviewIcon(
  preview: NonNullable<Extract<StudioControl, { type: "number" }>["preview"]>,
  min: number,
  max: number,
  local: number
) {
  switch (preview) {
    case "ringWidth":
      return <RingWidthPreviewIcon max={max} min={min} value={local} />;
    case "ringGap":
      return <RingGapPreviewIcon max={max} min={min} value={local} />;
    case "ringScale":
      return <RingScalePreviewIcon max={max} min={min} value={local} />;
    default:
      return null;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const CHART_STATE_KEYS = new Set<keyof StudioUrlState>([
  "areaChartState",
  "barChartState",
  "lineChartState",
  "heatmapChartState",
]);

function NumberInputOnly({
  control,
  value,
  onPreview,
  onCommit,
}: {
  control: Extract<StudioControl, { type: "number" }>;
  value: number;
  onPreview: (n: number) => void;
  onCommit: (n: number) => void;
}) {
  const step = control.step ?? 1;
  const safeValue = Number.isFinite(value) ? value : control.min;
  const [localValue, setLocalValue] = useState(safeValue);

  useEffect(() => {
    setLocalValue(Number.isFinite(value) ? value : control.min);
  }, [control.min, value]);

  return (
    <div className={studioControlRowClass}>
      <Label className={studioControlLabelClass} htmlFor={String(control.key)}>
        {control.label}
      </Label>
      <Input
        className={cn("min-w-0 flex-1 tabular-nums", studioControlInputClass)}
        id={String(control.key)}
        max={control.max}
        min={control.min}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) {
            const next = clamp(parsed, control.min, control.max);
            setLocalValue(next);
            onPreview(next);
            onCommit(next);
          }
        }}
        step={step}
        type="number"
        value={localValue}
      />
    </div>
  );
}

function LegendPositionControlField({
  state,
  onChange,
  onCommit,
  placementKey,
}: {
  state: StudioUrlState;
  placementKey: "legendPlacement" | "gaugeLabelPlacement";
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const alignKey =
    placementKey === "gaugeLabelPlacement" ? "gaugeLabelAlign" : "legendAlign";
  const commit = onCommit ?? onChange;
  return (
    <LegendPositionPicker
      align={state[alignKey]}
      onChange={(placement, align) => {
        commit(placementKey, placement);
        commit(alignKey, align);
      }}
      placement={state[placementKey]}
    />
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: discriminated union over many control types
export function ControlField({
  control,
  state,
  onChange,
  onPreview,
  onCommit,
  hideGroupLabel = false,
}: {
  control: StudioControl;
  state: StudioUrlState;
  hideGroupLabel?: boolean;
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
  if (control.type === "legendPosition") {
    return (
      <div className="space-y-2">
        {control.label ? <ControlFieldLabel control={control} /> : null}
        <LegendPositionControlField
          onChange={onChange}
          onCommit={onCommit}
          placementKey={control.key}
          state={state}
        />
      </div>
    );
  }

  const seriesIndex =
    "seriesIndex" in control && control.seriesIndex !== undefined
      ? control.seriesIndex
      : undefined;
  const projectionIndex =
    "projectionIndex" in control && control.projectionIndex !== undefined
      ? control.projectionIndex
      : undefined;

  const commitValue = (
    key: keyof StudioUrlState,
    nextValue: StudioUrlState[keyof StudioUrlState]
  ) => {
    if (
      projectionIndex !== undefined &&
      isPerProjectionControlKey(key) &&
      key === control.key
    ) {
      const updates = buildProjectionScopedControlUpdate(
        state,
        key,
        projectionIndex,
        nextValue
      );
      const commit = onCommit ?? onChange;
      for (const [updateKey, updateValue] of Object.entries(updates)) {
        commit(
          updateKey as keyof StudioUrlState,
          updateValue as StudioUrlState[keyof StudioUrlState]
        );
      }
      return;
    }
    if (
      seriesIndex !== undefined &&
      isPerSeriesLineControlKey(key) &&
      key === control.key
    ) {
      const updates = buildSeriesScopedControlUpdate(
        state,
        key,
        seriesIndex,
        nextValue
      );
      const commit = onCommit ?? onChange;
      for (const [updateKey, updateValue] of Object.entries(updates)) {
        commit(
          updateKey as keyof StudioUrlState,
          updateValue as StudioUrlState[keyof StudioUrlState]
        );
      }
      return;
    }
    (onCommit ?? onChange)(key, nextValue);
  };

  const previewValue = (
    key: keyof StudioUrlState,
    nextValue: StudioUrlState[keyof StudioUrlState]
  ) => {
    if (
      projectionIndex !== undefined &&
      isPerProjectionControlKey(key) &&
      key === control.key
    ) {
      const updates = buildProjectionScopedControlUpdate(
        state,
        key,
        projectionIndex,
        nextValue
      );
      const preview = onPreview ?? onChange;
      for (const [updateKey, updateValue] of Object.entries(updates)) {
        preview(
          updateKey as keyof StudioUrlState,
          updateValue as StudioUrlState[keyof StudioUrlState]
        );
      }
      return;
    }
    if (
      seriesIndex !== undefined &&
      isPerSeriesLineControlKey(key) &&
      key === control.key
    ) {
      const updates = buildSeriesScopedControlUpdate(
        state,
        key,
        seriesIndex,
        nextValue
      );
      const preview = onPreview ?? onChange;
      for (const [updateKey, updateValue] of Object.entries(updates)) {
        preview(
          updateKey as keyof StudioUrlState,
          updateValue as StudioUrlState[keyof StudioUrlState]
        );
      }
      return;
    }
    (onPreview ?? onChange)(key, nextValue);
  };

  const value = (() => {
    if (
      projectionIndex !== undefined &&
      "key" in control &&
      isPerProjectionControlKey(control.key)
    ) {
      return getProjectionScopedControlValue(
        state,
        control.key,
        projectionIndex
      );
    }
    if (
      seriesIndex !== undefined &&
      "key" in control &&
      isPerSeriesLineControlKey(control.key)
    ) {
      return getSeriesScopedControlValue(state, control.key, seriesIndex);
    }
    return state[control.key];
  })();

  if (control.type === "number") {
    const key = control.key;
    const disabled = control.disabledWhen
      ? Boolean(state[control.disabledWhen])
      : false;
    if (control.input === "number" && control.unit !== "%") {
      return (
        <NumberInputOnly
          control={control}
          onCommit={(n) => commitValue(key, n as StudioUrlState[typeof key])}
          onPreview={(n) => previewValue(key, n as StudioUrlState[typeof key])}
          value={value as number}
        />
      );
    }
    if (control.unit === "%" || control.input === "studio") {
      return (
        <StudioSlider
          disabled={disabled}
          label={control.label}
          max={control.max}
          min={control.min}
          onCommit={(n) => commitValue(key, n as StudioUrlState[typeof key])}
          onPreview={(n) => previewValue(key, n as StudioUrlState[typeof key])}
          step={control.step ?? 1}
          unit={control.unit}
          value={value as number}
        />
      );
    }
    const preview = control.preview;
    return (
      <SliderInputGroup
        disabled={disabled}
        format={control.format}
        label={control.label}
        max={control.max}
        min={control.min}
        onCommit={(n) => commitValue(key, n as StudioUrlState[typeof key])}
        onPreview={(n) => previewValue(key, n as StudioUrlState[typeof key])}
        renderIcon={
          preview
            ? (local) =>
                numberControlPreviewIcon(
                  preview,
                  control.min,
                  control.max,
                  local
                )
            : undefined
        }
        step={control.step ?? 1}
        unit={control.unit}
        value={value as number}
      />
    );
  }

  if (control.type === "color") {
    const key = control.key;
    const disabled = control.enabledWhen ? !state[control.enabledWhen] : false;
    return (
      <div
        className={cn(
          disabled && "pointer-events-none opacity-40 transition-opacity"
        )}
      >
        <ColorControlField
          color={String(value ?? "")}
          keyName={key}
          label={control.label}
          onChange={onChange}
          onColorChange={(nextColor) =>
            commitValue(key, nextColor as StudioUrlState[typeof key])
          }
          onColorPreview={(nextColor) =>
            previewValue(key, nextColor as StudioUrlState[typeof key])
          }
          onCommit={onCommit}
          onPreview={onPreview}
        />
      </div>
    );
  }

  if (control.type === "heatmapLevel") {
    return (
      <HeatmapLevelPaneControl
        level={control.level}
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />
    );
  }

  if (control.type === "opacity") {
    const key = control.key;
    return (
      <OpacityControl
        color={control.color}
        label={control.label}
        max={control.max}
        min={control.min}
        onCommit={(n) =>
          (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        onPreview={(n) =>
          (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        secondaryColor={control.secondaryColor}
        step={control.step ?? 0.05}
        value={value as number}
      />
    );
  }

  if (control.type === "innerRadius") {
    const key = control.key;
    return (
      <InnerRadiusControl
        label={control.label}
        max={control.max}
        min={control.min}
        onCommit={(n) =>
          (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        onPreview={(n) =>
          (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        step={control.step ?? 1}
        value={value as number}
      />
    );
  }

  if (control.type === "angle") {
    const key = control.key;
    if (control.variant === "pieStart") {
      return (
        <PieStartAngleControl
          label={control.label}
          max={control.max}
          min={control.min}
          onCommit={(n) =>
            (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
          }
          onPreview={(n) =>
            (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
          }
          value={value as number}
        />
      );
    }
    if (control.variant === "pieEnd") {
      return (
        <PieEndAngleControl
          label={control.label}
          max={control.max}
          min={control.min}
          onCommit={(n) =>
            (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
          }
          onPreview={(n) =>
            (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
          }
          startAngle={state.pieStartAngleDeg}
          value={value as number}
        />
      );
    }
    return (
      <GaugeAngleControl
        label={control.label}
        max={control.max}
        min={control.min}
        onCommit={(n) =>
          (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        onPreview={(n) =>
          (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        value={value as number}
      />
    );
  }

  if (control.type === "text") {
    return (
      <StudioControlRow htmlFor={String(control.key)} label={control.label}>
        <ControlFieldInputs
          control={control}
          onChange={(nextKey, nextValue) =>
            commitValue(
              nextKey,
              nextValue as StudioUrlState[keyof StudioUrlState]
            )
          }
          value={value}
        />
      </StudioControlRow>
    );
  }

  if (control.type === "referenceAreaFill") {
    return (
      <ReferenceAreaFillControl
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        state={state}
      />
    );
  }

  if (control.type === "projectionStroke") {
    return (
      <ProjectionStrokeControl
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        projectionIndex={projectionIndex}
        state={state}
      />
    );
  }

  if (control.type === "referenceAreaYAxis") {
    return (
      <ReferenceAreaYAxisControl
        label={control.label}
        onChange={onChange}
        onCommit={onCommit}
        state={state}
      />
    );
  }

  if (control.type === "lineSeriesYAxis") {
    return (
      <LineSeriesYAxisControl
        label={control.label}
        onChange={onChange}
        onCommit={onCommit}
        seriesIndex={control.seriesIndex}
        state={state}
      />
    );
  }

  if (control.type === "lineYAxisNumTicks") {
    return (
      <LineYAxisNumTicksControl
        axis={control.axis}
        label={control.label}
        onChange={onChange}
        onCommit={onCommit}
        state={state}
      />
    );
  }

  if (control.type === "lineYAxisFormatLarge") {
    return (
      <LineYAxisFormatLargeControl
        axis={control.axis}
        label={control.label}
        onChange={onChange}
        state={state}
      />
    );
  }

  if (control.type === "boolean") {
    const key = control.key;
    return (
      <StudioControlRow
        alignControl="end"
        htmlFor={String(key)}
        label={control.label}
      >
        <YesNoSwitch
          aria-label={control.label}
          onValueChange={(checked) => {
            commitValue(key, checked as StudioUrlState[typeof key]);
            if (
              key === "brushSelectionPatternEnabled" &&
              checked &&
              state.brushSelectionPattern === "none"
            ) {
              commitValue("brushSelectionPattern", "diagonal");
            }
          }}
          value={Boolean(value)}
        />
      </StudioControlRow>
    );
  }

  if (control.type === "pattern") {
    const disabled = control.enabledWhen ? !state[control.enabledWhen] : false;
    return (
      <div
        className={cn(
          "space-y-2",
          disabled && "pointer-events-none opacity-40 transition-opacity"
        )}
      >
        {hideGroupLabel ? null : <ControlFieldLabel control={control} />}
        <ControlFieldInputs
          control={control}
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }

  if (control.type === "curve") {
    return (
      <ControlFieldInputs
        control={control}
        onChange={(nextKey, nextValue) =>
          commitValue(
            nextKey,
            nextValue as StudioUrlState[keyof StudioUrlState]
          )
        }
        value={value}
      />
    );
  }

  if (isGroupLabeledControlType(control.type)) {
    return (
      <div className="space-y-2">
        {hideGroupLabel ? null : <ControlFieldLabel control={control} />}
        <ControlFieldInputs
          control={control}
          onChange={(nextKey, nextValue) =>
            commitValue(
              nextKey,
              nextValue as StudioUrlState[keyof StudioUrlState]
            )
          }
          value={value}
        />
      </div>
    );
  }

  if (control.type === "select" && CHART_STATE_KEYS.has(control.key)) {
    return (
      <div className="space-y-2">
        {hideGroupLabel ? null : <ControlFieldLabel control={control} />}
        <ChartStateToggle
          onChange={(next) =>
            commitValue(control.key, next as StudioUrlState[typeof control.key])
          }
          value={value as "ready" | "loading"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ControlFieldLabel control={control} />
      <ControlFieldInputs
        control={control}
        onChange={(nextKey, nextValue) =>
          commitValue(
            nextKey,
            nextValue as StudioUrlState[keyof StudioUrlState]
          )
        }
        value={value}
      />
    </div>
  );
}
