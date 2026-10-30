"use client";

import { Icon } from "@bklitui/icons";
import {
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethTooltip,
  PatternLines,
  useChoroplethZoom,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  choroplethCountryTargets,
  docsLegendItems,
  getDocsVisitorColor,
  getDocsVisitorValue,
  getGalleryVisitorColor,
  getGalleryVisitorValue,
  getRegionCategory,
} from "./choropleth-data";
import { labWorldData } from "./deterministic";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/choropleth-demo.tsx";
const PROPS = "content/docs/components/choropleth-chart.mdx props table";

// Every source fetches this via `useWorldData*` (network); the lab uses the
// bundled copy of the same TopoJSON.
const worldData = labWorldData();

function Frame({ children }: { children: ReactNode }) {
  return <div className="relative w-full">{children}</div>;
}

const REGIONS = ["americas", "europe", "asia", "africa", "oceania"] as const;

function regionPatterns(prefix: string) {
  return (
    <>
      {REGIONS.map((region, i) => (
        <PatternLines
          height={6}
          id={`${prefix}-${region}`}
          key={region}
          orientation={["diagonal"]}
          stroke={`var(--chart-${i + 1})`}
          strokeWidth={2}
          width={6}
        />
      ))}
    </>
  );
}

function getLinesPattern(feat: ChoroplethFeature): string | null {
  const name = feat.properties?.name;
  return name ? `lab-choro-p-${getRegionCategory(name as string)}` : null;
}

/** docs/choropleth-*-demo.tsx zoom buttons (identical in all three demos). */
function ZoomControls() {
  const { zoom } = useChoroplethZoom();
  if (!zoom) {
    return null;
  }
  return (
    <div className="absolute right-4 bottom-4 flex flex-col gap-1">
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
        size="icon"
        variant="secondary"
      >
        <Icon className="size-5" name="IconPlusSmall" />
      </Button>
      <Button
        className="size-10 rounded-lg shadow-md"
        onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
        size="icon"
        variant="secondary"
      >
        <Icon className="size-5" name="IconMinusSmall" />
      </Button>
    </div>
  );
}

const hoverTargets = choroplethCountryTargets;

