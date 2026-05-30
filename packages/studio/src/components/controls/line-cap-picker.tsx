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
    <IconToggleGroup>
      <IconToggleButton
        icon={SquareIcon}
        label="Butt cap"
        onClick={() => onChange("butt")}
        pressed={value === "butt"}
      />
      <IconToggleButton
        icon={SquareRoundCornerIcon}
        label="Round cap"
        onClick={() => onChange("round")}
        pressed={value === "round"}
      />
    </IconToggleGroup>
  );
}
