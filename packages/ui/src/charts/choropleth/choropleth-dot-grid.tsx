"use client";

import { m } from "motion/react";
import { memo, useCallback, useId, useMemo } from "react";
import { useMountProgress } from "../use-mount-progress";
import {
  CHOROPLETH_CAMERA_SCALE_VAR,
  useChoroplethCamera,
} from "./choropleth-camera";
import {
  type ChoroplethFeature,
  defaultChoroplethColors,
  useChoroplethInteraction,
  useChoroplethStable,
} from "./choropleth-context";

export type ChoroplethDotLattice = "hex" | "square";

export interface ChoroplethDotGridProps {
  /** Distance between dot centres in px. Default: 7 */
  gap?: number;
  /** Dot diameter as a fraction of `gap` (0–1). Default: 0.7 */
  dotSize?: number;
  /**
   * Dot diameter (fraction of `gap`) at the camera's max zoom — dots grow
   * smoothly toward it as you zoom in, on top of the zoom itself. Default: 0.9
   */
  zoomDotSize?: number;
  /** Fade the ocean dots out while the camera is focused on a region. Default: true */
  hideOceanOnFocus?: boolean;
  /** `hex` offsets every other row; `square` is a plain grid. Default: "hex" */
  lattice?: ChoroplethDotLattice;
  /** Draw the grid over oceans too, so the whole map is one dot field. Default: true */
  showOcean?: boolean;
  /** Ocean dot colour. Default: `var(--chart-scale-01)` */
  oceanColor?: string;
  /** Ocean dot opacity. Default: 0.55 */
  oceanOpacity?: number;
  /** Ocean dot size relative to land dots. Default: 0.55 */
  oceanDotScale?: number;
  /**
   * Fade the grid out toward the map's edges, as % of width/height per side.
   * `0` keeps hard edges. Default: 12
   */
  edgeFade?: number;
  /** Uniform dot colour (overrides `getFeatureColor`). */
  fill?: string;
  /** Per-region dot colour. */
  getFeatureColor?: (feature: ChoroplethFeature, index: number) => string;
  /** Opacity of other regions while one is hovered. Default: 0.4 */
  fadedOpacity?: number;
}

interface Dot {
  x: number;
  y: number;
  /** Feature index, or -1 for ocean. */
  feature: number;
}

/**
 * One lattice over the whole map. Each dot belongs to the region its centre
 * lands on (read from an index-coloured canvas) and is always drawn whole —
 * coastlines and borders never clip a dot.
 */
export function buildChoroplethLattice(
  featurePaths: readonly (string | null)[],
  width: number,
  height: number,
  gap: number,
  lattice: ChoroplethDotLattice
): Dot[] {
  if (typeof document === "undefined" || width < 1 || height < 1 || gap < 1) {
    return [];
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return [];
  }
  featurePaths.forEach((d, index) => {
    if (!d) {
      return;
    }
    const id = index + 1;
    ctx.fillStyle = `rgb(${id % 256},${Math.floor(id / 256) % 256},${Math.floor(id / 65_536)})`;
    ctx.fill(new Path2D(d));
  });
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const rowStep = lattice === "hex" ? gap * 0.866 : gap;
  const dots: Dot[] = [];
  let row = 0;
  for (let y = gap / 2; y < height; y += rowStep, row++) {
    const offset = lattice === "hex" && row % 2 === 1 ? gap / 2 : 0;
    for (let x = gap / 2 + offset; x < width; x += gap) {
      const id = regionIdAt(pixels, canvas.width, x, y);
      dots.push({
        x,
        y,
        feature: id > 0 && id <= featurePaths.length ? id - 1 : -1,
      });
    }
  }
  return dots;
}

/** Region id encoded in the hit canvas at (x, y); 0 = ocean. */
function regionIdAt(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  x: number,
  y: number
) {
  const p = (Math.floor(y) * canvasWidth + Math.floor(x)) * 4;
  // Unpremultiplied: an anti-aliased edge pixel still carries its id.
  if ((pixels[p + 3] ?? 0) === 0) {
    return 0;
  }
  return (
    (pixels[p] ?? 0) +
    (pixels[p + 1] ?? 0) * 256 +
    (pixels[p + 2] ?? 0) * 65_536
  );
}

