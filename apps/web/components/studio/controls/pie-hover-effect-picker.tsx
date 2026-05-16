"use client";

import {
  PieChart02Icon,
  PieChart03Icon,
  PieChart09Icon,
} from "@hugeicons/core-free-icons";
import { IconToggleButton, IconToggleGroup } from "./icon-toggle-group";

export function PieHoverEffectPicker({
  value,
  onChange,
}: {
  value: "translate" | "grow" | "none";
  onChange: (v: "translate" | "grow" | "none") => void;
}) {
  return (
    <IconToggleGroup>
      <IconToggleButton
        icon={PieChart02Icon}
        label="Translate"
        onClick={() => onChange("translate")}
        pressed={value === "translate"}
      />
      <IconToggleButton
        icon={PieChart09Icon}
        label="Grow"
        onClick={() => onChange("grow")}
        pressed={value === "grow"}
      />
      <IconToggleButton
        icon={PieChart03Icon}
        label="None"
        onClick={() => onChange("none")}
        pressed={value === "none"}
      />
    </IconToggleGroup>
  );
}
