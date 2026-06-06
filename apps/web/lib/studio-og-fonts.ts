import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Satori (@vercel/og) requires TTF/OTF — woff2 throws "Unsupported OpenType signature wOF2". */
const GEIST_SANS_DIR = join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-sans"
);

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
      data: toArrayBuffer(readFileSync(join(GEIST_SANS_DIR, "Geist-Thin.ttf"))),
      weight: 100,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(
        readFileSync(join(GEIST_SANS_DIR, "Geist-Regular.ttf"))
      ),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(GEIST_SANS_DIR, "Geist-Bold.ttf"))),
      weight: 700,
      style: "normal",
    },
  ];

  return cachedFonts;
}