/**
 * A dot is a zero-length segment drawn with a round cap, so its size is the
 * path's `stroke-width` — one CSS value that can follow the zoom live.
 */
function dot(x: number, y: number) {
  return `M${x} ${y}h0`;
}

function fadeStops(lengthPercent: number) {
  const edge = Math.min(45, Math.max(0, lengthPercent));
  return [
    { offset: "0%", opacity: 0 },
    { offset: `${edge}%`, opacity: 1 },
    { offset: `${100 - edge}%`, opacity: 1 },
    { offset: "100%", opacity: 0 },
  ];
}

export const ChoroplethDotGrid = memo(function ChoroplethDotGrid({
  gap = 7,
  dotSize = 0.7,
  zoomDotSize = 0.9,
  hideOceanOnFocus = true,
  lattice = "hex",
  showOcean = true,
  oceanColor = "var(--chart-scale-01)",
  oceanOpacity = 0.55,
  oceanDotScale = 0.55,
  edgeFade = 12,
  fill,
  getFeatureColor,
  fadedOpacity = 0.4,
}: ChoroplethDotGridProps) {
  const {
    features,
    featurePaths,
    width,
    height,
    enterTransition,
    revealEpoch,
  } = useChoroplethStable();
  const { hoveredFeatureIndex, setHoveredFeatureIndex, setTooltipData } =
    useChoroplethInteraction();
  const camera = useChoroplethCamera();
  const uid = useId().replace(/:/g, "");

  const dots = useMemo(
    () => buildChoroplethLattice(featurePaths, width, height, gap, lattice),
    [featurePaths, width, height, gap, lattice]
  );

  const layers = useMemo(() => {
    const byFeature = new Map<number, string[]>();
    const ocean: string[] = [];
    for (const { x, y, feature } of dots) {
      if (feature < 0) {
        ocean.push(dot(x, y));
        continue;
      }
      const list = byFeature.get(feature);
      if (list) {
        list.push(dot(x, y));
      } else {
        byFeature.set(feature, [dot(x, y)]);
      }
    }
    const regions = [...byFeature.entries()].map(([index, parts]) => {
      const feature = features[index];
      let color = fill;
      if (!color && feature && getFeatureColor) {
        color = getFeatureColor(feature, index);
      }
      color ??=
        defaultChoroplethColors[index % defaultChoroplethColors.length] ??
        "var(--chart-1)";
      return { index, d: parts.join(""), fill: color };
    });
    return { ocean: ocean.join(""), regions };
  }, [dots, features, fill, getFeatureColor]);

  const clampSize = (size: number) => Math.min(1, Math.max(0.05, size));
  const baseSize = clampSize(dotSize);
  const growth = clampSize(zoomDotSize) - baseSize;
  // 0 at the overview, 1 at the camera's max zoom; follows every frame.
  const zoomProgress = `min(1, max(0, (var(${CHOROPLETH_CAMERA_SCALE_VAR}, 1) - 1) / ${Math.max(0.01, camera.maxZoom - 1)}))`;
  const landStrokeWidth =
    growth === 0
      ? `${gap * baseSize}px`
      : `calc(${gap}px * (${baseSize} + ${growth} * ${zoomProgress}))`;
  const oceanStrokeWidth = `${gap * baseSize * oceanDotScale}px`;
  const oceanHidden = hideOceanOnFocus && camera.focusedKey !== null;

  const enterProgress = useMountProgress(
    enterTransition,
    0,
    `choropleth-dots-${revealEpoch}`
  );

  const handleEnter = useCallback(
    (index: number, event: React.MouseEvent<SVGPathElement>) => {
      const feature = features[index];
      if (!(feature && camera.isHoverable(`feature:${index}`))) {
        return;
      }
      const target = event.currentTarget as SVGGraphicsElement;
      const box = (target.ownerSVGElement ?? target).getBoundingClientRect();
      setHoveredFeatureIndex(index);
      setTooltipData({
        featureIndex: index,
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        feature,
      });
    },
    [camera, features, setHoveredFeatureIndex, setTooltipData]
  );

  const handleLeave = useCallback(() => {
    setHoveredFeatureIndex(null);
    setTooltipData(null);
  }, [setHoveredFeatureIndex, setTooltipData]);

  const focusedIndex = camera.focusedFeatureIndex;
  // Focused region first so a hovered neighbour draws on top of it.
  const lit = layers.regions
    .filter(
      (region) =>
        region.index === hoveredFeatureIndex || region.index === focusedIndex
    )
    .sort((a) => (a.index === hoveredFeatureIndex ? 1 : -1));
  const dimmed = hoveredFeatureIndex !== null;

  const maskId = `choropleth-dots-fade-${uid}`;
  const hGradient = `${maskId}-h`;
  const vGradient = `${maskId}-v`;
  const hMask = `${maskId}-hm`;
  const stops = fadeStops(edgeFade);

  return (
    <g className="choropleth-dot-grid">
      {edgeFade > 0 ? (
        <defs>
          <linearGradient id={hGradient} x1="0" x2="1" y1="0" y2="0">
            {stops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor="white"
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
          <linearGradient id={vGradient} x1="0" x2="0" y1="0" y2="1">
            {stops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor="white"
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
          <mask
            height={height}
            id={hMask}
            maskUnits="userSpaceOnUse"
            width={width}
            x={0}
            y={0}
          >
            <rect fill={`url(#${hGradient})`} height={height} width={width} />
          </mask>
          <mask
            height={height}
            id={maskId}
            maskUnits="userSpaceOnUse"
            width={width}
            x={0}
            y={0}
          >
            <g mask={`url(#${hMask})`}>
              <rect fill={`url(#${vGradient})`} height={height} width={width} />
            </g>
          </mask>
        </defs>
      ) : null}
      <m.g
        mask={edgeFade > 0 ? `url(#${maskId})` : undefined}
        pointerEvents="none"
        style={{ opacity: enterProgress }}
      >
        {showOcean && layers.ocean ? (
          <path
            d={layers.ocean}
            fill="none"
            stroke={oceanColor}
            strokeLinecap="round"
            style={{
              opacity: oceanHidden ? 0 : oceanOpacity,
              strokeWidth: oceanStrokeWidth,
              transition: "opacity 0.3s ease-out",
            }}
          />
        ) : null}
        <g
          fill="none"
          strokeLinecap="round"
          style={{ strokeWidth: landStrokeWidth }}
        >
          <g
            opacity={dimmed ? fadedOpacity : 1}
            style={{ transition: "opacity 0.18s ease-out" }}
          >
            {layers.regions.map((region) => (
              <path d={region.d} key={region.index} stroke={region.fill} />
            ))}
          </g>
          {dimmed
            ? lit.map((region) => (
                <path
                  d={region.d}
                  key={`lit-${region.index}`}
                  stroke={region.fill}
                />
              ))
            : null}
        </g>
      </m.g>
      {/* Invisible region shapes: hover + click targets for the dots above. */}
      <g fill="transparent">
        {featurePaths.map((d, index) =>
          d ? (
            // biome-ignore lint/a11y/noStaticElementInteractions: SVG path used as hover hitbox
            <path
              className="cursor-pointer"
              d={d}
              key={index}
              onClick={() => {
                if (camera.enabled && !camera.wasDrag()) {
                  camera.focusFeature(index);
                }
              }}
              onMouseEnter={(event) => handleEnter(index, event)}
              onMouseLeave={handleLeave}
            />
          ) : null
        )}
      </g>
    </g>
  );
});

ChoroplethDotGrid.displayName = "ChoroplethDotGrid";

export default ChoroplethDotGrid;
