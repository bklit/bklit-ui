"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { CSSProperties } from "react";
import {
  ColorSlider as AriaColorSlider,
  type ColorSliderProps,
  SliderTrack,
} from "react-aria-components";
import {
  alphaSliderBackground,
  ColorThumb,
} from "@/ui/color-picker/color-thumb";

function sliderTrackBackground(
  isDisabled: boolean,
  isAlpha: boolean,
  defaultStyle: CSSProperties
) {
  if (isDisabled) {
    return undefined;
  }
  if (isAlpha) {
    return alphaSliderBackground(defaultStyle);
  }
  return defaultStyle.background;
}

export function ColorSlider({
  className,
  channel,
  ...props
}: ColorSliderProps) {
  const isAlpha = channel === "alpha";

  return (
    <AriaColorSlider
      {...props}
      channel={channel}
      className={cn("w-full", className)}
    >
      <SliderTrack
        className={cn(
          "relative h-3 w-full rounded-md ring-1 ring-border",
          "data-disabled:bg-muted"
        )}
        style={({ defaultStyle, isDisabled }) => ({
          ...defaultStyle,
          background: sliderTrackBackground(isDisabled, isAlpha, defaultStyle),
        })}
      >
        <ColorThumb className="size-3.5" />
      </SliderTrack>
    </AriaColorSlider>
  );
}
