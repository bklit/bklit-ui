"use client";

import { ColorControlField } from "@/components/controls/color-control-field";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  buildProjectionScopedControlUpdate,
  getProjectionScopedControlValue,
  isPerProjectionControlKey,
  type ProjectionStrokeStyle,
} from "@/lib/studio-projection-props";

export function ProjectionStrokeControl({
  state,
  projectionIndex,
  onChange,
  onPreview,
  onCommit,
}: {
  state: StudioUrlState;
  projectionIndex?: number;
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

  const readValue = <K extends keyof StudioUrlState>(key: K) => {
    if (projectionIndex !== undefined && isPerProjectionControlKey(key)) {
      return getProjectionScopedControlValue(state, key, projectionIndex);
    }
    return state[key];
  };

  const writeValue = <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K],
    mode: "commit" | "preview"
  ) => {
    const apply = mode === "commit" ? commit : preview;
    if (projectionIndex !== undefined && isPerProjectionControlKey(key)) {
      const updates = buildProjectionScopedControlUpdate(
        state,
        key,
        projectionIndex,
        value
      );
      for (const [updateKey, updateValue] of Object.entries(updates)) {
        apply(
          updateKey as keyof StudioUrlState,
          updateValue as StudioUrlState[keyof StudioUrlState]
        );
      }
      return;
    }
    apply(key, value);
  };

  const strokeStyle = readValue(
    "projectionStrokeStyle"
  ) as ProjectionStrokeStyle;

  return (
    <div className="space-y-3">
      <StudioToggleGroup
        layout="segmented"
        onValueChange={(value) =>
          writeValue(
            "projectionStrokeStyle",
            value as ProjectionStrokeStyle,
            "commit"
          )
        }
        value={strokeStyle}
      >
        <StudioToggleGroupItem value="solid">Solid</StudioToggleGroupItem>
        <StudioToggleGroupItem value="gradient">Gradient</StudioToggleGroupItem>
      </StudioToggleGroup>

      {strokeStyle === "solid" ? (
        <ColorControlField
          color={String(readValue("projectionStroke"))}
          keyName="projectionStroke"
          label=""
          onChange={(key, value) => writeValue(key, value, "commit")}
          onCommit={(key, value) => writeValue(key, value, "commit")}
          onPreview={(key, value) => writeValue(key, value, "preview")}
        />
      ) : (
        <>
          <ColorControlField
            color={String(readValue("projectionStrokeGradientStart"))}
            keyName="projectionStrokeGradientStart"
            label="Start"
            onChange={(key, value) => writeValue(key, value, "commit")}
            onCommit={(key, value) => writeValue(key, value, "commit")}
            onPreview={(key, value) => writeValue(key, value, "preview")}
          />
          <ColorControlField
            color={String(readValue("projectionStrokeGradientEnd"))}
            keyName="projectionStrokeGradientEnd"
            label="End"
            onChange={(key, value) => writeValue(key, value, "commit")}
            onCommit={(key, value) => writeValue(key, value, "commit")}
            onPreview={(key, value) => writeValue(key, value, "preview")}
          />
        </>
      )}
    </div>
  );
}
