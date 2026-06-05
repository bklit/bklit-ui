"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useState } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControl } from "@/lib/types";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  RingGapPreviewIcon,
  RingScalePreviewIcon,
  RingWidthPreviewIcon,
} from "../ring-preview-icons";
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
import { InnerRadiusControl } from "./inner-radius-control";
import { LegendPositionPicker } from "./legend-position-picker";
import { LineSeriesYAxisControl } from "./line-series-y-axis-control";
import {
  LineYAxisFormatLargeControl,
  LineYAxisNumTicksControl,
} from "./line-y-axis-settings-controls";
import { OpacityControl } from "./opacity-control";
import { PieEndAngleControl, PieStartAngleControl } from "./pie-angle-control";
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
        className={cn(
          "h-8 min-w-0 flex-1 tabular-nums",
          studioControlInputClass
        )}
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
}: {
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const commit = onCommit ?? onChange;
  return (
    <LegendPositionPicker
      align={state.legendAlign}
      onChange={(placement, align) => {
        commit("legendPlacement", placement);
        commit("legendAlign", align);
      }}
      placement={state.legendPlacement}
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
      <LegendPositionControlField
        onChange={onChange}
        onCommit={onCommit}
        state={state}
      />
    );
  }

  const value = state[control.key];

  if (control.type === "number") {
    const key = control.key;
    const disabled = control.disabledWhen
      ? Boolean(state[control.disabledWhen])
      : false;
    if (control.input === "number") {
      return (
        <NumberInputOnly
          control={control}
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
    const preview = control.preview;
    return (
      <SliderInputGroup
        disabled={disabled}
        format={control.format}
        label={control.label}
        max={control.max}
        min={control.min}
        onCommit={(n) =>
          (onCommit ?? onChange)(key, n as StudioUrlState[typeof key])
        }
        onPreview={(n) =>
          (onPreview ?? onChange)(key, n as StudioUrlState[typeof key])
        }
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
    return (
      <ColorControlField
        color={String(value ?? "")}
        keyName={key}
        label={control.label}
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
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
          onChange={onChange}
          value={value}
        />
      </StudioControlRow>
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
    return (
      <StudioControlRow
        alignControl="end"
        htmlFor={String(control.key)}
        label={control.label}
      >
        <ControlFieldInputs
          control={control}
          onChange={onChange}
          value={value}
        />
      </StudioControlRow>
    );
  }

  if (isGroupLabeledControlType(control.type)) {
    return (
      <div className="space-y-2">
        {hideGroupLabel ? null : <ControlFieldLabel control={control} />}
        <ControlFieldInputs
          control={control}
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ControlFieldLabel control={control} />
      <ControlFieldInputs control={control} onChange={onChange} value={value} />
    </div>
  );
}
