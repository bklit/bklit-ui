"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";
import {
  HomeShowcaseChart,
  type HomeShowcaseId,
} from "@/components/home-components";
import { freezeMotionCss, nextFrame } from "@/components/og/chart-og-fit";
import {
  OgWordmark,
  stopCardLoops,
  TILE_CHROME,
  TILE_PADDING,
  TileChart,
  useWorldDataReady,
} from "@/components/og/chart-og-tile";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  CHART_OG_CARD_ATTR,
  CHART_OG_READY_ATTR,
  CHART_OG_SIZES,
  type ChartOgFormat,
} from "@/lib/chart-og";

/**
 * Homepage OG card: an effectively endless grid of small panels with the
 * homepage showcase charts, tilted back and twisted so it runs off toward the
 * far corner, muted by a fade, with the Bklit UI wordmark top-left.
 *
 * Dozens of live charts would be slow to capture, so each showcase chart
 * renders once, off-card on a flat plane where it can be fitted to the tile
 * size, and its finished markup is copied into every visible tile of that
 * chart. Tiles are placed on the tilted plane first; only those whose
 * projected box lands on the card get a copy.
 */

/**
 * Showcase charts in grid order. A tile at (col, row) shows
 * `HOME_CHARTS[(col + 3 * row) % 8]`: horizontal neighbours step by 1,
 * vertical by 3 and diagonal by 2 or 4, so no two neighbouring tiles match,
 * and wide charts (even indices) and round ones (odd) alternate like a
 * checkerboard.
 */
const HOME_CHARTS: { id: HomeShowcaseId; layout: ChartExamplePreviewLayout }[] =
  [
    { id: "line", layout: "time-series" },
    { id: "pie", layout: "compact" },
    { id: "bar", layout: "cartesian" },
    { id: "gauge", layout: "compact" },
    { id: "choropleth", layout: "wide" },
    { id: "radar", layout: "compact" },
    { id: "heatmap", layout: "heatmap" },
    { id: "ring", layout: "compact" },
  ];

function chartAt(col: number, row: number) {
  return (col + 3 * row) % HOME_CHARTS.length;
}

/** Tile layout size (px, before the plane's scale and perspective). */
const TILE = { width: 340, height: 230 };
const GAP = 20;
const TILE_INNER_HEIGHT = TILE.height - TILE_CHROME - TILE_PADDING * 2;
/** Tiles whose projected box covers less card area than this (px²) stay empty. */
const MIN_VISIBLE_AREA = 400;

const GEOMETRY = {
  wide: {
    cols: 16,
    rows: 14,
    /** Card point the plane's centre is pinned to. */
    anchor: { x: 600, y: 315 },
    perspective: 1400,
    transform: "rotateX(30deg) rotateY(-12deg) rotateZ(10deg) scale(0.5)",
    logo: { x: 56, y: 48, mark: 36, text: 40 },
  },
  square: {
    cols: 16,
    rows: 22,
    anchor: { x: 600, y: 600 },
    perspective: 1400,
    transform: "rotateX(30deg) rotateY(-12deg) rotateZ(10deg) scale(0.5)",
    logo: { x: 80, y: 72, mark: 48, text: 54 },
  },
} as const;

