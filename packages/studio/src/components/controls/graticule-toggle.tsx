"use client";

import { Icon } from "@bklitui/icons";
import { Toggle } from "@/ui/toggle";

export function GraticuleToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Toggle
      aria-label="Show graticule"
      className="h-11 w-full flex-none"
      onPressedChange={onChange}
      pressed={value}
      size="icon"
      variant="outline"
    >
      <Icon className="size-5" name="IconCanvasGrid" />
    </Toggle>
  );
}
