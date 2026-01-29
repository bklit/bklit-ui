"use client";

import { Mercator } from "@visx/geo";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";
import type { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

// ZoomState from visx/zoom that includes isDragging
interface ZoomState {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

// Combined type from visx Zoom children prop
type ZoomInstance<E extends Element> = ProvidedZoom<E> & ZoomState;

import type { FeatureCollection, Geometry } from "geojson";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils";
import {
  type ChoroplethFeatureProperties,
  ChoroplethProvider,
  type ChoroplethTooltipData,
  type Margin,
} from "./choropleth-context";

// Zoom context to share zoom controls with child components
interface ChoroplethZoomContextValue {
  zoom: ZoomInstance<SVGSVGElement> | null;
}

const ChoroplethZoomContext = createContext<ChoroplethZoomContextValue>({
  zoom: null,
});

export function useChoroplethZoom() {
  return useContext(ChoroplethZoomContext);
}

export interface ChoroplethChartProps {
  /** GeoJSON FeatureCollection data */
  data: FeatureCollection<Geometry, ChoroplethFeatureProperties>;
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Animation duration in milliseconds. Default: 800 */
  animationDuration?: number;
  /** Aspect ratio as "width / height". Default: "16 / 9" */
  aspectRatio?: string;
  /** Projection scale. If not provided, auto-calculated based on width */
  scale?: number;
  /** Center coordinates [longitude, latitude]. Default: [0, 20] */
  center?: [number, number];
  /** Translate offset [x, y]. If not provided, auto-calculated to center */
  translate?: [number, number];
  /** Enable zoom and pan. Default: false */
  zoomEnabled?: boolean;
  /** Minimum zoom scale. Default: 0.5 */
  zoomMin?: number;
  /** Maximum zoom scale. Default: 4 */
  zoomMax?: number;
  /** Initial zoom transform */
  initialZoom?: TransformMatrix;
  /** Additional class name for the container */
  className?: string;
  /** Child components (ChoroplethFeature, ChoroplethGraticule, ChoroplethTooltip) */
  children: ReactNode;
}

const DEFAULT_MARGIN: Margin = { top: 0, right: 0, bottom: 0, left: 0 };

const DEFAULT_INITIAL_ZOOM: TransformMatrix = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
};

function ChoroplethChartInner({
  data,
  width,
  height,
  margin,
  animationDuration,
  scale: scaleProp,
  center,
  translate: translateProp,
  zoomEnabled,
  zoomMin,
  zoomMax,
  initialZoom,
  children,
}: {
  data: FeatureCollection<Geometry, ChoroplethFeatureProperties>;
  width: number;
  height: number;
  margin: Margin;
  animationDuration: number;
  scale?: number;
  center: [number, number];
  translate?: [number, number];
  zoomEnabled: boolean;
  zoomMin: number;
  zoomMax: number;
  initialZoom: TransformMatrix;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(
    null
  );
  const [tooltipData, setTooltipData] = useState<ChoroplethTooltipData | null>(
    null
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Auto-calculate scale based on width if not provided
  const scale = scaleProp ?? (innerWidth / 630) * 100;

  // Auto-calculate translate to center if not provided
  const translate = translateProp ?? [
    innerWidth / 2 + margin.left,
    innerHeight / 2 + margin.top + 50,
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, animationDuration);
    return () => clearTimeout(timeout);
  }, [animationDuration]);

  const handleMouseLeave = useCallback(() => {
    setHoveredFeatureIndex(null);
    setTooltipData(null);
  }, []);

  if (width < 10 || height < 10) {
    return null;
  }

  return (
    <Mercator
      center={center}
      data={data.features}
      scale={scale}
      translate={translate as [number, number]}
    >
      {(mercator) => {
        // Project geo coordinates to screen coordinates using the projection
        const projectPoint = (
          coords: [number, number]
        ): [number, number] | null => {
          const projected = mercator.projection(coords);
          if (!projected) {
            return null;
          }
          return projected as [number, number];
        };

        const contextValue = {
          features: data.features,
          featureCollection: data,
          pathGenerator: (feature: (typeof data.features)[0]) =>
            mercator.path(feature) ?? undefined,
          // biome-ignore lint/suspicious/noExplicitAny: GeoJSON types are complex
          rawPathGenerator: (geo: any) => mercator.path(geo),
          projectPoint,
          width,
          height,
          innerWidth,
          innerHeight,
          margin,
          hoveredFeatureIndex,
          setHoveredFeatureIndex,
          tooltipData,
          setTooltipData,
          containerRef,
          isLoaded,
          animationDuration,
        };

        const svgContent = (zoom?: ZoomInstance<SVGSVGElement>) => (
          <ChoroplethZoomContext.Provider value={{ zoom: zoom ?? null }}>
            <ChoroplethProvider value={contextValue}>
              <div className="relative h-full w-full" ref={containerRef}>
                <svg
                  aria-hidden="true"
                  height={height}
                  onMouseLeave={handleMouseLeave}
                  ref={zoom?.containerRef}
                  style={{
                    cursor: zoom?.isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                  }}
                  width={width}
                >
                  <g
                    style={{
                      transition: "transform 0.18s ease-out",
                    }}
                    transform={zoom ? zoom.toString() : undefined}
                  >
                    {children}
                  </g>
                </svg>
              </div>
            </ChoroplethProvider>
          </ChoroplethZoomContext.Provider>
        );

        if (zoomEnabled) {
          return (
            <Zoom<SVGSVGElement>
              height={height}
              initialTransformMatrix={initialZoom}
              scaleXMax={zoomMax}
              scaleXMin={zoomMin}
              scaleYMax={zoomMax}
              scaleYMin={zoomMin}
              width={width}
            >
              {(zoom) => svgContent(zoom)}
            </Zoom>
          );
        }

        return svgContent();
      }}
    </Mercator>
  );
}

export function ChoroplethChart({
  data,
  margin: marginProp,
  animationDuration = 800,
  aspectRatio = "16 / 9",
  scale,
  center = [0, 20],
  translate,
  zoomEnabled = false,
  zoomMin = 0.5,
  zoomMax = 4,
  initialZoom = DEFAULT_INITIAL_ZOOM,
  className = "",
  children,
}: ChoroplethChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio }}>
      <ParentSize>
        {({ width, height }) =>
          width > 0 && height > 0 ? (
            <ChoroplethChartInner
              animationDuration={animationDuration}
              center={center}
              data={data}
              height={height}
              initialZoom={initialZoom}
              margin={margin}
              scale={scale}
              translate={translate}
              width={width}
              zoomEnabled={zoomEnabled}
              zoomMax={zoomMax}
              zoomMin={zoomMin}
            >
              {children}
            </ChoroplethChartInner>
          ) : null
        }
      </ParentSize>
    </div>
  );
}

ChoroplethChart.displayName = "ChoroplethChart";

export default ChoroplethChart;
