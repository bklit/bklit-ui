import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Bundled TTFs avoid pnpm symlink tracing issues on Vercel Fluid compute. */
const OG_FONTS_DIR_CANDIDATES = [
  join(process.cwd(), "lib/og-fonts"),
  join(process.cwd(), "apps/web/lib/og-fonts"),
];

function resolveOgFontsDir(): string {
  for (const dir of OG_FONTS_DIR_CANDIDATES) {
    if (existsSync(join(dir, "Geist-Regular.ttf"))) {
      return dir;
    }
  }
  throw new Error("Studio OG fonts not found in deployment bundle");
}

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

  const ogFontsDir = resolveOgFontsDir();

  cachedFonts = [
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(ogFontsDir, "Geist-Thin.ttf"))),
      weight: 100,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(ogFontsDir, "Geist-Regular.ttf"))),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist",
      data: toArrayBuffer(readFileSync(join(ogFontsDir, "Geist-Bold.ttf"))),
      weight: 700,
      style: "normal",
    },
  ];

  return cachedFonts;
}
