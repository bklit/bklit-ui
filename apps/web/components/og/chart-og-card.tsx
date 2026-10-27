"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type FeaturedChartExample,
  getChartPageExamples,
} from "@/components/charts/chart-examples";
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
import { cn } from "@/lib/utils";

/**
 * `/charts/[chart]` OG card: no text but the Bklit UI wordmark, just an
 * infinite-looking floor of homepage chart panels (the chart page's
 * examples) tilted away in 3D perspective, centred on the featured example,
 * with a vignette that fades the floor into the background toward the edges.
 *
 * The floor is a `cols × rows` grid of tiles (`tile` px each, before
 * perspective) inside a larger plane whose faint grid lines continue past
 * the tiles. The featured example's tile sits at `featured` (column, row) and
 * is pinned to `anchor` on the card: it is the transform origin, so it keeps
 * its size and position while everything else recedes. To keep capture fast,
 * only slots that land on the card (projected with the same transform) get a
 * tile, capped at `maxCharts` nearest the featured one; the rest of the plane
 * is grid lines.
 */
const GEOMETRY = {
  wide: {
    tile: { width: 420, height: 265 },
    gap: 24,
    cols: 5,
    rows: 5,
    featured: { col: 2, row: 4 },
    maxCharts: 12,
    /** Extra grid-line cells around the tiles: sides, far, near. */
    extraCells: { x: 4, far: 6, near: 2 },
    anchor: { x: 600, y: 460 },
    perspective: 900,
    perspectiveOrigin: { x: 600, y: 60 },
    rotateX: 40,
    rotateZ: 0,
    /** Radial vignette ellipse (card %) centred on the anchor. */
    vignette: { rx: 62, ry: 78 },
    /** Bklit wordmark, top-left: inset from the card edges, mark + text size. */
    logo: { x: 56, y: 48, mark: 36, text: 40 },
  },
  square: {
    tile: { width: 460, height: 290 },
    gap: 26,
    cols: 5,
    rows: 7,
    featured: { col: 2, row: 6 },
    maxCharts: 16,
    extraCells: { x: 4, far: 8, near: 2 },
    anchor: { x: 600, y: 920 },
    perspective: 900,
    perspectiveOrigin: { x: 600, y: 200 },
    rotateX: 40,
    rotateZ: 0,
    vignette: { rx: 64, ry: 74 },
    logo: { x: 80, y: 72, mark: 48, text: 54 },
  },
} as const;

type CardGeometry = (typeof GEOMETRY)[ChartOgFormat];

interface Tile {
  key: string;
  col: number;
  row: number;
  featured: boolean;
  example: FeaturedChartExample;
}

/**
 * Featured tile per chart page when the page's first example doesn't read
 * well as a card: the line hero's legend + brush overflow a tile, and the
 * patterned donut says more than the plain pie.
 */
const FEATURED_OVERRIDES: Partial<Record<string, string>> = {
  "line-chart": "Line Chart - Multiple Lines",
  "pie-chart": "Donut Chart - Patterns",
};

/** Examples that never tile well (interactive chrome that overflows a tile). */
const EXCLUDED_TITLES = new Set(["Line Chart - Trio with Brush"]);

/** Loading-state examples ("Area Chart - Loading (Sweep)") are skeletons, not charts. */
const LOADING_TITLE = / - Loading\b/;

/** The page's examples, featured first, without ones that don't tile. */
function ogExamples(slug: string): FeaturedChartExample[] {
  const examples = getChartPageExamples(slug).filter(
    (example) => !EXCLUDED_TITLES.has(example.title)
  );
  const override = FEATURED_OVERRIDES[slug];
  const index = override
    ? examples.findIndex((example) => example.title === override)
    : -1;
  if (index <= 0) {
    return examples;
  }
  const featured = examples[index] as FeaturedChartExample;
  return [featured, ...examples.filter((_, i) => i !== index)];
}

/** Tiles showing less than this much card area (px², before the vignette) get no chart. */
const MIN_VISIBLE_AREA = 28_000;

