"use client";

import React, { useRef, useEffect } from "react";
import { useMemo, useState, useCallback } from "react";
import { LinePath } from "@visx/shape";
import { curveNatural } from "@visx/curve";
import { scaleTime, scaleLinear } from "@visx/scale";
import { ParentSize } from "@visx/responsive";
import { localPoint } from "@visx/event";
// @ts-expect-error - d3-array types not installed
import { bisector } from "d3-array";
import {
  ChartTooltip,
  TooltipDot,
  TooltipIndicator,
  type TooltipRow,
} from "./tooltip";
import { ChartGrid } from "./chart-grid";
import {
  MarkerGroup,
  MarkerTooltipContent,
  type ChartMarker,
} from "./chart-marker";

interface DataPoint {
  date: Date;
  uniqueUsers: number;
  pageviews: number;
}

// Generate mock data for last 30 days
function generateData(): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const baseUsers = 1200 + Math.sin(i * 0.4) * 300;
    const basePageviews = 4500 + Math.sin(i * 0.35) * 800;
    const userNoise = Math.random() * 200 - 100;
    const pageviewNoise = Math.random() * 500 - 250;

    data.push({
      date,
      uniqueUsers: Math.round(Math.max(0, baseUsers + userNoise + i * 8)),
      pageviews: Math.round(
        Math.max(0, basePageviews + pageviewNoise + i * 25)
      ),
    });
  }

  return data;
}

const getDate = (d: DataPoint) => d.date;
const bisectDate = bisector<DataPoint, Date>((d: DataPoint) => d.date).left;

// CSS variable references for theming
const cssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  linePrimary: "var(--chart-line-primary)",
  lineSecondary: "var(--chart-line-secondary)",
  crosshair: "var(--chart-crosshair)",
  grid: "var(--chart-grid)",
};

interface ChartProps {
  width: number;
  height: number;
  data: DataPoint[];
  animationDuration?: number;
  /** Show grid lines. Default: false */
  showGrid?: boolean;
  /** Markers to display on the chart */
  markers?: ChartMarker[];
}