export function HomeOgCard({
  label,
  format = "wide",
}: {
  label: string;
  format?: ChartOgFormat;
}) {
  const geometry = GEOMETRY[format];
  const size = CHART_OG_SIZES[format];
  const dataReady = useWorldDataReady(true);
  const [mounted, setMounted] = useState(false);
  const [readySources, setReadySources] = useState(0);
  /** Finished markup per showcase chart, copied into the visible tiles. */
  const [markup, setMarkup] = useState<string[] | null>(null);
  const [visible, setVisible] = useState<Set<string> | null>(null);
  const [ready, setReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => setMounted(true), []);
  const onSourceReady = useCallback(() => setReadySources((n) => n + 1), []);

  // Every source fitted: copy its markup and find the tiles on the card.
  useEffect(() => {
    if (readySources < HOME_CHARTS.length || markup) {
      return;
    }
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const cardRect = card.getBoundingClientRect();
    const onCard = new Set<string>();
    for (const tile of card.querySelectorAll<HTMLElement>("[data-og-tile]")) {
      const rect = tile.getBoundingClientRect();
      const width =
        Math.min(rect.right, cardRect.right) -
        Math.max(rect.left, cardRect.left);
      const height =
        Math.min(rect.bottom, cardRect.bottom) -
        Math.max(rect.top, cardRect.top);
      if (width > 0 && height > 0 && width * height >= MIN_VISIBLE_AREA) {
        onCard.add(tile.dataset.ogTile as string);
      }
    }
    setVisible(onCard);
    setMarkup(sourceRefs.current.map((source) => source?.innerHTML ?? ""));
  }, [readySources, markup]);

  useEffect(() => {
    if (!markup) {
      return;
    }
    let cancelled = false;
    (async () => {
      await nextFrame();
      await nextFrame();
      if (!cancelled) {
        stopCardLoops();
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [markup]);

  const pitchX = TILE.width + GAP;
  const pitchY = TILE.height + GAP;
  const planeWidth = geometry.cols * pitchX;
  const planeHeight = geometry.rows * pitchY;
  const tileStyle = { width: TILE.width, height: TILE.height };

  const slots: { key: string; col: number; row: number }[] = [];
  for (let row = 0; row < geometry.rows; row++) {
    for (let col = 0; col < geometry.cols; col++) {
      slots.push({ key: `${col}-${row}`, col, row });
    }
  }

  return (
    <div
      aria-label={label}
      className="relative isolate overflow-hidden bg-sidebar text-foreground"
      ref={cardRef}
      role="img"
      {...{
        [CHART_OG_CARD_ATTR]: "",
        [CHART_OG_READY_ATTR]: ready ? "true" : "false",
      }}
      style={
        {
          width: size.width,
          height: size.height,
          "--og-stretch-height": `${TILE_INNER_HEIGHT}px`,
        } as CSSProperties
      }
    >
      <style>{freezeMotionCss}</style>

      {/* One flat, off-card render per showcase chart. */}
      {mounted && dataReady ? (
        <div
          aria-hidden
          className="absolute flex"
          style={{ left: size.width + 100, top: 0 }}
        >
          {HOME_CHARTS.map(({ id, layout }, index) => (
            <Frame key={id} style={tileStyle}>
              <FramePanel
                className="flex-1 overflow-hidden p-0"
                ref={(node) => {
                  sourceRefs.current[index] = node;
                }}
              >
                <TileChart layout={layout} onReady={onSourceReady}>
                  <HomeShowcaseChart id={id} />
                </TileChart>
              </FramePanel>
            </Frame>
          ))}
        </div>
      ) : null}

      {/* Tilted grid of tiles, muted. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: 0.9,
          filter: "saturate(0.5)",
          perspective: geometry.perspective,
          perspectiveOrigin: `${geometry.anchor.x}px ${geometry.anchor.y}px`,
        }}
      >
        <div
          className="absolute"
          style={{
            left: geometry.anchor.x - planeWidth / 2,
            top: geometry.anchor.y - planeHeight / 2,
            width: planeWidth,
            height: planeHeight,
            transform: geometry.transform,
          }}
        >
          {slots.map(({ key, col, row }) => {
            const html =
              markup && visible?.has(key) ? markup[chartAt(col, row)] : null;
            if (visible && !html) {
              return null;
            }
            return (
              <Frame
                className="absolute"
                data-og-tile={key}
                key={key}
                style={{ ...tileStyle, left: col * pitchX, top: row * pitchY }}
              >
                <FramePanel
                  className="flex-1 overflow-hidden p-0"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: our own rendered chart markup, copied from the off-card source
                  dangerouslySetInnerHTML={html ? { __html: html } : undefined}
                />
              </Frame>
            );
          })}
        </div>
      </div>

      {/* Muted toward the far corner and the edges. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 100% 120% at 15% 15%, transparent 35%, var(--color-sidebar) 100%), linear-gradient(to bottom right, transparent 35%, color-mix(in oklab, var(--color-sidebar) 70%, transparent) 100%)",
        }}
      />

      <OgWordmark {...geometry.logo} />
    </div>
  );
}