export const CHOROPLETH_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "basic",
    label: "Choropleth",
    source: `${EXAMPLES}: Choropleth Chart (ChoroplethBasic)`,
    exercises:
      "16/9, default graticule, single fill, default tooltip, hover dimming",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
          <ChoroplethGraticule />
          <ChoroplethFeatureComponent fill="var(--chart-3)" />
          <ChoroplethTooltip />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "analytics",
    label: "Analytics",
    source: `${EXAMPLES}: Choropleth Chart - Analytics (ChoroplethAnalytics)`,
    exercises:
      "getFeatureColor (chart-1..5 buckets), tooltip getFeatureValue + valueLabel, no graticule",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
          <ChoroplethFeatureComponent
            getFeatureColor={getGalleryVisitorColor}
          />
          <ChoroplethTooltip
            getFeatureValue={getGalleryVisitorValue}
            valueLabel="Visitors"
          />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "hero",
    label: "Interactive (hero)",
    source: `${EXAMPLES}: makeChoroplethHero (Choropleth Chart - Interactive)`,
    exercises: "aspectRatio 2/1 + graticule + visitor colors and values",
    height: 380,
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="2 / 1" data={worldData}>
          <ChoroplethGraticule />
          <ChoroplethFeatureComponent
            getFeatureColor={getGalleryVisitorColor}
          />
          <ChoroplethTooltip
            getFeatureValue={getGalleryVisitorValue}
            valueLabel="Visitors"
          />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "graticule",
    label: "Graticule",
    source: `${EXAMPLES}: Choropleth Chart - Graticule (ChoroplethWithGraticule)`,
    exercises: "graticule with custom stroke, chart-1 fill",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
          <ChoroplethGraticule stroke="rgba(255,255,255,0.15)" />
          <ChoroplethFeatureComponent fill="var(--chart-1)" />
          <ChoroplethTooltip />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "patterns",
    label: "Patterns",
    source: `${EXAMPLES}: Choropleth Chart - Patterns (ChoroplethPattern; also docs/choropleth-pattern-demo.tsx: ChoroplethLinesPatternDemo, same up to pattern ids)`,
    exercises: "patterns defs (PatternLines) + getFeaturePattern per region",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData}>
          <ChoroplethFeatureComponent
            getFeaturePattern={getLinesPattern}
            patterns={regionPatterns("lab-choro-p")}
          />
          <ChoroplethTooltip />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "zoom-controls",
    label: "Zoom + controls",
    source: `${DOCS}: ChoroplethDemo (also docs/choropleth-zoom-demo.tsx: ChoroplethZoomDemo, which only differs in fill / icons)`,
    exercises:
      "zoomEnabled (@visx/zoom transform on the feature group), useChoroplethZoom buttons overlay, scale-03 fill; static initial zoom",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData} zoomEnabled>
          <ChoroplethFeatureComponent fill="var(--chart-scale-03)" />
          <ChoroplethTooltip />
          <ZoomControls />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "docs-analytics",
    label: "Analytics + legend (docs)",
    source: `${DOCS}: ChoroplethAnalyticsDemo`,
    exercises:
      "zoomEnabled, scale-01..05 colors, 'Unique Visitors' tooltip, HTML legend overlay + zoom buttons",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart aspectRatio="16 / 9" data={worldData} zoomEnabled>
          <ChoroplethFeatureComponent getFeatureColor={getDocsVisitorColor} />
          <ChoroplethTooltip
            getFeatureValue={getDocsVisitorValue}
            valueLabel="Unique Visitors"
          />
          <ZoomControls />
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg bg-card/90 p-3 text-xs backdrop-blur-sm">
            <span className="font-medium text-muted-foreground">
              Unique Visitors
            </span>
            {docsLegendItems.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "initial-zoom",
    label: "Initial zoom",
    source: PROPS,
    exercises:
      "zoomEnabled with initialZoom (2x, translated onto Europe), zoomMin/zoomMax",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart
          aspectRatio="16 / 9"
          data={worldData}
          initialZoom={{
            scaleX: 2,
            scaleY: 2,
            translateX: -380,
            translateY: -160,
            skewX: 0,
            skewY: 0,
          }}
          zoomEnabled
          zoomMax={6}
          zoomMin={1}
        >
          <ChoroplethGraticule />
          <ChoroplethFeatureComponent
            getFeatureColor={getGalleryVisitorColor}
          />
          <ChoroplethTooltip />
        </ChoroplethChart>
      </Frame>
    ),
  },
  {
    kind: "single",
    id: "projection-styling",
    label: "Projection & styling",
    source: PROPS,
    exercises:
      "custom scale/center/translate, margin, animationDuration 400, feature stroke/strokeWidth/fadedOpacity, graticule step + strokeWidth, tooltip formatValue/getFeatureName/hideDelay/exit",
    hoverTargets,
    render: () => (
      <Frame>
        <ChoroplethChart
          animationDuration={400}
          aspectRatio="16 / 9"
          center={[10, 45]}
          data={worldData}
          margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
          scale={260}
          translate={[360, 300]}
        >
          <ChoroplethGraticule step={[5, 5]} strokeWidth={1} />
          <ChoroplethFeatureComponent
            fadedOpacity={0.15}
            getFeatureColor={getDocsVisitorColor}
            stroke="var(--foreground)"
            strokeWidth={1}
          />
          <ChoroplethTooltip
            exit={false}
            formatValue={(value) => `${value}k`}
            getFeatureName={(feature) =>
              String(feature.properties?.name ?? "Unknown").toUpperCase()
            }
            getFeatureValue={getDocsVisitorValue}
            hideDelay={0}
            valueLabel="Visitors"
          />
        </ChoroplethChart>
      </Frame>
    ),
  },
];
