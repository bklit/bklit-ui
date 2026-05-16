"use client";

import { GridIcon } from "@hugeicons/core-free-icons";
import { IconToggleButton } from "./icon-toggle-group";

export function GraticuleToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <IconToggleButton
      className="w-full flex-none"
      icon={GridIcon}
      label="Show graticule"
      onClick={() => onChange(!value)}
      pressed={value}
    />
  );
}