/**
 * On-card area (px²) of the slot's projected bounding box, using the same
 * transform as the plane: `rotateX(θ) rotateZ(φ)` about the featured tile's
 * centre (pinned to `anchor`), then `perspective` from `perspectiveOrigin`.
 */
function visibleArea(
  col: number,
  row: number,
  geometry: CardGeometry,
  size: { width: number; height: number }
): number {
  const pitchX = geometry.tile.width + geometry.gap;
  const pitchY = geometry.tile.height + geometry.gap;
  const theta = (geometry.rotateX * Math.PI) / 180;
  const phi = (geometry.rotateZ * Math.PI) / 180;
  const d = geometry.perspective;
  const { x: px, y: py } = geometry.perspectiveOrigin;
  const left = (col - geometry.featured.col - 0.5) * pitchX;
  const top = (row - geometry.featured.row - 0.5) * pitchY;
  const corners = [
    [left, top],
    [left + geometry.tile.width, top],
    [left, top + geometry.tile.height],
    [left + geometry.tile.width, top + geometry.tile.height],
  ] as const;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const [x, y] of corners) {
    const rx = x * Math.cos(phi) - y * Math.sin(phi);
    const ry = x * Math.sin(phi) + y * Math.cos(phi);
    const cardX = geometry.anchor.x + rx;
    const cardY = geometry.anchor.y + ry * Math.cos(theta);
    const z = ry * Math.sin(theta);
    const scale = d / (d - z);
    const sx = px + (cardX - px) * scale;
    const sy = py + (cardY - py) * scale;
    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx);
    maxY = Math.max(maxY, sy);
  }
  const width = Math.max(0, Math.min(maxX, size.width) - Math.max(minX, 0));
  const height = Math.max(0, Math.min(maxY, size.height) - Math.max(minY, 0));
  return width * height;
}

/**
 * Featured example at its slot; the other examples fill the visible slots
 * nearest to it (rows count a little less, they are foreshortened), cycling
 * when the page has fewer examples than slots. Capped at `maxCharts`.
 */
function layoutTiles(
  examples: FeaturedChartExample[],
  geometry: CardGeometry,
  size: { width: number; height: number }
): Tile[] {
  const [featured, ...rest] = examples;
  if (!featured) {
    return [];
  }
  const others = rest.filter((example) => !LOADING_TITLE.test(example.title));
  const fill = others.length > 0 ? others : [featured];
  const slots: { col: number; row: number; distance: number }[] = [];
  for (let row = 0; row < geometry.rows; row++) {
    for (let col = 0; col < geometry.cols; col++) {
      if (col === geometry.featured.col && row === geometry.featured.row) {
        continue;
      }
      if (visibleArea(col, row, geometry, size) < MIN_VISIBLE_AREA) {
        continue;
      }
      slots.push({
        col,
        row,
        distance:
          Math.abs(col - geometry.featured.col) +
          Math.abs(row - geometry.featured.row) * 0.8,
      });
    }
  }
  slots.sort((a, b) => a.distance - b.distance || a.row - b.row);
  const tiles: Tile[] = [
    {
      key: "featured",
      ...geometry.featured,
      featured: true,
      example: featured,
    },
  ];
  for (const [index, slot] of slots
    .slice(0, geometry.maxCharts - 1)
    .entries()) {
    tiles.push({
      key: `${slot.col}-${slot.row}`,
      col: slot.col,
      row: slot.row,
      featured: false,
      example: fill[index % fill.length] as FeaturedChartExample,
    });
  }
  return tiles;
}

