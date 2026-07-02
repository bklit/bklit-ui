"use client";

import { ColorControlField } from "@/components/controls/color-control-field";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { Label } from "@/ui/label";

export function TooltipDotColorPicker({
  state,
  onChange,
  onCommit,
  onPreview,
  label = "Color",
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
  onPreview?: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  label?: string;
}) {
  const mode = state.tooltipDotColorMode;
  const color = state.tooltipDotColor.trim() || "var(--chart-1)";

  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>{label}</Label>
      <StudioToggleGroup
        layout="segmented"
        onValueChange={(next) =>
          onChange(
            "tooltipDotColorMode",
            next as StudioUrlState["tooltipDotColorMode"]
          )
        }
        value={mode}
      >
        <StudioToggleGroupItem value="match">Match bar</StudioToggleGroupItem>
        <StudioToggleGroupItem value="custom">Custom</StudioToggleGroupItem>
      </StudioToggleGroup>
      {mode === "custom" ? (
        <ColorControlField
          color={color}
          keyName="tooltipDotColor"
          label=""
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
        />
      ) : null}
    </div>
  );
}
