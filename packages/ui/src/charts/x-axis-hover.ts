/** Pure label-reaction helpers for `XAxis` hover effects. */

/**
 * Label opacity while hovering: hidden under the date ticker (or when it shows
 * the same label), fading back in over `fadeBuffer` px beyond it.
 */
export function xAxisLabelOpacity(
  label: string,
  x: number,
  crosshairX: number | null,
  hoveredLabel: string | null,
  tickerHalfWidth: number
): number {
  if (crosshairX === null) {
    return 1;
  }
  const fadeBuffer = 20;
  const fadeRadius = tickerHalfWidth + fadeBuffer;
  const distance = Math.abs(x - crosshairX);
  if (distance < tickerHalfWidth) {
    return 0;
  }
  if (hoveredLabel && label === hoveredLabel) {
    return 0;
  }
  if (distance < fadeRadius) {
    return (distance - tickerHalfWidth) / fadeBuffer;
  }
  return 1;
}

/**
 * Highlight strength while hovering (`"highlight"` effect): `1` + `active`
 * for the hovered row's label, otherwise a linear falloff from `1` at the
 * crosshair to `0` at `radius` px. Rounded to whole percent so a pointer move
 * only re-renders labels whose color actually changes.
 */
export function xAxisLabelHighlight(
  label: string,
  x: number,
  crosshairX: number | null,
  hoveredLabel: string | null,
  radius: number
): { active: boolean; strength: number } {
  if (crosshairX === null) {
    return { active: false, strength: 0 };
  }
  if (hoveredLabel && label === hoveredLabel) {
    return { active: true, strength: 1 };
  }
  if (radius <= 0) {
    return { active: false, strength: 0 };
  }
  const distance = Math.abs(x - crosshairX);
  const strength = Math.max(0, 1 - distance / radius);
  return { active: false, strength: Math.round(strength * 100) / 100 };
}

/** CSS color for a highlight; `undefined` keeps the base label color. */
export function xAxisLabelColor(
  { active, strength }: ReturnType<typeof xAxisLabelHighlight>,
  activeColor: string,
  nearbyColor: string
): string | undefined {
  if (active) {
    return activeColor;
  }
  if (strength <= 0) {
    return undefined;
  }
  return `color-mix(in oklab, ${nearbyColor} ${Math.round(strength * 100)}%, var(--chart-label))`;
}
