import {
  type GeoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
  geoGraticule,
  geoMercator,
  geoPath,
} from "d3-geo";
import type { MultiLineString } from "geojson";

/** What the choropleth reads from its projection (visx `<Mercator>` render props). */
export interface ChoroplethMercator {
  path: GeoPath<unknown, GeoPermissibleObjects>;
  projection: GeoProjection;
}

export interface ChoroplethMercatorConfig {
  scale?: number;
  translate?: [number, number];
  center?: [number, number];
}

/**
 * d3 equivalent of visx `<Mercator scale translate center>`: visx applied
 * each option only when truthy, in this order (so `scale={0}` keeps d3's
 * default scale).
 */
export function createChoroplethMercator({
  scale,
  translate,
  center,
}: ChoroplethMercatorConfig): ChoroplethMercator {
  const projection = geoMercator();
  if (scale) {
    projection.scale(scale);
  }
  if (translate) {
    projection.translate(translate);
  }
  if (center) {
    projection.center(center);
  }
  return { path: geoPath(projection), projection };
}

/** One SVG path string per feature (null when the geometry draws nothing). */
export function projectFeaturePaths(
  mercator: ChoroplethMercator,
  features: readonly GeoPermissibleObjects[]
): (string | null)[] {
  return features.map((feature) => mercator.path(feature) ?? null);
}

/**
 * Graticule path as visx `<Graticule graticule={...} step={step}>` drew it:
 * the full `geoGraticule()` MultiLineString (minor `step`, default 10°, plus
 * the major lines) through the projection's path, `""` when empty.
 */
export function graticulePath(
  path: (object: MultiLineString) => string | null | undefined,
  step?: [number, number]
): string {
  const graticule = geoGraticule();
  if (step) {
    graticule.step(step);
  }
  return path(graticule()) || "";
}
