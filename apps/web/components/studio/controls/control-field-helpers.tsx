"use client";

import { Label } from "@/components/ui/label";
import type { StudioControl } from "@/lib/studio/types";

const GROUP_LABELED_TYPES = new Set<StudioControl["type"]>([
  "pattern",
  "curve",
  "pieFill",
  "orientation",
  "lineCap",
  "pieHoverEffect",
  "funnelEdges",
  "graticuleToggle",
]);

export function ControlFieldLabel({ control }: { control: StudioControl }) {
  if (GROUP_LABELED_TYPES.has(control.type)) {
    return <Label className="text-xs">{control.label}</Label>;
  }
  return (
    <Label className="text-xs" htmlFor={String(control.key)}>
      {control.label}
    </Label>
  );
}
