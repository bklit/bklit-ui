import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";
import {
  cssColorToHex,
  oklchBodyFromColor,
  resolveStudioColorForPicker,
  srgbBytesToOklchBody,
} from "@/lib/chart-theme-color";

export function studioColorToPickerColor(color: string): Color {
  const { parseable, opacity } = resolveStudioColorForPicker(color);
  let parsed: Color;
  try {
    parsed = parseColor(parseable);
  } catch {
    parsed = parseColor(`#${cssColorToHex(color)}`);
  }

  if (opacity >= 99.5) {
    return parsed;
  }

  return parsed.withChannelValue("alpha", opacity / 100);
}

export function pickerColorToStudioColor(color: Color): string {
  const opacity = Math.round(color.getChannelValue("alpha") * 100);
  const alpha = opacity / 100;
  const body = srgbBytesToOklchBody(
    color.getChannelValue("red"),
    color.getChannelValue("green"),
    color.getChannelValue("blue")
  );

  return alpha >= 0.999 ? `oklch(${body})` : `oklch(${body} / ${alpha})`;
}

export function studioColorToOklchField(color: string): string {
  return oklchBodyFromColor(color) ?? "";
}
