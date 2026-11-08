"use client";

import {
  ChoroplethBackground,
  ChoroplethChart,
  ChoroplethDotGrid,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  ChoroplethMarker,
  ChoroplethTooltip,
} from "@bklitui/ui/charts";
import { useWorldDataStandalone } from "@/components/docs/use-world-data";
import type { Recipe } from "@/lib/recipes/types";

/* -------------------------------------------------------------------------- */
/* Shared data                                                                */
/* -------------------------------------------------------------------------- */

const VISITORS: Record<string, number> = {
  "United States of America": 18,
  "United Kingdom": 12,
  Germany: 17,
  France: 9,
  Canada: 8,
  Australia: 6,
  Netherlands: 5,
  Brazil: 7,
  India: 11,
  Japan: 4,
  Spain: 3,
  Italy: 6,
  Mexico: 5,
  Poland: 4,
  Sweden: 3,
  "South Africa": 4,
  Argentina: 3,
  Indonesia: 2,
};

function visitorColor(feature: ChoroplethFeature) {
  const visitors = VISITORS[feature.properties?.name as string];
  if (!visitors) {
    return "var(--chart-scale-01)";
  }
  if (visitors >= 15) {
    return "var(--chart-scale-05)";
  }
  if (visitors >= 10) {
    return "var(--chart-scale-04)";
  }
  if (visitors >= 5) {
    return "var(--chart-scale-03)";
  }
  return "var(--chart-scale-02)";
}

function visitorValue(feature: ChoroplethFeature) {
  return VISITORS[feature.properties?.name as string];
}

const OFFICES: { label: string; coordinates: [number, number] }[] = [
  { label: "London", coordinates: [-0.13, 51.51] },
  { label: "Paris", coordinates: [2.35, 48.86] },
  { label: "New York", coordinates: [-74.01, 40.71] },
  { label: "Tokyo", coordinates: [139.69, 35.69] },
  { label: "São Paulo", coordinates: [-46.63, -23.55] },
  { label: "Sydney", coordinates: [151.21, -33.87] },
];

const DATA_SOURCE = `const visitors: Record<string, number> = {
  "United States of America": 18,
  "United Kingdom": 12,
  Germany: 17,
  India: 11,
  // …one entry per country you have data for
};

function visitorColor(feature: ChoroplethFeature) {
  const value = visitors[feature.properties?.name as string];
  if (!value) return "var(--chart-scale-01)";
  if (value >= 15) return "var(--chart-scale-05)";
  if (value >= 10) return "var(--chart-scale-04)";
  if (value >= 5) return "var(--chart-scale-03)";
  return "var(--chart-scale-02)";
}

const offices: { label: string; coordinates: [number, number] }[] = [
  { label: "London", coordinates: [-0.13, 51.51] },
  { label: "Paris", coordinates: [2.35, 48.86] },
  { label: "New York", coordinates: [-74.01, 40.71] },
  { label: "Tokyo", coordinates: [139.69, 35.69] },
  { label: "São Paulo", coordinates: [-46.63, -23.55] },
  { label: "Sydney", coordinates: [151.21, -33.87] },
];`;

const IMPORTS = `import {
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethMarker,
  ChoroplethTooltip,
} from "@/components/charts/choropleth";`;

function MapFrame({ children }: { children: React.ReactNode }) {
  return <div className="flex size-full items-center">{children}</div>;
}

function MapLoading() {
  return (
    <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
      Loading map…
    </div>
  );
}

function choroplethChart(
  Preview: Recipe["charts"][number]["Preview"],
  steps: string[],
  code: string
): Recipe["charts"][number] {
  return {
    id: "choropleth",
    label: "Choropleth",
    rootComponent: "ChoroplethChart",
    Preview,
    install: ["choropleth-chart"],
    steps,
    code,
  };
}

/* -------------------------------------------------------------------------- */
/* Tilted dot map                                                             */
/* -------------------------------------------------------------------------- */

