// Parity guard for the @visx/geo -> d3-geo migration of the choropleth. Every
// country path, projected point and the graticule must match what visx
// <Mercator> / <Graticule> produced. Uses the same world data as the demos.
// Delete this file together with the @visx/geo dependency.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { Graticule, Mercator } from "@visx/geo";
import { geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  type ChoroplethStableContextValue,
  ChoroplethStableProvider,
} from "../choropleth/choropleth-context";
import { ChoroplethGraticule } from "../choropleth/choropleth-graticule";
import {
  createChoroplethMercator,
  projectFeaturePaths,
} from "../choropleth/choropleth-projection";

const topology = JSON.parse(
  readFileSync(
    // Tests run from packages/ui (scripts/run-tests.mjs sets the cwd).
    join(process.cwd(), "../../apps/web/lib/og-data/world-countries.json"),
    "utf8"
  )
) as Topology<{ countries: GeometryCollection }>;
const world = feature(
  topology,
  topology.objects.countries
) as unknown as FeatureCollection<Geometry>;

interface VisxMercator {
  path: (geo: unknown) => string | null;
  projection: (coords: [number, number]) => [number, number] | null;
}

/** Run visx <Mercator> (and its <Projection>) and return its render props. */
function visxMercator(props: {
  scale: number;
  translate: [number, number];
  center: [number, number];
}): VisxMercator {
  const children = (mercator: VisxMercator) =>
    mercator as unknown as ReactElement;
  const projectionElement = (
    Mercator as unknown as (p: object) => {
      type: (p: object) => { props: { children: VisxMercator } };
      props: object;
    }
  )({ ...props, data: world.features, children });
  return projectionElement.type(projectionElement.props).props.children;
}

/** ChoroplethChart's defaults for a width x height chart with no margin. */
function chartConfig(width: number, height: number) {
  return {
    scale: (width / 630) * 100,
    translate: [width / 2, height / 2 + 50] as [number, number],
    center: [0, 20] as [number, number],
  };
}

const configs = [
  { name: "default 800 x 450", ...chartConfig(800, 450) },
  { name: "default 375 x 211 (mobile)", ...chartConfig(375, 211) },
  {
    name: "custom scale / translate / center",
    scale: 420,
    translate: [312.5, 180.25] as [number, number],
    center: [12.5, 51] as [number, number],
  },
  {
    name: "scale 0 keeps the d3 default",
    scale: 0,
    translate: [400, 275] as [number, number],
    center: [0, 20] as [number, number],
  },
];

describe("choropleth projection matches visx <Mercator>", () => {
  it("covers the world data", () => {
    assert.ok(world.features.length > 150);
  });

  for (const config of configs) {
    it(`${config.name}: feature paths and projected centroids`, () => {
      const visx = visxMercator(config);
      const bklit = createChoroplethMercator(config);
      assert.deepStrictEqual(
        projectFeaturePaths(bklit, world.features),
        world.features.map((f) => visx.path(f) ?? null)
      );
      const centroids = world.features.map(
        (f) => geoCentroid(f as Feature) as [number, number]
      );
      assert.deepStrictEqual(
        centroids.map((c) => bklit.projection(c)),
        centroids.map((c) => visx.projection(c))
      );
    });
  }
});

function graticuleMarkup(
  visxPath: (geo: unknown) => string | null,
  bklitPath: (geo: unknown) => string | null,
  step?: [number, number]
): { visx: string; bklit: string } {
  const visx = renderToStaticMarkup(
    createElement(Graticule, {
      graticule: (g: unknown) => visxPath(g) || "",
      step,
      stroke: "rgba(255,255,255,0.1)",
      strokeWidth: 0.5,
    })
  );
  const bklit = renderToStaticMarkup(
    createElement(ChoroplethStableProvider, {
      value: {
        rawPathGenerator: bklitPath,
      } as unknown as ChoroplethStableContextValue,
      children: createElement(ChoroplethGraticule, { step }),
    })
  );
  return { visx, bklit };
}

describe("ChoroplethGraticule matches visx <Graticule>", () => {
  const visx = visxMercator(chartConfig(800, 450));
  const bklit = createChoroplethMercator(chartConfig(800, 450));
  for (const step of [undefined, [10, 10], [20, 15]] as const) {
    it(`step ${step ? step.join("x") : "default"}`, () => {
      const markup = graticuleMarkup(
        visx.path,
        (geo) => bklit.path(geo as never) ?? null,
        step ? [step[0], step[1]] : undefined
      );
      assert.ok(markup.visx.includes(' d="M'));
      assert.equal(markup.bklit, markup.visx);
    });
  }
});
