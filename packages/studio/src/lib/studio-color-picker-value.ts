import {
  oklchBodyFromColor,
  parseColorMix,
  parseOpacityFromColor,
} from "@/lib/chart-theme-color";
import {
  formatOklchBody,
  formatStudioOklch,
  type Oklch,
  oklchToSrgbBytes,
  parseOklchBody,
} from "@/lib/oklch-color";

/** Studio fill picker state in OKLCh (alpha 0–1). */
export interface OklchPickerState extends Oklch {
  alpha: number;
}

export const OKLCH_PICKER_CHROMA_MAX = 0.4;

export function clampPickerState(state: OklchPickerState): OklchPickerState {
  return {
    l: Math.min(1, Math.max(0, state.l)),
    c: Math.min(OKLCH_PICKER_CHROMA_MAX, Math.max(0, state.c)),
    h: ((state.h % 360) + 360) % 360,
    alpha: Math.min(1, Math.max(0, state.alpha)),
  };
}

export function studioColorToPickerState(color: string): OklchPickerState {
  const mix = parseColorMix(color);
  const base = mix ? mix.base : color;
  const alpha = (mix ? mix.opacity : parseOpacityFromColor(color)) / 100;
  const body = oklchBodyFromColor(base);
  const parsed = body ? parseOklchBody(body) : null;

  if (parsed) {
    return clampPickerState({ ...parsed, alpha });
  }

  return { l: 0.5, c: 0, h: 0, alpha };
}

export function pickerStateToStudioColor(state: OklchPickerState): string {
  const body = formatOklchBody({
    l: state.l,
    c: state.c,
    h: state.h,
  });
  return formatStudioOklch(body, state.alpha) ?? `oklch(${body})`;
}

export function studioColorToOklchField(color: string): string {
  return oklchBodyFromColor(color) ?? "";
}

export function pickerStatePreviewCss(state: OklchPickerState): string {
  const { r, g, b } = oklchToSrgbBytes(state.l, state.c, state.h);
  return state.alpha >= 0.999
    ? `rgb(${r} ${g} ${b})`
    : `rgba(${r} ${g} ${b} / ${state.alpha})`;
}

export function oklchFieldToPickerState(
  raw: string,
  current: OklchPickerState
): OklchPickerState | null {
  const parsed = parseOklchBody(raw.trim());
  if (!parsed) {
    return null;
  }
  return { ...parsed, alpha: current.alpha };
}

export function oklchFieldToStudioColor(
  raw: string,
  alpha: number
): string | null {
  const body = raw.trim();
  if (!body) {
    return "";
  }
  return formatStudioOklch(body, alpha);
}
