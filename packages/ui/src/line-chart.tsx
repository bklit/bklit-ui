"use client";

import { curveNatural } from "@visx/curve";
import { localPoint } from "@visx/event";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { bisector } from "d3-array";
import { AnimatePresence, motion, useSpring } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChartGrid } from "./chart-grid";
import { MarkerTooltipContent } from "./charts/markers/chart-markers";
import { type ChartMarker, MarkerGroup } from "./charts/markers/marker-group";

export type { ChartMarker } from "./charts/markers/marker-group";

import {
  ChartTooltip,
  TooltipDot,
  TooltipIndicator,
  type TooltipRow,
} from "./tooltip";

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

// X-Axis label that fades when crosshair is near
interface XAxisLabelProps {
  label: string;
  x: number;
  crosshairX: number | null;
  isHovering: boolean;
  /** Width of the date ticker box - labels within this radius fade completely */
  tickerHalfWidth?: number;
}

function XAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth = 50,
}: XAxisLabelProps) {
  // Calculate opacity based on distance from crosshair
  // Labels under the date ticker box should be fully hidden
  // Labels nearby should fade out smoothly
  const fadeBuffer = 20; // Extra buffer for smooth transition
  const fadeRadius = tickerHalfWidth + fadeBuffer;

  let opacity = 1;
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX);
    if (distance < tickerHalfWidth) {
      // Fully hidden when under the ticker
      opacity = 0;
    } else if (distance < fadeRadius) {
      // Smooth fade in the buffer zone
      opacity = (distance - tickerHalfWidth) / fadeBuffer;
    }
  }

  return (
    <motion.div
      animate={{ opacity }}
      className="absolute whitespace-nowrap text-xs"
      style={{
        left: x,
        bottom: 12,
        transform: "translateX(-50%)",
        color: cssVars.foregroundMuted,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {label}
    </motion.div>
  );
}

// X-Axis labels container
interface XAxisLabelsProps {
  /** The time scale from visx - we use its .ticks() method */
  xScale: ReturnType<typeof scaleTime<number>>;
  marginLeft: number;
  crosshairX: number | null;
  isHovering: boolean;
  /** Number of ticks to show. Default: 6 */
  numTicks?: number;
}

function XAxisLabels({
  xScale,
  marginLeft,
  crosshairX,
  isHovering,
  numTicks = 6,
}: XAxisLabelsProps) {
  // Use xScale.ticks() for intelligent tick placement
  // This handles spacing and avoids overlaps automatically
  const labelsToShow = useMemo(() => {
    // Get tick values from the scale (dates)
    const tickValues = xScale.ticks(numTicks);

    return tickValues.map((date) => ({
      date,
      x: xScale(date) + marginLeft,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [xScale, marginLeft, numTicks]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <XAxisLabel
          crosshairX={crosshairX}
          isHovering={isHovering}
          key={`${item.label}-${item.x}`}
          label={item.label}
          x={item.x}
        />
      ))}
    </div>
  );
}

interface ChartProps {
  width: number;
  height: number;
  data: DataPoint[];
  animationDuration?: number;
  /** Show grid lines. Default: false */
  showGrid?: boolean;
  /** Markers to display on the chart */
  markers?: ChartMarker[];
  /** Show X-axis labels. Default: true */
  showXAxisLabels?: boolean;
  /** Ref to chart container for positioning */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex chart logic
function Chart({
  width,
  height,
  data,
  animationDuration = 1100,
  showGrid = false,
  markers = [],
  showXAxisLabels = true,
  containerRef,
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
    for (const marker of markers) {
      const dateKey = marker.date.toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, marker]);
    }
    return grouped;
  }, [markers]);

  // Get markers for the currently hovered date
  const activeMarkers = useMemo(() => {
    if (!tooltipData) {
      return [];
    }
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
    if (data.length < 2) {
      return 0;
    }
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
  }, [isLoaded, innerWidth, animationDuration]);

  // Calculate dash offset/array for highlighting a segment using binary search
  const getDashProps = useCallback(
    (pathRef: React.RefObject<SVGPathElement | null>, totalLength: number) => {
      if (!(tooltipData && pathRef.current) || totalLength === 0) {
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
      if (!(startPoint && endPoint)) {
        return { strokeDasharray: "none", strokeDashoffset: 0 };
      }

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

  // Spring-animated dash offsets - softer spring so it "catches up" to crosshair
  const dashSpringConfig = { stiffness: 180, damping: 28 };
  const usersOffsetSpring = useSpring(
    usersDashProps.strokeDashoffset,
    dashSpringConfig
  );
  const pageviewsOffsetSpring = useSpring(
    pageviewsDashProps.strokeDashoffset,
    dashSpringConfig
  );

  // Update spring targets when dash props change
  useEffect(() => {
    usersOffsetSpring.set(usersDashProps.strokeDashoffset);
  }, [usersDashProps.strokeDashoffset, usersOffsetSpring]);

  useEffect(() => {
    pageviewsOffsetSpring.set(pageviewsDashProps.strokeDashoffset);
  }, [pageviewsDashProps.strokeDashoffset, pageviewsOffsetSpring]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (!point) {
        return;
      }

      const x0 = xScale.invert(point.x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (!d0) {
        return;
      }

      let d: DataPoint = d0;
      let finalIndex = index - 1;
      if (
        d1 &&
        getDate(d1) &&
        x0.getTime() - getDate(d0).getTime() >
          getDate(d1).getTime() - x0.getTime()
      ) {
        d = d1;
        finalIndex = index;
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
  if (width < 10 || height < 10) {
    return null;
  }

  const isHovering = tooltipData !== null;

  // Block interactivity until animation is complete
  const canInteract = isLoaded;

  // Easing for clip path animation - easeInOutCirc gives smooth acceleration/deceleration
  const easing = "cubic-bezier(0.85, 0, 0.15, 1)";

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <svg aria-hidden="true" height={height} width={width}>
        <defs>
          {/* Clip path for grow animation - animates from left to right */}
          <clipPath id="grow-clip">
            <rect
              height={innerHeight + 20}
              style={{
                transition:
                  !isLoaded && clipWidth > 0
                    ? `width ${animationDuration}ms ${easing}`
                    : "none",
              }}
              width={isLoaded ? innerWidth : clipWidth}
              x={0}
              y={0}
            />
          </clipPath>

          {/* Primary line gradient - fades at edges */}
          <linearGradient
            id="line-primary-gradient"
            x1="0%"
            x2="100%"
            y1="0%"
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
            x2="100%"
            y1="0%"
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
        </defs>

        <rect fill="transparent" height={height} width={width} x={0} y={0} />

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Optional grid */}
          {showGrid && (
            <ChartGrid
              height={innerHeight}
              showColumns={false}
              showRows
              stroke={cssVars.grid}
              width={innerWidth}
              xScale={xScale}
              yScale={yScaleUsers}
            />
          )}

          <TooltipIndicator
            colorEdge={cssVars.crosshair}
            colorMid={cssVars.crosshair}
            columnWidth={columnWidth}
            // span={2}
            fadeEdges
            height={innerHeight}
            visible={!!tooltipData}
            width="line"
            x={tooltipData?.x ?? 0}
          />

          {/* Lines group with clip path for grow animation */}
          <g clipPath="url(#grow-clip)">
            {/* Base lines - animate opacity when hovering */}
            <motion.g
              animate={{ opacity: isHovering ? 0.3 : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* Pageviews base line */}
              <LinePath
                curve={curveNatural}
                data={data}
                innerRef={pageviewsPathRef}
                stroke="url(#line-secondary-gradient)"
                strokeLinecap="round"
                strokeWidth={2.5}
                x={(d) => xScale(getDate(d)) ?? 0}
                y={(d) => yScalePageviews(d.pageviews) ?? 0}
              />

              {/* Users base line */}
              <LinePath
                curve={curveNatural}
                data={data}
                innerRef={usersPathRef}
                stroke="url(#line-primary-gradient)"
                strokeLinecap="round"
                strokeWidth={2.5}
                x={(d) => xScale(getDate(d)) ?? 0}
                y={(d) => yScaleUsers(d.uniqueUsers) ?? 0}
              />
            </motion.g>
          </g>

          {/* Highlighted segment using stroke-dasharray with spring animation */}
          <AnimatePresence>
            {canInteract && isHovering && (
              <motion.g
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Pageviews highlight - use motion.path for spring animation */}
                <motion.path
                  d={pageviewsPathRef.current?.getAttribute("d") || ""}
                  fill="none"
                  stroke={cssVars.lineSecondary}
                  strokeDasharray={pageviewsDashProps.strokeDasharray}
                  strokeLinecap="round"
                  strokeWidth={2.5}
                  style={{ strokeDashoffset: pageviewsOffsetSpring }}
                />
                {/* Users highlight - use motion.path for spring animation */}
                <motion.path
                  d={usersPathRef.current?.getAttribute("d") || ""}
                  fill="none"
                  stroke={cssVars.linePrimary}
                  strokeDasharray={usersDashProps.strokeDasharray}
                  strokeLinecap="round"
                  strokeWidth={2.5}
                  style={{ strokeDashoffset: usersOffsetSpring }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          <TooltipDot
            color={cssVars.linePrimary}
            strokeColor={cssVars.background}
            visible={!!tooltipData}
            x={tooltipData?.x ?? 0}
            y={tooltipData?.yUsers ?? 0}
          />
          <TooltipDot
            color={cssVars.lineSecondary}
            strokeColor={cssVars.background}
            visible={!!tooltipData}
            x={tooltipData?.x ?? 0}
            y={tooltipData?.yPageviews ?? 0}
          />

          {/* Markers at top of chart */}
          {Array.from(markersByDate.entries()).map(
            ([dateKey, dateMarkers], groupIndex) => {
              // Find the x position for this date
              const markerDate = dateMarkers[0]?.date;
              if (!markerDate) {
                return null;
              }
              const markerX = xScale(markerDate) ?? 0;
              // Check if this date is currently hovered
              const isActive =
                tooltipData?.point.date.toDateString() === dateKey;

              // Stagger animation: start after chart loads + 100ms per marker group
              const markerDelay = animationDuration / 1000 + groupIndex * 0.1;

              return (
                <MarkerGroup
                  animate={true}
                  animationDelay={markerDelay}
                  containerRef={containerRef} // Position above chart area
                  isActive={isActive}
                  key={dateKey}
                  lineHeight={innerHeight}
                  marginLeft={margin.left}
                  marginTop={margin.top}
                  markers={dateMarkers}
                  showLine={true}
                  size={28}
                  x={markerX}
                  y={-8}
                />
              );
            }
          )}

          {/* Invisible overlay for mouse events - only active after animation completes */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Chart interaction area */}
          <rect
            fill="transparent"
            height={innerHeight}
            onMouseLeave={canInteract ? handleMouseLeave : undefined}
            onMouseMove={canInteract ? handleMouseMove : undefined}
            style={{ cursor: canInteract ? "crosshair" : "default" }}
            width={innerWidth}
            x={0}
            y={0}
          />
        </g>
      </svg>

      {/* HTML Tooltip - positioned with actual pixel coordinates */}
      <ChartTooltip
        containerWidth={width}
        currentIndex={tooltipData?.index ?? 0}
        dateLabels={dateLabels}
        markerContent={
          activeMarkers.length > 0 ? (
            <MarkerTooltipContent markers={activeMarkers} />
          ) : undefined
        }
        rows={tooltipData ? getTooltipRows(tooltipData.point) : []}
        title={tooltipData?.point.date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
        visible={!!tooltipData}
        x={(tooltipData?.x ?? 0) + margin.left}
      />

      {/* X-Axis Labels - fade as crosshair passes */}
      {showXAxisLabels && (
        <XAxisLabels
          crosshairX={tooltipData ? tooltipData.x + margin.left : null}
          isHovering={isHovering}
          marginLeft={margin.left}
          numTicks={6}
          xScale={xScale}
        />
      )}
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
  /** Show X-axis labels that fade as crosshair passes. Default: true */
  showXAxisLabels?: boolean;
}

export default function CurvedLineChart({
  animationDuration: initialDuration = 1500,
  showGrid = true,
  markers: propMarkers,
  showXAxisLabels = true,
}: CurvedLineChartProps = {}) {
  const data = useMemo(() => generateData(), []);
  const [animationDuration, _setAnimationDuration] = useState(initialDuration);
  const [chartKey, _setChartKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use provided markers or empty array
  const markers = propMarkers ?? [];

  return (
    <>
      {/* Responsive chart container - ParentSize handles resize detection */}
      <div
        className="relative w-full"
        key={chartKey}
        ref={containerRef}
        style={{ aspectRatio: "2 / 1" }}
      >
        <ParentSize debounceTime={10}>
          {({ width, height }) => (
            <Chart
              animationDuration={animationDuration}
              containerRef={containerRef}
              data={data}
              height={height}
              markers={markers}
              showGrid={showGrid}
              showXAxisLabels={showXAxisLabels}
              width={width}
            />
          )}
        </ParentSize>
      </div>
    </>
  );
}
