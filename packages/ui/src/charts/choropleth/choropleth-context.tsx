"use client";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  createContext,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useContext,
} from "react";

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChoroplethFeatureProperties {
  name?: string;
  id?: string | number;
  [key: string]: unknown;
}

export type ChoroplethFeature = Feature<Geometry, ChoroplethFeatureProperties>;

export interface ChoroplethTooltipData {
  featureIndex: number;
  x: number;
  y: number;
  feature: ChoroplethFeature;
}

export interface ChoroplethContextValue {
  // Geo data
  features: ChoroplethFeature[];
  featureCollection: FeatureCollection<Geometry, ChoroplethFeatureProperties>;

  // Projection function (returns path string)
  pathGenerator: (feature: ChoroplethFeature) => string | undefined;

  // Raw path function for graticule (accepts any geo object)
  // biome-ignore lint/suspicious/noExplicitAny: GeoJSON types are complex
  rawPathGenerator: (geo: any) => string | null;

  // Project geo coordinates to screen coordinates
  projectPoint: (coords: [number, number]) => [number, number] | null;

  // Dimensions
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: Margin;

  // Hover state
  hoveredFeatureIndex: number | null;
  setHoveredFeatureIndex: (index: number | null) => void;

  // Tooltip
  tooltipData: ChoroplethTooltipData | null;
  setTooltipData: Dispatch<SetStateAction<ChoroplethTooltipData | null>>;
  containerRef: RefObject<HTMLDivElement | null>;

  // Animation
  isLoaded: boolean;
  animationDuration: number;
}

const ChoroplethContext = createContext<ChoroplethContextValue | null>(null);

export function ChoroplethProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ChoroplethContextValue;
}) {
  return (
    <ChoroplethContext.Provider value={value}>
      {children}
    </ChoroplethContext.Provider>
  );
}

export function useChoropleth(): ChoroplethContextValue {
  const context = useContext(ChoroplethContext);
  if (!context) {
    throw new Error("useChoropleth must be used within a ChoroplethProvider");
  }
  return context;
}

// CSS variables for choropleth theming
export const choroplethCssVars = {
  feature1: "var(--chart-1)",
  feature2: "var(--chart-2)",
  feature3: "var(--chart-3)",
  feature4: "var(--chart-4)",
  feature5: "var(--chart-5)",
  stroke: "var(--chart-grid)",
  background: "var(--background)",
};

// Default colors array for cycling through features
export const defaultChoroplethColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
