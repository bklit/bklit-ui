export type ViewportPreset = "mobile" | "tablet" | "desktop";

export const VIEWPORT_PRESETS: Record<
  ViewportPreset,
  { label: string; width: number | null; height: number }
> = {
  mobile: { label: "Mobile", width: 375, height: 320 },
  tablet: { label: "Tablet", width: 768, height: 400 },
  desktop: { label: "Desktop", width: null, height: 400 },
};

export function resolveViewportSize(
  preset: ViewportPreset,
  maxWidth: number
): { width: number; height: number } {
  const config = VIEWPORT_PRESETS[preset];
  const width = config.width ?? Math.min(maxWidth, 960);
  return { width, height: config.height };
}
