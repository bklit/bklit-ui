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
      className="h-11 w-full min-w-0 flex-none px-0 sm:h-11 sm:min-w-0"
      onPressedChange={onChange}
      pressed={value}
      variant="outline"
    >
      <Icon className="size-5" name="IconCanvasGrid" />
    </Toggle>
  );
}
