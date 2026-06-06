import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Bundled TTFs avoid pnpm symlink tracing issues on Vercel Fluid compute. */
const OG_FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "og-fonts");

interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 400 | 700;
  style: "normal";
}

let cachedFonts: OgFont[] | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return Uint8Array.from(buffer).buffer;
}

export function loadStudioOgFonts(): OgFont[] {
  if (cachedFonts) {
    return cachedFonts;
  }

  cachedFonts = [
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(OG_FONTS_DIR, "Geist-Thin.ttf"))),
      weight: 100,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(
        readFileSync(join(OG_FONTS_DIR, "Geist-Regular.ttf"))
      ),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(OG_FONTS_DIR, "Geist-Bold.ttf"))),
      weight: 700,
      style: "normal",
    },
  ];

  return cachedFonts;
}
