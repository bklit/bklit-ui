import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ImageResponse } from "next/og";
import type { ChangelogEntry } from "@/lib/changelog";
import { formatChangelogDate } from "@/lib/changelog-format";
import { loadStudioOgFonts } from "@/lib/studio-og-fonts";
import {
  studioOgBackground,
  studioOgForeground,
  studioOgMutedForeground,
} from "@/lib/studio-og-theme";

const size = { width: 1200, height: 630 };

/** Light ink for the artwork — the dark-mode version of the cover. */
const ART_INK = "#d4d4d8";
const blackInkPattern = /#000(?:000)?\b/g;

/** First existing file — the app runs from `apps/web` or the repo root. */
function readFirst(paths: string[]): string | undefined {
  const file = paths.find((candidate) => existsSync(candidate));
  return file ? readFileSync(file, "utf8") : undefined;
}

/** A cover under `public/changelog/` (statically scoped for output tracing). */
function readCover(imagePath: string): string | undefined {
  const name = basename(imagePath);
  return readFirst([
    join(process.cwd(), "public/changelog", name),
    join(process.cwd(), "apps/web/public/changelog", name),
  ]);
}

function readLogo(): string | undefined {
  return readFirst([
    join(process.cwd(), "public/img/bklit-mark.svg"),
    join(process.cwd(), "apps/web/public/img/bklit-mark.svg"),
  ]);
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Cover SVGs are black-on-transparent masks; recolour them for the dark card. */
function darkArtwork(imagePath: string | undefined): string | undefined {
  const svg = imagePath ? readCover(imagePath) : undefined;
  return svg ? svgDataUri(svg.replace(blackInkPattern, ART_INK)) : undefined;
}

/** 1200×630 changelog card: dark artwork with the title over a fade. */
export function changelogOgImage({
  entry,
  title,
  eyebrow,
}: {
  /** Supplies the artwork (and date, unless `title` overrides the card). */
  entry: ChangelogEntry | undefined;
  title: string;
  eyebrow: string;
}) {
  const artwork = darkArtwork(entry?.image);
  const logo = readLogo();
  const date = entry && title === entry.title ? entry.date : undefined;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: studioOgBackground,
        fontFamily: "Geist",
      }}
    >
      {artwork ? (
        // biome-ignore lint/performance/noImgElement: satori renders plain img
        <img
          alt=""
          height={675}
          src={artwork}
          style={{ position: "absolute", top: -90, left: 0 }}
          width={1200}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(180deg, rgba(18, 18, 20, 0) 34%, ${studioOgBackground} 64%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: studioOgMutedForeground,
            fontSize: 26,
          }}
        >
          {logo ? (
            // biome-ignore lint/performance/noImgElement: satori renders plain img
            <img alt="" height={28} src={svgDataUri(logo)} width={18} />
          ) : null}
          <span>{eyebrow}</span>
          {date ? <span>· {formatChangelogDate(date)}</span> : null}
        </div>
        <div
          style={{
            color: studioOgForeground,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    { ...size, fonts: loadStudioOgFonts() }
  );
}
