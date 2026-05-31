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
const OKLCH_CLOSE_SIMPLE_RE = /\)$/;
const OKLCH_ALPHA_SUFFIX_RE = /\/\s*[\d.]+%?\s*$/;
const CSS_VAR_RE = /var\((--[^,)]+)/;
const OKLCH_INLINE_OPACITY_RE = /\/\s*([\d.]+%?)\s*\)/;
const COLOR_MIX_RE =
  /^color-mix\(\s*in\s+[\w-]+\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i;
const OKLCH_COMPONENTS_RE = /^[\d.]+\s+[\d.]+\s+[\d.]+/;

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
  const normalized = normalizeColorInput(value);

  if (normalized?.startsWith("#")) {
    return { parseable: normalized, opacity };
  }

  if (normalized && isValidOklchColor(normalized)) {
    return { parseable: `#${cssColorToHex(normalized)}`, opacity };
  }

  return { parseable: `#${cssColorToHex(value)}`, opacity };
}

export function normalizeColorInput(raw: string): string | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }
  if (isOklchColor(value)) {
    return isValidOklchColor(value) ? value : null;
  }
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    return HEX6_RE.test(hex) ? `#${hex.toLowerCase()}` : null;
  }
  if (HEX6_RE.test(value)) {
    return `#${value.toLowerCase()}`;
  }
  return null;
}

export function cssColorToHex(color: string): string {
  if (typeof document === "undefined") {
    return "000000";
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "000000";
  }
  ctx.fillStyle = color;
  const normalized = ctx.fillStyle;
  if (typeof normalized === "string" && normalized.startsWith("#")) {
    return normalized.slice(1).toUpperCase();
  }
  return "000000";
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
  return value || color;
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
  if (isValidOklchColor(trimmed)) {
    const body = stripOklchWrapper(trimmed).replace(OKLCH_CLOSE_SIMPLE_RE, "");
    const withoutAlpha = stripOklchAlphaSuffix(body);
    return `oklch(${withoutAlpha} / ${alpha})`;
  }
  const hex = normalizeColorInput(trimmed);
  if (!hex) {
    return trimmed;
  }
  return `color-mix(in oklch, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
}
