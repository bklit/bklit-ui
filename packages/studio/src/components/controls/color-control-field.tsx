"use client";

import { FillPicker } from "@/components/controls/fill-picker";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function ColorControlField({
  label,
  color,
  keyName,
  onChange,
  onColorChange,
  onColorPreview,
  onPreview,
  onCommit,
}: {
  label: string;
  color: string;
  keyName: keyof StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onColorChange?: (value: string) => void;
  onColorPreview?: (value: string) => void;
  onPreview?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const commit =
    onColorChange ??
    ((value: string) =>
      (onCommit ?? onChange)(keyName, value as StudioUrlState[typeof keyName]));
  const preview =
    onColorPreview ??
    ((value: string) =>
      (onPreview ?? onChange)(
        keyName,
        value as StudioUrlState[typeof keyName]
      ));

  return (
    <FillPicker
      color={color}
      fillMode="solid"
      label={label}
      onColorChange={commit}
      onColorPreview={preview}
      onFillModeChange={() => undefined}
      onPatternChange={() => undefined}
      pattern="none"
      supportsPattern={false}
    />
  );
}
