"use client";

import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { bisector } from "d3-array";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/utils";
import { ChartProvider, type LineConfig, type Margin } from "./chart-context";
import { Line, type LineProps } from "./line";
import { useChartInteraction } from "./use-chart-interaction";

// Check if a component should render after the mouse overlay (markers need to be on top for interaction)
function isPostOverlayComponent(child: ReactElement): boolean {
  const childType = child.type as {
    displayName?: string;
    name?: string;
    __isChartMarkers?: boolean;
  };

  // Check for static marker property (more reliable than displayName)
  if (childType.__isChartMarkers) {
    return true;
  }

  // Fallback to displayName check
  const componentName =
    typeof child.type === "function"
      ? childType.displayName || childType.name || ""
      : "";

  return componentName === "ChartMarkers" || componentName === "MarkerGroup";
}

export interface LineChartProps {
  /** Data array - each item should have a date field and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the x-axis (date). Default: "date" */
  xDataKey?: string;
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Animation duration in milliseconds. Default: 1100 */
  animationDuration?: number;
  /** Aspect ratio as "width / height". Default: "2 / 1" */
  aspectRatio?: string;
  /** Additional class name for the container */
  className?: string;
  /** Child components (Line, Grid, ChartTooltip, etc.) */
  children: ReactNode;
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 40, left: 40 };

// Extract line configs from children synchronously to avoid render timing issues
function extractLineConfigs(children: ReactNode): LineConfig[] {
  const configs: LineConfig[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    // Check if it's a Line component by displayName, function reference, or props structure
    const childType = child.type as {
      displayName?: string;
      name?: string;
    };
    const componentName =
      typeof child.type === "function"
        ? childType.displayName || childType.name || ""
        : "";

    // Check by displayName, or by props having dataKey (duck typing)
    const props = child.props as LineProps | undefined;
    const isLineComponent =
      componentName === "Line" ||
      child.type === Line ||
      (props && typeof props.dataKey === "string" && props.dataKey.length > 0);

    if (isLineComponent && props?.dataKey) {
      configs.push({
        dataKey: props.dataKey,
        stroke: props.stroke || "var(--chart-line-primary)",
        strokeWidth: props.strokeWidth || 2.5,
      });
    }
  });

  return configs;
}

interface ChartInnerProps {
  width: number;
  height: number;
  data: Record<string, unknown>[];
  xDataKey: string;
  margin: Margin;
  animationDuration: number;
  children: ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function ChartInner({
  width,
  height,
  data,
  xDataKey,
  margin,
  animationDuration,
  children,
  containerRef,
}: ChartInnerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract line configs synchronously from children
  const lines = useMemo(() => extractLineConfigs(children), [children]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // X accessor function
  const xAccessor = useCallback(
    (d: Record<string, unknown>): Date => {
      const value = d[xDataKey];
      return value instanceof Date ? value : new Date(value as string | number);
    },
    [xDataKey]
  );

  // Create bisector for finding nearest data point
  const bisectDate = useMemo(
    () => bisector<Record<string, unknown>, Date>((d) => xAccessor(d)).left,
    [xAccessor]
  );

  // X scale (time) - use exact data domain for tight fit
  const xScale = useMemo(() => {
    const dates = data.map((d) => xAccessor(d));
    const minTime = Math.min(...dates.map((d) => d.getTime()));
    const maxTime = Math.max(...dates.map((d) => d.getTime()));

    return scaleTime({
      range: [0, innerWidth],
      domain: [minTime, maxTime],
    });
  }, [innerWidth, data, xAccessor]);

  // Calculate column width (spacing between data points)
  const columnWidth = useMemo(() => {
    if (data.length < 2) {
      return 0;
    }
    return innerWidth / (data.length - 1);
  }, [innerWidth, data.length]);

  // Y scale - computed from extracted line configs (available immediately)
  const yScale = useMemo(() => {
    let maxValue = 0;
    for (const line of lines) {
      for (const d of data) {
        const value = d[line.dataKey];
        if (typeof value === "number" && value > maxValue) {
          maxValue = value;
        }
      }
    }

    if (maxValue === 0) {
      maxValue = 100;
    }

    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, maxValue * 1.1],
      nice: true,
    });
  }, [innerHeight, data, lines]);

  // Pre-compute date labels for ticker animation
  const dateLabels = useMemo(
    () =>
      data.map((d) =>
        xAccessor(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
    [data, xAccessor]
  );

  // Animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, animationDuration);
    return () => clearTimeout(timer);
  }, [animationDuration]);

  const canInteract = isLoaded;

  const {
    tooltipData,
    setTooltipData,
    selection,
    clearSelection,
    interactionHandlers,
    interactionStyle,
  } = useChartInteraction({
    xScale,
    yScale,
    data,
    lines,
    margin,
    xAccessor,
    bisectDate,
    canInteract,
  });

  // Early return if dimensions not ready
  if (width < 10 || height < 10) {
    return null;
  }

  // Separate children into pre-overlay (Grid, Line) and post-overlay (ChartMarkers)
  const preOverlayChildren: ReactElement[] = [];
  const postOverlayChildren: ReactElement[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    if (isPostOverlayComponent(child)) {
      postOverlayChildren.push(child);
    } else {
      preOverlayChildren.push(child);
    }
  });

  const contextValue = {
    data,
    xScale,
    yScale,
    width,
    height,
    innerWidth,
    innerHeight,
    margin,
    columnWidth,
    tooltipData,
    setTooltipData,
    containerRef,
    lines,
    isLoaded,
    animationDuration,
    xAccessor,
    dateLabels,
    selection,
    clearSelection,
  };

  return (
    <ChartProvider value={contextValue}>
      <svg aria-hidden="true" height={height} width={width}>
        <defs>
          <clipPath id="chart-grow-clip">
            <rect
              height={innerHeight + 20}
              style={{
                transition: isLoaded
                  ? "none"
                  : `width ${animationDuration}ms cubic-bezier(0.85, 0, 0.15, 1)`,
              }}
              width={isLoaded ? innerWidth : 0}
              x={0}
              y={0}
            />
          </clipPath>
        </defs>

        <rect fill="transparent" height={height} width={width} x={0} y={0} />

        <g
          {...interactionHandlers}
          style={interactionStyle}
          transform={`translate(${margin.left},${margin.top})`}
        >
          <rect
            fill="transparent"
            height={innerHeight}
            width={innerWidth}
            x={0}
            y={0}
          />

          {preOverlayChildren}
          {postOverlayChildren}
        </g>
      </svg>
    </ChartProvider>
  );
}

export function LineChart({
  data,
  xDataKey = "date",
  margin: marginProp,
  animationDuration = 1100,
  aspectRatio = "2 / 1",
  className = "",
  children,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  return (
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
      style={{ aspectRatio, touchAction: "none" }}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <ChartInner
            animationDuration={animationDuration}
            containerRef={containerRef}
            data={data}
            height={height}
            margin={margin}
            width={width}
            xDataKey={xDataKey}
          >
            {children}
          </ChartInner>
        )}
      </ParentSize>
    </div>
  );
}

// Re-export Line for convenience
export { Line, type LineProps } from "./line";

export default LineChart;
