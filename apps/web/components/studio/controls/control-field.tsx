"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";
import type { StudioControl } from "@/lib/studio/types";
import { ControlFieldLabel } from "./control-field-helpers";
import { ControlFieldInputs } from "./control-field-inputs";
import { GaugeAngleControl } from "./gauge-angle-control";
import { InnerRadiusControl } from "./inner-radius-control";
import { OpacityControl } from "./opacity-control";
import { PieEndAngleControl, PieStartAngleControl } from "./pie-angle-control";
import { SliderInputGroup } from "./slider-input-group";

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

  const display = control.format?.(localValue) ?? String(localValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs" htmlFor={String(control.key)}>
          {control.label}
        </Label>
        <span className="text-muted-foreground text-xs tabular-nums">
          {display}
        </span>
      </div>
      <Input
        className="h-8 tabular-nums"
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

export function ControlField({
  control,
  state,
  onChange,
  onPreview,
  onCommit,
}: {
  control: StudioControl;
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
  const value = state[control.key];

  if (control.type === "number") {
    const key = control.key;
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
    return (
      <SliderInputGroup
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
        step={control.step ?? 1}
        value={value as number}
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

  return (
    <div className="space-y-2">
      <ControlFieldLabel control={control} />
      <ControlFieldInputs control={control} onChange={onChange} value={value} />
    </div>
  );
}
