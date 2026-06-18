"use client";

import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";

export function ChartStateToggle({
  value,
  onChange,
}: {
  value: "ready" | "loading";
  onChange: (value: "ready" | "loading") => void;
}) {
  return (
    <StudioToggleGroup
      layout="segmented"
      onValueChange={onChange}
      value={value}
    >
      <StudioToggleGroupItem value="ready">Ready</StudioToggleGroupItem>
      <StudioToggleGroupItem value="loading">Loading</StudioToggleGroupItem>
    </StudioToggleGroup>
  );
}
