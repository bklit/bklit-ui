"use client";

import { IconToggleButton, IconToggleGroup } from "./icon-toggle-group";

export function LineCapPicker({
  value,
  onChange,
}: {
  value: "round" | "butt";
  onChange: (v: "round" | "butt") => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      <IconToggleButton icon="IconFormSquare" label="Butt cap" value="butt" />
      <IconToggleButton
        icon="IconCornerRadius"
        label="Round cap"
        value="round"
      />
    </IconToggleGroup>
  );
}
