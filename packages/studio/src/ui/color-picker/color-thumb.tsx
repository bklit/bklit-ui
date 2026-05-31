"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { CSSProperties } from "react";
import {
  ColorThumb as AriaColorThumb,
  type ColorThumbProps,
} from "react-aria-components";

const CHECKERBOARD =
  "repeating-conic-gradient(var(--border) 0% 25%, var(--background) 0% 50%) 50% / 10px 10px";

export function ColorThumb({ className, ...props }: ColorThumbProps) {
  return (
    <AriaColorThumb
      {...props}
      className={cn(
        "top-1/2 left-1/2 box-border size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
        "data-dragging:size-4.5 data-focus-visible:ring-2 data-focus-visible:ring-ring data-focus-visible:ring-offset-1",
        "data-disabled:border-muted data-disabled:bg-muted",
        className
      )}
      style={({ defaultStyle, isDisabled }) => ({
        ...defaultStyle,
        backgroundColor: isDisabled ? undefined : defaultStyle.backgroundColor,
      })}
    />
  );
}

export function alphaSliderBackground(defaultStyle: CSSProperties) {
  return `${defaultStyle.background}, ${CHECKERBOARD}`;
}
