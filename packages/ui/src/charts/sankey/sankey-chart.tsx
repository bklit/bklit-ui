"use client";

import { localPoint } from "@visx/event";
import { ParentSize } from "@visx/responsive";
import { sankey, sankeyCenter, sankeyLinkHorizontal } from "@visx/sankey";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils";
import {
  type Margin,
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  SankeyProvider,
  type SankeyTooltipData,
} from "./sankey-context";

export interface SankeyData {
  nodes: SankeyNodeDatum[];
  links: SankeyLinkDatum[];
}

export interface SankeyChartProps {
  /** Sankey data with nodes and links */
  data: SankeyData;
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Animation duration in milliseconds. Default: 1100 */
  animationDuration?: number;
  /** Aspect ratio as "width / height". Default: "2 / 1" */
  aspectRatio?: string;
  /** Node width in pixels. Default: 16 */
  nodeWidth?: number;
  /** Node padding in pixels. Default: 24 */
  nodePadding?: number;
  /** Additional class name for the container */
  className?: string;
  /** Child components (SankeyNode, SankeyLink, SankeyTooltip) */
  children: ReactNode;
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 180, bottom: 40, left: 180 };

function SankeyChartInner({
  data,
  width,
  height,
  margin,
  animationDuration,
  nodeWidth,
  nodePadding,
  children,
}: {
  data: SankeyData;
  width: number;
  height: number;
  margin: Margin;
  animationDuration: number;
  nodeWidth: number;
  nodePadding: number;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<SankeyTooltipData | null>(
    null
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, animationDuration);
    return () => clearTimeout(timeout);
  }, [animationDuration]);

  const sankeyGenerator = useMemo(() => {
    return sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(sankeyCenter)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);
  }, [innerWidth, innerHeight, nodeWidth, nodePadding]);

  const graph = useMemo(() => {
    const clonedData = {
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    };
    return sankeyGenerator(clonedData);
  }, [data, sankeyGenerator]);

  const createPath = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: d3-sankey types are complex
    (link: any) => {
      try {
        const pathGenerator = sankeyLinkHorizontal();
        return pathGenerator(link) || "";
      } catch {
        return "";
      }
    },
    []
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const point = localPoint(event);
    if (point) {
      setMousePos({ x: point.x, y: point.y });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNodeIndex(null);
    setHoveredLinkIndex(null);
    setTooltipData(null);
    setMousePos(null);
  }, []);

  if (width < 10 || height < 10) {
    return null;
  }

  const contextValue = {
    graph,
    nodes: graph.nodes,
    links: graph.links,
    width,
    height,
    innerWidth,
    innerHeight,
    margin,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredNodeIndex,
    setHoveredLinkIndex,
    tooltipData,
    setTooltipData,
    containerRef,
    isLoaded,
    animationDuration,
    mousePos,
    createPath,
  };

  return (
    <SankeyProvider value={contextValue}>
      <div className="relative h-full w-full" ref={containerRef}>
        <svg
          aria-hidden="true"
          height={height}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          width={width}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {children}
          </g>
        </svg>
      </div>
    </SankeyProvider>
  );
}

export function SankeyChart({
  data,
  margin: marginProp,
  animationDuration = 1100,
  aspectRatio = "2 / 1",
  nodeWidth = 16,
  nodePadding = 24,
  className = "",
  children,
}: SankeyChartProps) {
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio }}>
      <ParentSize>
        {({ width, height }) => (
          <SankeyChartInner
            animationDuration={animationDuration}
            data={data}
            height={height}
            margin={margin}
            nodePadding={nodePadding}
            nodeWidth={nodeWidth}
            width={width}
          >
            {children}
          </SankeyChartInner>
        )}
      </ParentSize>
    </div>
  );
}

SankeyChart.displayName = "SankeyChart";

export default SankeyChart;