function TiltedDotMap() {
  const { worldData } = useWorldDataStandalone();
  if (!worldData) {
    return <MapLoading />;
  }
  return (
    <MapFrame>
      <ChoroplethChart
        aspectRatio="16 / 9"
        clickToZoom
        data={worldData}
        focusMaxZoom={2}
        perspective={{
          overview: { tilt: 30 },
          focus: { view: "auto", yaw: 10, tilt: 24 },
        }}
      >
        <ChoroplethDotGrid
          edgeFade={20}
          fadedOpacity={0.5}
          getFeatureColor={visitorColor}
          oceanOpacity={0.35}
        />
        {OFFICES.map((office) => (
          <ChoroplethMarker
            color="oklch(0.883 0.192 99.307)"
            key={office.label}
            size={12}
            {...office}
          />
        ))}
        <ChoroplethTooltip
          getFeatureValue={visitorValue}
          valueLabel="Visitors"
        />
      </ChoroplethChart>
    </MapFrame>
  );
}

const TILTED_DOT_MAP_SOURCE = `"use client";

${IMPORTS.replace("ChoroplethChart,", "ChoroplethChart,\n  ChoroplethDotGrid,")}

${DATA_SOURCE}

export function VisitorDotMap({ geojson }: { geojson: GeoJSON.FeatureCollection }) {
  return (
    <ChoroplethChart
      aspectRatio="16 / 9"
      data={geojson}
      // Click a country or office to fly there; Escape flies back
      clickToZoom
      focusMaxZoom={2}
      perspective={{
        // Leaned back like a table top…
        overview: { tilt: 30 },
        // …and turned toward whichever side of the map you clicked
        focus: { view: "auto", yaw: 10, tilt: 24 },
      }}
    >
      <ChoroplethDotGrid
        getFeatureColor={visitorColor}
        oceanOpacity={0.35}
        edgeFade={20}
        fadedOpacity={0.5}
      />
      {offices.map((office) => (
        <ChoroplethMarker
          key={office.label}
          {...office}
          size={12}
          color="oklch(0.883 0.192 99.307)"
        />
      ))}
      <ChoroplethTooltip
        getFeatureValue={(feature) => visitors[feature.properties?.name as string]}
        valueLabel="Visitors"
      />
    </ChoroplethChart>
  );
}
`;

