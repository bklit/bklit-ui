import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";
import {
  applyOpacityToColor,
  cssColorToHex,
  isValidOklchColor,
  resolveStudioColorForPicker,
  stripOklchAlphaSuffix,
  stripOklchWrapper,
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

export function pickerColorToStudioColor(
  color: Color,
  inputMode: "hex" | "oklch"
): string {
  const opacity = Math.round(color.getChannelValue("alpha") * 100);

  if (inputMode === "oklch") {
    try {
      const css = color.toString("css");
      if (opacity >= 100) {
        return css;
      }
      if (css.startsWith("oklch(")) {
        const body = stripOklchWrapper(css);
        const withoutAlpha = stripOklchAlphaSuffix(body);
        return `oklch(${withoutAlpha} / ${opacity / 100})`;
      }
      return applyOpacityToColor(css, opacity);
    } catch {
      // Fall through to hex when oklch conversion is unavailable.
    }
  }

  const hex = color.toString("hex");
  return applyOpacityToColor(hex.startsWith("#") ? hex : `#${hex}`, opacity);
}

export function studioColorToOklchField(color: string): string {
  if (isValidOklchColor(color)) {
    const body = stripOklchWrapper(color);
    return stripOklchAlphaSuffix(body);
  }

  try {
    const parsed = studioColorToPickerColor(color);
    const css = parsed.toString("css");
    if (css.startsWith("oklch(")) {
      return stripOklchWrapper(css);
    }
  } catch {
    // Fall through to hex display.
  }
  return cssColorToHex(color);
}

export function studioColorHexField(color: string): string {
  const { parseable } = resolveStudioColorForPicker(color);
  if (parseable.startsWith("#")) {
    return parseable.slice(1).toUpperCase();
  }
  return cssColorToHex(parseable);
}

export function studioColorUsesOklchInput(color: string): boolean {
  return isValidOklchColor(color);
}
