"use client";

import { IconToggleButton, IconToggleGroup } from "./icon-toggle-group";

export function PieHoverEffectPicker({
  value,
  onChange,
}: {
  value: "translate" | "grow" | "none";
  onChange: (v: "translate" | "grow" | "none") => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      <IconToggleButton
        icon="IconPieChart2"
        label="Translate"
        value="translate"
      />
      <IconToggleButton icon="IconGrowth" label="Grow" value="grow" />
      <IconToggleButton icon="IconPieChart3" label="None" value="none" />
    </IconToggleGroup>
  );
}
