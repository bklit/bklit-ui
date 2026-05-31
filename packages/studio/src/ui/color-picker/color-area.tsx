"use client";

import { cn } from "@bklitui/ui/lib/utils";
import {
  ColorArea as AriaColorArea,
  type ColorAreaProps,
} from "react-aria-components";
import { ColorThumb } from "@/ui/color-picker/color-thumb";

export function ColorArea({ className, ...props }: ColorAreaProps) {
  return (
    <AriaColorArea
      {...props}
      className={cn(
        "relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md ring-1 ring-border",
        "data-disabled:bg-muted forced-colors:bg-[GrayText]",
        className
      )}
      style={({ defaultStyle, isDisabled }) => ({
        ...defaultStyle,
        background: isDisabled ? undefined : defaultStyle.background,
      })}
    >
      <ColorThumb />
    </AriaColorArea>
  );
}
