"use client";

import type { Transition } from "motion/react";
import {
  Children,
  isValidElement,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";
import {
  defaultScatterColors,
  type LineConfig,
  type Margin,
} from "./chart-context";
import type { ChartPhase } from "./chart-phase";
import { Scatter, type ScatterProps } from "./scatter";
import { ScatterChartInner } from "./scatter-chart-shell";
import {
  type ResolvedScatterJitterConfig,
  resolveScatterJitterConfig,
  type ScatterJitter,
} from "./scatter-jitter";

export interface ScatterChartProps {
  /** Data array — each item should have a date field and numeric values */
  data: Record<string, unknown>[];
  /** Key in data for the x-axis (date). Default: "date" */
  xDataKey?: string;
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Animation duration in milliseconds. Default: 1100 */
  animationDuration?: number;
  /** CSS easing for clip-reveal. Default: cubic-bezier(0.85, 0, 0.15, 1) */
  animationEasing?: string;
  enterTransition?: Transition;
  revealSignature?: string;
  /** Aspect ratio as "width / height". Default: "2 / 1" */
  aspectRatio?: string;
  /** Additional class name for the container */
  className?: string;
  /** Child components (Scatter, Grid, ChartTooltip, XAxis, etc.) */
  children: ReactNode;
  /**
   * Spread points that share an x value (strip plot). Offsets are deterministic
   * (seeded), so points never jump between renders; tooltips show the original
   * values. `true` = `0.35` band steps horizontally. Default: off
   */
  jitter?: ScatterJitter;
  /**
   * Format x-axis tick and date-pill labels, e.g. short month names for
   * monthly data. Hoist or memoize it to avoid recomputing labels. Default: "Jan 1"
   */
  formatXLabel?: (date: Date) => string;
  onPhaseChange?: (phase: ChartPhase) => void;
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 40, left: 40 };

function extractScatterConfigs(children: ReactNode): LineConfig[] {
  const configs: LineConfig[] = [];
  let seriesIndex = 0;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const childType = child.type as {
      displayName?: string;
      name?: string;
    };
    const componentName =
      typeof child.type === "function"
        ? childType.displayName || childType.name || ""
        : "";

    const props = child.props as ScatterProps | undefined;
    const isScatterComponent =
      componentName === "Scatter" ||
      child.type === Scatter ||
      (props && typeof props.dataKey === "string" && props.dataKey.length > 0);

    if (isScatterComponent && props?.dataKey) {
      const seriesColor =
        defaultScatterColors[seriesIndex % defaultScatterColors.length] ??
        defaultScatterColors[0];
      configs.push({
        dataKey: props.dataKey,
        stroke: props.fill || props.stroke || seriesColor,
        strokeWidth: props.radius ?? 5,
        yAxisId: props.yAxisId,
      });
      seriesIndex += 1;
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
  animationEasing?: string;
  enterTransition?: Transition;
  revealSignature?: string;
  children: ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  jitter: ResolvedScatterJitterConfig | null;
  formatXLabel?: (date: Date) => string;
  onPhaseChange?: (phase: ChartPhase) => void;
}

function ChartInner({
  width,
  height,
  data,
  xDataKey,
  margin,
  animationDuration,
  animationEasing,
  enterTransition,
  revealSignature,
  children,
  containerRef,
  jitter,
  formatXLabel,
  onPhaseChange,
}: ChartInnerProps) {
  const lines = useMemo(() => extractScatterConfigs(children), [children]);

  return (
    <ScatterChartInner
      animationDuration={animationDuration}
      animationEasing={animationEasing}
      containerRef={containerRef}
      data={data}
      enterTransition={enterTransition}
      formatXLabel={formatXLabel}
      height={height}
      jitter={jitter}
      lines={lines}
      margin={margin}
      onPhaseChange={onPhaseChange}
      revealSignature={revealSignature}
      width={width}
      xDataKey={xDataKey}
    >
      {children}
    </ScatterChartInner>
  );
}

export function ScatterChart({
  data,
  xDataKey = "date",
  margin: marginProp,
  animationDuration = 1100,
  animationEasing,
  enterTransition = DEFAULT_CHART_ENTER_TRANSITION,
  revealSignature,
  aspectRatio = "2 / 1",
  className = "",
  children,
  jitter: jitterProp,
  formatXLabel,
  onPhaseChange,
}: ScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const margin = { ...DEFAULT_MARGIN, ...marginProp };
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  // Memo on primitives so inline `jitter={{ ... }}` objects stay stable.
  const resolvedJitter = resolveScatterJitterConfig(jitterProp);
  const hasJitter = resolvedJitter !== null;
  const jitterX = resolvedJitter?.x ?? 0;
  const jitterY = resolvedJitter?.y ?? 0;
  const jitterSeed = resolvedJitter?.seed ?? 0;
  const jitter = useMemo<ResolvedScatterJitterConfig | null>(
    () => (hasJitter ? { x: jitterX, y: jitterY, seed: jitterSeed } : null),
    [hasJitter, jitterX, jitterY, jitterSeed]
  );

  const setContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    measureRef(node);
  };

  const width = bounds.width ?? 0;
  const height = bounds.height ?? 0;

  return (
    <div
      className={cn("relative w-full", className)}
      ref={setContainerRef}
      style={{ aspectRatio, touchAction: "none" }}
    >
      {width > 0 && height > 0 ? (
        <ChartInner
          animationDuration={animationDuration}
          animationEasing={animationEasing}
          containerRef={containerRef}
          data={data}
          enterTransition={enterTransition}
          formatXLabel={formatXLabel}
          height={height}
          jitter={jitter}
          margin={margin}
          onPhaseChange={onPhaseChange}
          revealSignature={revealSignature}
          width={width}
          xDataKey={xDataKey}
        >
          {children}
        </ChartInner>
      ) : null}
    </div>
  );
}

ScatterChart.displayName = "ScatterChart";

export { Scatter, type ScatterProps } from "./scatter";
export type { ScatterJitter } from "./scatter-jitter";

export default ScatterChart;
