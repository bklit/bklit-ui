/**
 * Near-black chart surface for OG (Satori-safe hex).
 * Matches dark `--chart-background` / chart plot area in Studio.
 */
export const STUDIO_OG_SURFACE_HEX = "#121214";

/** Wrapper attribute for Puppeteer OG chart screenshots (includes 3D transform padding). */
export const STUDIO_OG_CAPTURE_ROOT_ATTR = "data-og-capture-root";

export const STUDIO_OG_CHART_PERSPECTIVE_PX = 1400;
export const STUDIO_OG_CHART_ROTATE_X_DEG = 15;
export const STUDIO_OG_CHART_ROTATE_Y_DEG = 15;
export const STUDIO_OG_CHART_ROTATE_Z_DEG = -25;

export const studioOgChartTransform = `rotateX(${STUDIO_OG_CHART_ROTATE_X_DEG}deg) rotateY(${STUDIO_OG_CHART_ROTATE_Y_DEG}deg) rotateZ(${STUDIO_OG_CHART_ROTATE_Z_DEG}deg)`;
