"use client";

import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { type ReactNode, useCallback, useState } from "react";
import {
  defaultRadarColors,
  type RadarContextValue,
  type RadarData,
  type RadarMetric,
  RadarProvider,
} from "./radar-context";

export interface RadarChartProps {
  /** Data array - each item represents a data series (polygon) */
  data: RadarData[];
  /** Metrics to display on the radar */
  metrics: RadarMetric[];
  /** Chart size in pixels. If not provided, uses parent container size */
  size?: number;
  /** Number of concentric grid circles. Default: 5 */
  levels?: number;
  /** Margin around the chart. Default: 60 */
  margin?: number;
  /** Enable animations. Default: true */
  animate?: boolean;
  /** Controlled hover state - index of hovered area */
  hoveredIndex?: number | null;
  /** Callback when hover state changes */
  onHoverChange?: (index: number | null) => void;
  /** Additional class name for the container */
  className?: string;
  /** Child components (RadarGrid, RadarAxis, RadarLabels, RadarArea) */
  children: ReactNode;
}

interface RadarChartInnerProps {
  width: number;
  height: number;
  data: RadarData[];
  metrics: RadarMetric[];
  levels: number;
  margin: number;
  animate: boolean;
  children: ReactNode;
  hoveredIndexProp?: number | null;
  onHoverChange?: (index: number | null) => void;
}

function RadarChartInner({
  width,
  height,
  data,
  metrics,
  levels,
  margin,
  animate,
  children,
  hoveredIndexProp,
  onHoverChange,
}: RadarChartInnerProps) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<
    number | null
  >(null);

  // Use controlled or uncontrolled hover state
  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );

  // Use the smaller dimension
  const size = Math.min(width, height);
  const radius = (size - margin * 2) / 2;

  // Scale for converting values (0-100) to radius
  const yScale = useCallback(
    (value: number) => {
      const scale = scaleLinear<number>({
        range: [0, radius],
        domain: [0, 100],
      });
      return scale(value) ?? 0;
    },
    [radius]
  );

  // Get angle for a metric index (rotated so first metric is at top)
  const getAngle = useCallback(
    (metricIndex: number) => {
      const step = (Math.PI * 2) / metrics.length;
      const angleOffset = -Math.PI / 2; // Rotate so first axis is at top
      return metricIndex * step + angleOffset;
    },
    [metrics.length]
  );

  // Get x,y position for a metric at a given value
  const getPointPosition = useCallback(
    (metricIndex: number, value: number) => {
      const angle = getAngle(metricIndex);
      const r = yScale(value);
      return {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
      };
    },
    [getAngle, yScale]
  );

  // Get color for a data index
  const getColor = useCallback(
    (index: number) => {
      const item = data[index];
      if (item?.color) {
        return item.color;
      }
      return defaultRadarColors[index % defaultRadarColors.length] as string;
    },
    [data]
  );

  // Early return if dimensions not ready
  if (size < 10) {
    return null;
  }

  const contextValue: RadarContextValue = {
    data,
    metrics,
    size,
    radius,
    levels,
    hoveredIndex,
    setHoveredIndex,
    animate,
    getColor,
    getAngle,
    getPointPosition,
    yScale,
  };

  return (
    <RadarProvider value={contextValue}>
      <svg
        aria-hidden="true"
        height={size}
        style={{ overflow: "visible" }}
        width={size}
      >
        <Group left={size / 2} top={size / 2}>
          {children}
        </Group>
      </svg>
    </RadarProvider>
  );
}

export function RadarChart({
  data,
  metrics,
  size: fixedSize,
  levels = 5,
  margin = 60,
  animate = true,
  className = "",
  hoveredIndex,
  onHoverChange,
  children,
}: RadarChartProps) {
  // If fixed size is provided, use it directly
  if (fixedSize) {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: fixedSize, height: fixedSize }}
      >
        <RadarChartInner
          animate={animate}
          data={data}
          height={fixedSize}
          hoveredIndexProp={hoveredIndex}
          levels={levels}
          margin={margin}
          metrics={metrics}
          onHoverChange={onHoverChange}
          width={fixedSize}
        >
          {children}
        </RadarChartInner>
      </div>
    );
  }

  // Otherwise use ParentSize for responsive sizing
  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <RadarChartInner
            animate={animate}
            data={data}
            height={height}
            hoveredIndexProp={hoveredIndex}
            levels={levels}
            margin={margin}
            metrics={metrics}
            onHoverChange={onHoverChange}
            width={width}
          >
            {children}
          </RadarChartInner>
        )}
      </ParentSize>
    </div>
  );
}

export default RadarChart;
