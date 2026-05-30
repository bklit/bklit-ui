import type { VideoSample } from "mediabunny";

/** Full-range sRGB — matches browser UI color on typical displays. */
export const STUDIO_RECORDING_SRGB_COLOR_SPACE = {
  primaries: "bt709",
  transfer: "iec61966-2.1",
  matrix: "rgb",
  fullRange: true,
} as const;

type CanvasContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

function createSrgbCanvas(
  width: number,
  height: number
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getSrgbCanvasContext(
  canvas: OffscreenCanvas | HTMLCanvasElement
): CanvasContext | null {
  const context = canvas.getContext("2d", {
    alpha: false,
    colorSpace: "srgb",
  } as CanvasRenderingContext2DSettings);
  if (
    context instanceof CanvasRenderingContext2D ||
    (typeof OffscreenCanvasRenderingContext2D !== "undefined" &&
      context instanceof OffscreenCanvasRenderingContext2D)
  ) {
    return context;
  }
  return null;
}

/** Re-draw decoded frames in sRGB before H.264 encode to reduce color drift. */
export function drawVideoSampleToSrgbCanvas(
  sample: VideoSample
): OffscreenCanvas | HTMLCanvasElement {
  const width = sample.displayWidth;
  const height = sample.displayHeight;
  const canvas = createSrgbCanvas(width, height);
  const context = getSrgbCanvasContext(canvas);
  if (!context) {
    throw new Error("Failed to create sRGB canvas for recording transcode.");
  }
  sample.draw(context, 0, 0, width, height);
  return canvas;
}

export function readElementBackgroundColor(
  element: HTMLElement
): string | null {
  const bg = getComputedStyle(element).backgroundColor;
  if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
    return null;
  }
  return bg;
}
