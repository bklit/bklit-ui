"use client";

import { SquareIcon, SquareRoundCornerIcon } from "@hugeicons/core-free-icons";
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
      <IconToggleButton icon={SquareIcon} label="Butt cap" value="butt" />
      <IconToggleButton
        icon={SquareRoundCornerIcon}
        label="Round cap"
        value="round"
      />
    </IconToggleGroup>
  );
}
