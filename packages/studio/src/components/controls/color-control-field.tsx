"use client";

import { FillPicker } from "@/components/controls/fill-picker";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function ColorControlField({
  label,
  color,
  keyName,
  onChange,
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

  return (
    <FillPicker
      color={color}
      fillMode="solid"
      label={label}
      onColorChange={(value) =>
        commit(keyName, value as StudioUrlState[typeof keyName])
      }
      onColorPreview={(value) =>
        preview(keyName, value as StudioUrlState[typeof keyName])
      }
      onFillModeChange={() => undefined}
      onPatternChange={() => undefined}
      pattern="none"
      supportsPattern={false}
    />
  );
}
