const CHECKERBOARD =
  "repeating-conic-gradient(var(--border) 0% 25%, var(--background) 0% 50%) 50% / 10px 10px";

/** Hue ramp with one stop per 10° so thumb position matches hue value. */
export function oklchHueTrackBackground(): string {
  const stops = Array.from({ length: 37 }, (_, index) => {
    const hue = (index / 36) * 360;
    return `oklch(0.65 0.2 ${hue.toFixed(1)}) ${((index / 36) * 100).toFixed(3)}%`;
  });
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

export function oklchAlphaTrackBackground(
  l: number,
  c: number,
  h: number
): string {
  const color = `oklch(${l} ${c} ${h})`;
  return `linear-gradient(to right, oklch(${l} ${c} ${h} / 0), ${color}), ${CHECKERBOARD}`;
}
