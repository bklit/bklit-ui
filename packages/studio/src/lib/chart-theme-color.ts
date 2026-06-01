import type { CSSProperties } from "react";
import {
  type ColorPresetId,
  presetStyle,
  presetSwatchColor,
} from "@/lib/color-presets";

const HEX6_RE = /^[0-9a-f]{6}$/i;
const OKLCH_RE = /^oklch\(/i;
const OKLCH_OPEN_WS_RE = /^oklch\(\s*/i;
const OKLCH_CLOSE_RE = /\)\s*$/;
const OKLCH_ALPHA_SUFFIX_RE = /\/\s*[\d.]+%?\s*$/;
const HEX6_PAIR_RE = /^(..)(..)(..)$/;
const CSS_VAR_RE = /var\((--[^,)]+)/;
const OKLCH_INLINE_OPACITY_RE = /\/\s*([\d.]+%?)\s*\)/;
const COLOR_MIX_RE =
  /^color-mix\(\s*in\s+[\w-]+\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i;
const OKLCH_COMPONENTS_RE = /^[\d.]+\s+[\d.]+\s+[\d.]+/;
const RGB_COLOR_RE = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/;
const SRGB_COLOR_RE = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
const LAB_COLOR_RE = /^lab\(/i;

export function stripOklchWrapper(value: string): string {
  return value.replace(OKLCH_RE, "").replace(OKLCH_CLOSE_RE, "");
}

export function stripOklchAlphaSuffix(body: string): string {
  return body.replace(OKLCH_ALPHA_SUFFIX_RE, "").trim();
}

export function isOklchColor(value: string) {
  return OKLCH_RE.test(value.trim());
}

export function isValidOklchColor(value: string) {
  const trimmed = value.trim();
  if (!OKLCH_RE.test(trimmed)) {
    return false;
  }
  const body = stripOklchWrapper(trimmed);
  const lch = stripOklchAlphaSuffix(body);
  return OKLCH_COMPONENTS_RE.test(lch);
}

export function parseColorMix(color: string): {
  base: string;
  opacity: number;
} | null {
  const match = color.trim().match(COLOR_MIX_RE);
  if (!(match?.[1] && match[2])) {
    return null;
  }
  return {
    base: match[1].trim(),
    opacity: Math.round(Number.parseFloat(match[2])),
  };
}

/** Unwrap erroneous oklch(...) around color-mix, hex, etc. */
export function unwrapStudioColorValue(color: string): string {
  const trimmed = color.trim();
  if (!OKLCH_RE.test(trimmed) || isValidOklchColor(trimmed)) {
    return trimmed;
  }
  return trimmed
    .replace(OKLCH_OPEN_WS_RE, "")
    .replace(OKLCH_CLOSE_RE, "")
    .trim();
}

export interface ResolvedStudioColor {
  parseable: string;
  opacity: number;
}

export function resolveStudioColorForPicker(
  color: string
): ResolvedStudioColor {
  const value = unwrapStudioColorValue(resolveCssColor(color.trim()));

  const mix = parseColorMix(value);
  if (mix) {
    const resolved = resolveStudioColorForPicker(mix.base);
    return { parseable: resolved.parseable, opacity: mix.opacity };
  }

  const opacity = parseOpacityFromColor(value);

  if (value.startsWith("#")) {
    return { parseable: value, opacity };
  }

  return { parseable: `#${cssColorToHex(value)}`, opacity };
}

function rgbComponentsToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function srgbChannelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.040_45
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function formatOklchComponent(value: number): string {
  return Number(value.toFixed(3)).toString();
}

export function srgbBytesToOklchBody(r: number, g: number, b: number): string {
  const red = srgbChannelToLinear(r);
  const green = srgbChannelToLinear(g);
  const blue = srgbChannelToLinear(b);

  const long =
    0.412_221_470_8 * red + 0.536_332_536_3 * green + 0.051_445_992_9 * blue;
  const medium =
    0.211_903_498_2 * red + 0.680_699_545_1 * green + 0.107_396_956_6 * blue;
  const short =
    0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue;

  const longRoot = Math.cbrt(long);
  const mediumRoot = Math.cbrt(medium);
  const shortRoot = Math.cbrt(short);

  const lightness =
    0.210_454_255_3 * longRoot +
    0.793_617_785 * mediumRoot -
    0.004_072_046_8 * shortRoot;
  const a =
    1.977_998_495_1 * longRoot -
    2.428_592_205 * mediumRoot +
    0.450_593_709_9 * shortRoot;
  const bLab =
    0.025_904_037_1 * longRoot +
    0.782_771_766_2 * mediumRoot -
    0.808_675_766 * shortRoot;

  const chroma = Math.sqrt(a * a + bLab * bLab);
  let hue = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (hue < 0) {
    hue += 360;
  }

  return `${formatOklchComponent(lightness)} ${formatOklchComponent(chroma)} ${formatOklchComponent(hue)}`;
}

function browserOklchFromCssColor(color: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const trimmed = color.trim();
  if (!trimmed || isValidOklchColor(trimmed)) {
    return trimmed || null;
  }

  const probe = document.createElement("span");
  probe.hidden = true;
  document.documentElement.appendChild(probe);

  try {
    if (LAB_COLOR_RE.test(trimmed) || trimmed.startsWith("rgb")) {
      probe.style.color = `oklch(from ${trimmed} l c h)`;
    } else {
      probe.style.color = trimmed;
    }

    const computed = getComputedStyle(probe).color.trim();
    return isValidOklchColor(computed) ? computed : null;
  } finally {
    probe.remove();
  }
}

function normalizeResolvedCssColor(color: string): string {
  return browserOklchFromCssColor(color) ?? color;
}

export function oklchBodyFromColor(color: string): string | null {
  const resolved = unwrapStudioColorValue(
    normalizeResolvedCssColor(resolveCssColor(color.trim()))
  );
  if (isValidOklchColor(resolved)) {
    return stripOklchAlphaSuffix(stripOklchWrapper(resolved));
  }

  const mix = parseColorMix(resolved);
  if (mix) {
    return oklchBodyFromColor(mix.base);
  }

  if (typeof document === "undefined") {
    return null;
  }

  const hex = cssColorToHex(resolved);
  const match = hex.match(HEX6_PAIR_RE);
  if (!(match?.[1] && match[2] && match[3])) {
    return null;
  }

  return srgbBytesToOklchBody(
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16)
  );
}

function cssColorToRgbBytes(color: string): [number, number, number] | null {
  if (typeof document === "undefined") {
    return null;
  }

  const probe = document.createElement("span");
  probe.hidden = true;
  document.documentElement.appendChild(probe);

  try {
    const source = normalizeResolvedCssColor(color);
    probe.style.color = source;
    let computed = getComputedStyle(probe).color.trim();

    if (isValidOklchColor(computed) || LAB_COLOR_RE.test(computed)) {
      probe.style.color = `color(from ${computed} srgb r g b)`;
      computed = getComputedStyle(probe).color.trim();
    }

    const rgbMatch = computed.match(RGB_COLOR_RE);
    if (rgbMatch?.[1] && rgbMatch[2] && rgbMatch[3]) {
      return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
    }

    const srgbMatch = computed.match(SRGB_COLOR_RE);
    if (srgbMatch?.[1] && srgbMatch[2] && srgbMatch[3]) {
      return [
        Math.round(Number(srgbMatch[1]) * 255),
        Math.round(Number(srgbMatch[2]) * 255),
        Math.round(Number(srgbMatch[3]) * 255),
      ];
    }

    return null;
  } finally {
    probe.remove();
  }
}

export function cssColorToHex(color: string): string {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (HEX6_RE.test(hex)) {
      return hex.toUpperCase();
    }
  }
  if (HEX6_RE.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (typeof document === "undefined") {
    return "000000";
  }

  const resolved = trimmed.includes("var(")
    ? resolveCssColor(trimmed)
    : trimmed;
  const bytes = cssColorToRgbBytes(resolved);
  if (!bytes) {
    return "000000";
  }

  return rgbComponentsToHex(bytes[0], bytes[1], bytes[2]);
}

export function resolveCssColor(color: string): string {
  if (typeof document === "undefined" || !color.includes("var(")) {
    return color;
  }

  const match = color.match(CSS_VAR_RE);
  if (!match?.[1]) {
    return color;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return normalizeResolvedCssColor(value || color);
}

export function getEffectiveChartAccent(
  preset: ColorPresetId,
  chartAccent: string
): string {
  if (chartAccent.trim()) {
    return chartAccent.trim();
  }
  return resolveCssColor(presetSwatchColor(preset));
}

export function resolveChartThemeStyle(
  preset: ColorPresetId,
  chartAccent: string
): CSSProperties {
  const accent = chartAccent.trim();
  return accent ? presetStyle(preset, accent) : presetStyle(preset);
}

export function parseOpacityFromColor(color: string): number {
  const mix = parseColorMix(color);
  if (mix) {
    return mix.opacity;
  }
  const match = color.match(OKLCH_INLINE_OPACITY_RE);
  if (!match?.[1]) {
    return 100;
  }
  const raw = match[1];
  if (raw.endsWith("%")) {
    return Math.round(Number.parseFloat(raw));
  }
  return Math.round(Number.parseFloat(raw) * 100);
}

export function applyOpacityToColor(color: string, opacity: number): string {
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  const trimmed = unwrapStudioColorValue(color.trim());
  const body = oklchBodyFromColor(trimmed);

  if (body) {
    return alpha >= 0.999 ? `oklch(${body})` : `oklch(${body} / ${alpha})`;
  }

  return `color-mix(in oklch, ${trimmed} ${Math.round(alpha * 100)}%, transparent)`;
}