export const choroplethTiltedDotMap: Recipe = {
  id: "choropleth-tilted-dot-map",
  title: "Tilted dot map",
  category: "maps",
  description:
    "The world as one dot lattice, leaned back 30° and fading into the edges — click a country and the camera turns to face its side of the map.",
  look: "a world map drawn entirely as a hex grid of round dots, no country outlines. Land dots take a 5-step sequential colour by visitor count (no-data countries in the neutral empty tone); ocean dots continue the same grid in the empty tone at about a third opacity, and the whole grid fades to nothing toward all four edges. The map is tilted back about 30° in 3D, like a table top. Six bright yellow round markers sit on major cities. Hovering a country dims the others and shows a tooltip with its visitor count. Clicking a country flies the camera to it over ~700 ms with an ease-in-out curve, rotating slightly toward the side of the map it's on; ocean dots fade out and the dots swell a little as it zooms. Clicking it again, the empty map or pressing Escape flies back.",
  charts: [
    choroplethChart(
      TiltedDotMap,
      [
        "Swap `ChoroplethFeatureComponent` for `ChoroplethDotGrid`, passing the same `getFeatureColor`. Set `oceanOpacity={0.35}`, `edgeFade={20}` and `fadedOpacity={0.5}`; keep the default hex lattice.",
        "Remove `ChoroplethGraticule` — the ocean dots already describe the surface.",
        "On `ChoroplethChart`, add `clickToZoom` and `focusMaxZoom={2}` so countries are framed without zooming in too far.",
        'Add `perspective={{ overview: { tilt: 30 }, focus: { view: "auto", yaw: 10, tilt: 24 } }}`. The overview stays square-on but leaned back; a focused country is seen from its own side.',
        "Add one `ChoroplethMarker` per location with `size={12}` and a bright yellow `color` (`oklch(0.883 0.192 99.307)`), no glow and no stroke. Markers stay the same size while zooming.",
      ],
      TILTED_DOT_MAP_SOURCE
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Pointer pin map                                                            */
/* -------------------------------------------------------------------------- */

function PointerPinMap() {
  const { worldData } = useWorldDataStandalone();
  if (!worldData) {
    return <MapLoading />;
  }
  return (
    <MapFrame>
      <ChoroplethChart
        aspectRatio="16 / 9"
        clickToZoom
        data={worldData}
        perspective={{
          overview: { view: "pointer", yaw: 14, tilt: 18 },
          focus: { view: "auto", tilt: 28 },
        }}
      >
        <ChoroplethBackground hideOnFocus pattern="dots" />
        <ChoroplethFeatureComponent getFeatureColor={visitorColor} />
        {OFFICES.map((office) => (
          <ChoroplethMarker
            color="var(--chart-1)"
            glow={6}
            key={office.label}
            pulse="always"
            shape="pin"
            size={10}
            {...office}
          />
        ))}
        <ChoroplethTooltip
          getFeatureValue={visitorValue}
          valueLabel="Visitors"
        />
      </ChoroplethChart>
    </MapFrame>
  );
}

const POINTER_PIN_MAP_SOURCE = `"use client";

${IMPORTS.replace("ChoroplethChart,", "ChoroplethBackground,\n  ChoroplethChart,\n  ChoroplethFeatureComponent,")}

${DATA_SOURCE}

export function OfficesMap({ geojson }: { geojson: GeoJSON.FeatureCollection }) {
  return (
    <ChoroplethChart
      aspectRatio="16 / 9"
      data={geojson}
      clickToZoom
      perspective={{
        // Swings from a west to an east view as the pointer crosses the map
        overview: { view: "pointer", yaw: 14, tilt: 18 },
        focus: { view: "auto", tilt: 28 },
      }}
    >
      {/* Static: doesn't zoom or tilt; fades out while zoomed in */}
      <ChoroplethBackground pattern="dots" hideOnFocus />
      <ChoroplethFeatureComponent getFeatureColor={visitorColor} />
      {offices.map((office) => (
        <ChoroplethMarker
          key={office.label}
          {...office}
          shape="pin"
          size={10}
          color="var(--chart-1)"
          pulse="always"
          glow={6}
        />
      ))}
      <ChoroplethTooltip
        getFeatureValue={(feature) => visitors[feature.properties?.name as string]}
        valueLabel="Visitors"
      />
    </ChoroplethChart>
  );
}
`;

export const choroplethPointerPinMap: Recipe = {
  id: "choropleth-pointer-pin-map",
  title: "Pointer pin map",
  category: "maps",
  description:
    "A filled map that turns to follow the pointer, with pulsing pins over a static dot backdrop.",
  look: "a filled world map coloured by a 5-step sequential visitor scale over a fine static dot pattern that fades out at the chart edges. The map is tilted back about 18° and swings smoothly from a west-side view to an east-side view as the pointer moves from left to right, settling flat when the pointer leaves. Six pin-shaped markers in the primary chart colour have a soft glow and a ripple that pulses continuously, each out of step with the others. Clicking a country or pin flies the camera to it and tilts further toward that side of the map; the dot backdrop fades out while zoomed in, and only the focused target reacts to hover.",
  charts: [
    choroplethChart(
      PointerPinMap,
      [
        'Add `<ChoroplethBackground pattern="dots" hideOnFocus />` as the first child of `ChoroplethChart`. It stays put while the map moves and fades out when zoomed in.',
        'On `ChoroplethChart`, add `clickToZoom` and `perspective={{ overview: { view: "pointer", yaw: 14, tilt: 18 }, focus: { view: "auto", tilt: 28 } }}`. The pointer view springs between west and east; with reduced motion it stays still.',
        'Add one `ChoroplethMarker` per location with `shape="pin"`, `size={10}`, `color="var(--chart-1)"`, `pulse="always"` and `glow={6}`.',
        "Keep `ChoroplethFeatureComponent` with your `getFeatureColor` scale and the `ChoroplethTooltip` as they are.",
      ],
      POINTER_PIN_MAP_SOURCE
    ),
  ],
};