function Chart({
  width,
  height,
  data,
  animationDuration = 1100,
  showGrid = false,
  markers = [],
}: ChartProps) {
  // Theme colors come from CSS variables

  const [tooltipData, setTooltipData] = useState<{
    point: DataPoint;
    index: number;
    x: number;
    yUsers: number;
    yPageviews: number;
  } | null>(null);

  // Group markers by date (normalized to midnight)
  const markersByDate = useMemo(() => {
    const grouped = new Map<string, ChartMarker[]>();
    markers.forEach((marker) => {
      const dateKey = marker.date.toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, marker]);
    });
    return grouped;
  }, [markers]);

  // Get markers for the currently hovered date
  const activeMarkers = useMemo(() => {
    if (!tooltipData) return [];
    const dateKey = tooltipData.point.date.toDateString();
    return markersByDate.get(dateKey) || [];
  }, [tooltipData, markersByDate]);

  // Path refs for measuring and dash calculations
  const usersPathRef = useRef<SVGPathElement>(null);
  const pageviewsPathRef = useRef<SVGPathElement>(null);
  const [pathLengths, setPathLengths] = useState({ users: 0, pageviews: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [clipWidth, setClipWidth] = useState(0);

  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, innerWidth],
        domain: [
          Math.min(...data.map((d) => getDate(d).getTime())),
          Math.max(...data.map((d) => getDate(d).getTime())),
        ],
      }),
    [innerWidth, data]
  );

  // Calculate column width (spacing between data points)
  const columnWidth = useMemo(() => {
    if (data.length < 2) return 0;
    return innerWidth / (data.length - 1);
  }, [innerWidth, data.length]);

  const yScaleUsers = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        domain: [0, Math.max(...data.map((d) => d.uniqueUsers)) * 1.1],
        nice: true,
      }),
    [innerHeight, data]
  );

  const yScalePageviews = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        domain: [0, Math.max(...data.map((d) => d.pageviews)) * 1.1],
        nice: true,
      }),
    [innerHeight, data]
  );

  // Pre-compute all date labels for the ticker animation
  const dateLabels = useMemo(
    () =>
      data.map((d) =>
        d.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
    [data]
  );

  // Measure path lengths after render and trigger grow animation
  useEffect(() => {
    if (usersPathRef.current && pageviewsPathRef.current) {
      const usersLen = usersPathRef.current.getTotalLength();
      const pageviewsLen = pageviewsPathRef.current.getTotalLength();

      if (usersLen > 0 && pageviewsLen > 0) {
        setPathLengths({
          users: usersLen,
          pageviews: pageviewsLen,
        });

        // Trigger the grow animation: clipWidth goes from 0 to innerWidth
        if (!isLoaded) {
          // Start with clip at 0, then animate to full width
          requestAnimationFrame(() => {
            setClipWidth(innerWidth);
            // Mark as loaded after animation completes
            setTimeout(() => {
              setIsLoaded(true);
            }, animationDuration);
          });
        }
      }
    }
  }, [width, height, data, isLoaded, innerWidth, animationDuration]);

  // Calculate dash offset/array for highlighting a segment using binary search
  const getDashProps = useCallback(
    (pathRef: React.RefObject<SVGPathElement | null>, totalLength: number) => {
      if (!tooltipData || !pathRef.current || totalLength === 0) {
        return { strokeDasharray: "none", strokeDashoffset: 0 };
      }

      const idx = tooltipData.index;
      const startIdx = Math.max(0, idx - 1);
      const endIdx = Math.min(data.length - 1, idx + 1);

      const path = pathRef.current;

      // Binary search to find the length along the path at a specific X coordinate
      const findLengthAtX = (targetX: number): number => {
        let low = 0;
        let high = totalLength;
        const tolerance = 0.5;

        while (high - low > tolerance) {
          const mid = (low + high) / 2;
          const point = path.getPointAtLength(mid);
          if (point.x < targetX) {
            low = mid;
          } else {
            high = mid;
          }
        }
        return (low + high) / 2;
      };

      const startPoint = data[startIdx];
      const endPoint = data[endIdx];
      if (!startPoint || !endPoint)
        return { strokeDasharray: "none", strokeDashoffset: 0 };

      const startX = xScale(getDate(startPoint)) ?? 0;
      const endX = xScale(getDate(endPoint)) ?? 0;

      const startLength = findLengthAtX(startX);
      const endLength = findLengthAtX(endX);
      const segmentLength = endLength - startLength;

      return {
        strokeDasharray: `${segmentLength} ${totalLength}`,
        strokeDashoffset: -startLength,
      };
    },
    [tooltipData, data, xScale]
  );

  const usersDashProps = getDashProps(usersPathRef, pathLengths.users);
  const pageviewsDashProps = getDashProps(
    pageviewsPathRef,
    pathLengths.pageviews
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = xScale.invert(point.x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (!d0) return;

      let d: DataPoint = d0;
      let finalIndex = index - 1;
      if (d1 && getDate(d1)) {
        if (
          x0.getTime() - getDate(d0).getTime() >
          getDate(d1).getTime() - x0.getTime()
        ) {
          d = d1;
          finalIndex = index;
        }
      }

      setTooltipData({
        point: d,
        index: finalIndex,
        x: xScale(getDate(d)) ?? 0,
        yUsers: yScaleUsers(d.uniqueUsers) ?? 0,
        yPageviews: yScalePageviews(d.pageviews) ?? 0,
      });
    },
    [xScale, yScaleUsers, yScalePageviews, data, margin.left]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

  // Early return if dimensions not ready (after all hooks)
  if (width < 10 || height < 10) return null;

  const isHovering = tooltipData !== null;

  // Block interactivity until animation is complete
  const canInteract = isLoaded;

  // Easing for clip path animation - easeInOutCirc gives smooth acceleration/deceleration
  const easing = "cubic-bezier(0.85, 0, 0.15, 1)";

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height}>
        <defs>
          {/* Clip path for grow animation - animates from left to right */}
          <clipPath id="grow-clip">
            <rect
              x={0}
              y={0}
              width={isLoaded ? innerWidth : clipWidth}
              height={innerHeight + 20}
              style={{
                transition:
                  !isLoaded && clipWidth > 0
                    ? `width ${animationDuration}ms ${easing}`
                    : "none",
              }}
            />
          </clipPath>

          {/* Primary line gradient - fades at edges */}
          <linearGradient
            id="line-primary-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0 }}
            />
            <stop
              offset="15%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 1 }}
            />
            <stop
              offset="85%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0 }}
            />
          </linearGradient>

          {/* Secondary line gradient - fades at edges */}
          <linearGradient
            id="line-secondary-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0 }}
            />
            <stop
              offset="15%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 1 }}
            />
            <stop
              offset="85%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0 }}
            />
          </linearGradient>

          {/* Dimmed gradients for hover state */}
          <linearGradient
            id="line-primary-gradient-dim"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0 }}
            />
            <stop
              offset="15%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0.3 }}
            />
            <stop
              offset="85%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: cssVars.linePrimary, stopOpacity: 0 }}
            />
          </linearGradient>

          <linearGradient
            id="line-secondary-gradient-dim"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0 }}
            />
            <stop
              offset="15%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0.3 }}
            />
            <stop
              offset="85%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: cssVars.lineSecondary, stopOpacity: 0 }}
            />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="transparent" />

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Optional grid */}
          {showGrid && (
            <ChartGrid
              width={innerWidth}
              height={innerHeight}
              xScale={xScale}
              yScale={yScaleUsers}
              showRows
              showColumns={false}
              stroke={cssVars.grid}
            />
          )}

          {/* Lines group with clip path for grow animation */}
          <g clipPath="url(#grow-clip)">
            {/* Pageviews base line */}
            <LinePath
              innerRef={pageviewsPathRef}
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScalePageviews(d.pageviews) ?? 0}
              stroke={
                isHovering
                  ? "url(#line-secondary-gradient-dim)"
                  : "url(#line-secondary-gradient)"
              }
              strokeWidth={2.5}
              strokeLinecap="round"
              curve={curveNatural}
              style={{ transition: "stroke 0.15s ease" }}
            />

            {/* Users base line */}
            <LinePath
              innerRef={usersPathRef}
              data={data}
              x={(d) => xScale(getDate(d)) ?? 0}
              y={(d) => yScaleUsers(d.uniqueUsers) ?? 0}
              stroke={
                isHovering
                  ? "url(#line-primary-gradient-dim)"
                  : "url(#line-primary-gradient)"
              }
              strokeWidth={2.5}
              strokeLinecap="round"
              curve={curveNatural}
              style={{ transition: "stroke 0.15s ease" }}
            />
          </g>

          <TooltipIndicator
            x={tooltipData?.x ?? 0}
            height={innerHeight}
            visible={!!tooltipData}
            // span={2}
            width="line"
            columnWidth={columnWidth}
            colorEdge={cssVars.crosshair}
            colorMid={cssVars.crosshair}
            fadeEdges
          />

          {/* Highlighted segment using stroke-dasharray - only after animation completes */}
          {canInteract && isHovering && (
            <>
              <LinePath
                data={data}
                x={(d) => xScale(getDate(d)) ?? 0}
                y={(d) => yScalePageviews(d.pageviews) ?? 0}
                stroke={cssVars.lineSecondary}
                strokeWidth={2.5}
                strokeLinecap="round"
                curve={curveNatural}
                strokeDasharray={pageviewsDashProps.strokeDasharray}
                strokeDashoffset={pageviewsDashProps.strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
              />
              <LinePath
                data={data}
                x={(d) => xScale(getDate(d)) ?? 0}
                y={(d) => yScaleUsers(d.uniqueUsers) ?? 0}
                stroke={cssVars.linePrimary}
                strokeWidth={2.5}
                strokeLinecap="round"
                curve={curveNatural}
                strokeDasharray={usersDashProps.strokeDasharray}
                strokeDashoffset={usersDashProps.strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
              />
            </>
          )}

          <TooltipDot
            x={tooltipData?.x ?? 0}
            y={tooltipData?.yUsers ?? 0}
            visible={!!tooltipData}
            color={cssVars.linePrimary}
            strokeColor={cssVars.background}
          />
          <TooltipDot
            x={tooltipData?.x ?? 0}
            y={tooltipData?.yPageviews ?? 0}
            visible={!!tooltipData}
            color={cssVars.lineSecondary}
            strokeColor={cssVars.background}
          />

          {/* Markers at top of chart */}
          {Array.from(markersByDate.entries()).map(([dateKey, dateMarkers]) => {
            // Find the x position for this date
            const markerDate = dateMarkers[0]?.date;
            if (!markerDate) return null;
            const markerX = xScale(markerDate) ?? 0;
            // Check if this date is currently hovered
            const isActive = tooltipData?.point.date.toDateString() === dateKey;

            return (
              <MarkerGroup
                key={dateKey}
                x={markerX}
                y={-8} // Position above chart area
                markers={dateMarkers}
                isActive={isActive}
                size={24}
              />
            );
          })}

          {/* Invisible overlay for mouse events - only active after animation completes */}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            style={{ cursor: canInteract ? "crosshair" : "default" }}
            onMouseMove={canInteract ? handleMouseMove : undefined}
            onMouseLeave={canInteract ? handleMouseLeave : undefined}
          />
        </g>
      </svg>

      {/* HTML Tooltip - positioned with actual pixel coordinates */}
      <ChartTooltip
        x={(tooltipData?.x ?? 0) + margin.left}
        visible={!!tooltipData}
        title={tooltipData?.point.date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
        rows={tooltipData ? getTooltipRows(tooltipData.point) : []}
        containerWidth={width}
        currentIndex={tooltipData?.index ?? 0}
        dateLabels={dateLabels}
        markerContent={
          activeMarkers.length > 0 ? (
            <MarkerTooltipContent markers={activeMarkers} />
          ) : undefined
        }
      />
    </div>
  );
}

// Prepare tooltip rows from data point
function getTooltipRows(point: DataPoint): TooltipRow[] {
  return [
    { color: cssVars.linePrimary, label: "People", value: point.uniqueUsers },
    { color: cssVars.lineSecondary, label: "Views", value: point.pageviews },
  ];
}

export interface CurvedLineChartProps {
  /** Animation duration in milliseconds. Default: 1500 */
  animationDuration?: number;
  /** Show grid lines. Default: false */
  showGrid?: boolean;
  /** Markers to display on the chart */
  markers?: ChartMarker[];
}

// Re-export ChartMarker type for consumers
export type { ChartMarker };

export default function CurvedLineChart({
  animationDuration: initialDuration = 1500,
  showGrid = true,
  markers: propMarkers,
}: CurvedLineChartProps = {}) {
  const data = useMemo(() => generateData(), []);
  const [animationDuration, setAnimationDuration] = useState(initialDuration);
  const [chartKey, setChartKey] = useState(0);

  // Demo markers - use prop markers or generate sample ones
  const markers = useMemo(() => {
    if (propMarkers) return propMarkers;
    // Generate sample markers for demo
    const now = new Date();
    const sampleMarkers: ChartMarker[] = [
      {
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        icon: "🚀",
        title: "v1.2.0 Released",
        description: "New chart animations",
      },
      {
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Same day - will stack
        icon: "🐛",
        title: "Bug Fix",
        description: "Fixed tooltip positioning",
      },
      {
        date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        icon: "✨",
        title: "Feature Launch",
        description: "Added grid support",
      },
    ];
    return sampleMarkers;
  }, [propMarkers]);

  const handleReplay = () => {
    setChartKey((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <button
          onClick={handleReplay}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          Replay Animation
        </button>

        {/* Responsive chart container - ParentSize handles resize detection */}
        <div key={chartKey} className="w-full" style={{ aspectRatio: "2 / 1" }}>
          <ParentSize debounceTime={10}>
            {({ width, height }) => (
              <Chart
                width={width}
                height={height}
                data={data}
                animationDuration={animationDuration}
                showGrid={showGrid}
                markers={markers}
              />
            )}
          </ParentSize>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="mt-4 flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
            Duration: {animationDuration}ms
          </label>
          <input
            type="range"
            min={200}
            max={8000}
            step={100}
            value={animationDuration}
            onChange={(e) => setAnimationDuration(Number(e.target.value))}
            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