export function ChartOgCard({
  slug,
  label,
  format = "wide",
}: {
  slug: string;
  label: string;
  format?: ChartOgFormat;
}) {
  const geometry = GEOMETRY[format];
  const size = CHART_OG_SIZES[format];
  const tiles = useMemo(
    () => layoutTiles(ogExamples(slug), geometry, size),
    [slug, geometry, size]
  );
  const dataReady = useWorldDataReady(slug === "choropleth-chart");
  const [mounted, setMounted] = useState(false);
  const [readyTiles, setReadyTiles] = useState(0);
  const [tilted, setTilted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setMounted(true), []);

  const showCharts = mounted && dataReady && tiles.length > 0;
  const onTileReady = useCallback(() => setReadyTiles((n) => n + 1), []);

  // Tiles are fitted on the flat plane (fit measuring reads client rects),
  // then the plane tilts into perspective.
  useEffect(() => {
    if (!showCharts || readyTiles < tiles.length) {
      return;
    }
    let cancelled = false;
    setTilted(true);
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
  }, [showCharts, readyTiles, tiles.length]);

  const pitchX = geometry.tile.width + geometry.gap;
  const pitchY = geometry.tile.height + geometry.gap;
  const { extraCells } = geometry;
  const planeWidth = (geometry.cols + extraCells.x * 2) * pitchX;
  const planeHeight =
    (geometry.rows + extraCells.far + extraCells.near) * pitchY;
  // Featured tile centre in plane px: the transform origin, pinned to anchor.
  const originX = (extraCells.x + geometry.featured.col + 0.5) * pitchX;
  const originY = (extraCells.far + geometry.featured.row + 0.5) * pitchY;
  const anchorPct = {
    x: (geometry.anchor.x / size.width) * 100,
    y: (geometry.anchor.y / size.height) * 100,
  };
  const tileInnerHeight = geometry.tile.height - TILE_CHROME - TILE_PADDING * 2;

  return (
    <div
      aria-label={label}
      className="relative isolate overflow-hidden bg-sidebar text-foreground"
      role="img"
      {...{
        [CHART_OG_CARD_ATTR]: "",
        [CHART_OG_READY_ATTR]: ready ? "true" : "false",
      }}
      style={
        {
          width: size.width,
          height: size.height,
          "--og-stretch-height": `${tileInnerHeight}px`,
        } as CSSProperties
      }
    >
      <style>{freezeMotionCss}</style>

      {/* Perspective floor. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          perspective: geometry.perspective,
          perspectiveOrigin: `${geometry.perspectiveOrigin.x}px ${geometry.perspectiveOrigin.y}px`,
        }}
      >
        <div
          className="absolute"
          style={{
            left: geometry.anchor.x - originX,
            top: geometry.anchor.y - originY,
            width: planeWidth,
            height: planeHeight,
            transformOrigin: `${originX}px ${originY}px`,
            transform: tilted
              ? `rotateX(${geometry.rotateX}deg) rotateZ(${geometry.rotateZ}deg)`
              : undefined,
            // Grid lines run through the middle of the gaps between tiles.
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: `${pitchX}px ${pitchY}px`,
            backgroundPosition: `${-geometry.gap / 2}px ${-geometry.gap / 2}px`,
          }}
        >
          {showCharts
            ? tiles.map((tile) => (
                <Frame
                  className={cn(
                    "absolute",
                    tile.featured &&
                      "shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] ring-1 ring-foreground/12"
                  )}
                  key={tile.key}
                  style={{
                    left: (extraCells.x + tile.col) * pitchX,
                    top: (extraCells.far + tile.row) * pitchY,
                    width: geometry.tile.width,
                    height: geometry.tile.height,
                  }}
                >
                  <FramePanel className="flex-1 overflow-hidden p-0">
                    <TileChart
                      layout={tile.example.previewLayout}
                      onReady={onTileReady}
                    >
                      {tile.example.render()}
                    </TileChart>
                  </FramePanel>
                </Frame>
              ))
            : null}
        </div>
      </div>

      {/* Vignette: the floor fades to the background toward the edges. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse ${geometry.vignette.rx}% ${geometry.vignette.ry}% at ${anchorPct.x}% ${anchorPct.y}%, transparent 40%, var(--color-sidebar) 100%)`,
        }}
      />

      <OgWordmark {...geometry.logo} />
    </div>
  );
}
