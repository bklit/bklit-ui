import type { CSSProperties } from "react";
import {
  type ColorPresetId,
  presetStyle,
  presetSwatchColor,
} from "@/lib/color-presets";
import {
  formatOklchComponent,
  isValidOklchBody,
  oklchBodyToHex,
  parseOklchBody,
  srgbBytesToOklchBody as srgbBytesToOklchBodyFromToolkit,
} from "@/lib/oklch-color";

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
const OKLCH_COMPONENTS_RE = /^[\d.]+\s+[\d.]+\s+[\d.]+/; // legacy; prefer isValidOklchBody
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
  return isValidOklchBody(lch) || OKLCH_COMPONENTS_RE.test(lch);
}

/** Whether a theme token row should use the OKLCH picker (not plain text). */
export function isThemeColorToken(name: string, value: string): boolean {
  return name !== "radius" && oklchBodyFromColor(value) !== null;
}

/** Normalize CSS / computed theme token values to oklch() for pickers and copy output. */
export function normalizeThemeTokenColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (isValidOklchColor(trimmed)) {
    return trimmed;
  }

  const mix = parseColorMix(trimmed);
  if (mix) {
    const base = normalizeThemeTokenColor(mix.base);
    if (isValidOklchColor(base)) {
      return applyOpacityToColor(base, mix.opacity);
    }
  }

  const body = oklchBodyFromColor(trimmed);
  if (!body) {
    return trimmed;
  }

  const opacity = parseOpacityFromColor(trimmed);
  return opacity < 100
    ? applyOpacityToColor(`oklch(${body})`, opacity)
    : `oklch(${body})`;
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

  if (isValidOklchColor(value)) {
    const body = stripOklchAlphaSuffix(stripOklchWrapper(value));
    const hex = oklchBodyToHex(body);
    if (hex) {
      return { parseable: `#${hex}`, opacity };
    }
  }

  const bodyOnly = parseOklchBody(value);
  if (bodyOnly) {
    const hex = oklchBodyToHex(`${bodyOnly.l} ${bodyOnly.c} ${bodyOnly.h}`);
    if (hex) {
      return { parseable: `#${hex}`, opacity };
    }
  }

  return { parseable: `#${cssColorToHex(value)}`, opacity };
}

function rgbComponentsToHex(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function srgbBytesToOklchBody(r: number, g: number, b: number): string {
  return srgbBytesToOklchBodyFromToolkit(r, g, b);
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
  const trimmed = color.trim();
  if (isValidOklchColor(trimmed)) {
    return stripOklchAlphaSuffix(stripOklchWrapper(trimmed));
  }

  const toolkitBody = parseOklchBody(stripOklchWrapper(trimmed));
  if (toolkitBody) {
    return `${formatOklchComponent(toolkitBody.l)} ${formatOklchComponent(toolkitBody.c)} ${formatOklchComponent(toolkitBody.h)}`;
  }

  const resolved = unwrapStudioColorValue(
    normalizeResolvedCssColor(resolveCssColor(trimmed))
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
