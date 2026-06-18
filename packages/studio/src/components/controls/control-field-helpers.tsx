"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { ReactNode } from "react";
import {
  studioControlRadiusClass,
  studioInputBackgroundClass,
  studioLabelClass,
} from "@/lib/studio-chrome-classes";
import type { StudioControl } from "@/lib/types";
import { Label } from "@/ui/label";

export const studioControlLabelClass = cn(
  studioLabelClass,
  "w-28 shrink-0 font-medium text-xs leading-tight"
);

/** Stacked label above a control (Fill, Presets, etc.) — same size as row labels. */
export const studioFieldLabelClass = cn(
  studioLabelClass,
  "font-medium text-xs leading-tight"
);

export const studioControlRowClass = "flex min-w-0 items-center gap-2.5";

/** Compact font size for sidebar inputs — overrides the Input default `text-sm`. */
export const studioControlInputClass = "text-xs";

/**
 * Borderless field row (scrub inputs, fill color row, text inputs).
 * Sidebar triggers use `Button variant="outline"`; option sets use shadcn `ToggleGroup`.
 */
export const studioInputSurfaceClass = cn(
  studioControlRadiusClass,
  studioInputBackgroundClass
);

const GROUP_LABELED_TYPES = new Set<StudioControl["type"]>([
  "pattern",
  "referenceAreaFill",
  "pieFill",
  "orientation",
  "lineCap",
  "pieHoverEffect",
  "funnelEdges",
  "graticuleToggle",
  "strokeStyle",
  "crosshairFade",
]);

export function StudioControlRow({
  label,
  htmlFor,
  children,
  alignControl = "stretch",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  /** `end` for switches; `stretch` for inputs and sliders */
  alignControl?: "stretch" | "end";
}) {
  return (
    <div className={studioControlRowClass}>
      <Label className={studioControlLabelClass} htmlFor={htmlFor}>
        {label}
      </Label>
      <div
        className={cn(
          "min-w-0 flex-1",
          alignControl === "end" && "flex justify-end"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ControlFieldLabel({ control }: { control: StudioControl }) {
  if (GROUP_LABELED_TYPES.has(control.type)) {
    return <Label className={studioFieldLabelClass}>{control.label}</Label>;
  }
  return (
    <Label className={studioControlLabelClass} htmlFor={String(control.key)}>
      {control.label}
    </Label>
  );
}

export function isGroupLabeledControlType(type: StudioControl["type"]) {
  return GROUP_LABELED_TYPES.has(type);
}
