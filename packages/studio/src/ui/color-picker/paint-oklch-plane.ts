import { oklchToSrgbBytes } from "@/lib/oklch-color";
import { OKLCH_PICKER_CHROMA_MAX } from "@/lib/studio-color-picker-value";

/** Paint an OKLCh chroma × lightness plane at a fixed hue into a 2D canvas context. */
export function paintOklchColorPlane(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hue: number
): void {
  if (width <= 0 || height <= 0) {
    return;
  }

  const imageData = ctx.createImageData(width, height);
  const { data } = imageData;
  const widthMax = Math.max(1, width - 1);
  const heightMax = Math.max(1, height - 1);

  for (let y = 0; y < height; y++) {
    const l = 1 - y / heightMax;
    for (let x = 0; x < width; x++) {
      const c = (x / widthMax) * OKLCH_PICKER_CHROMA_MAX;
      const { r, g, b } = oklchToSrgbBytes(l, c, hue);
      const offset = (y * width + x) * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
