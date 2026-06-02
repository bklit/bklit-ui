"use client";

import { GridIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      variant="studio"
    >
      <HugeiconsIcon className="size-5" icon={GridIcon} strokeWidth={1.75} />
    </Toggle>
  );
}
