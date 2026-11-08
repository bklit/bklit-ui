"use client";

import type { Transition } from "motion/react";
import { domAnimation, LazyMotion } from "motion/react";
import {
  Children,
  type CSSProperties,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Area, type AreaProps } from "./area";
import { Candlestick, type CandlestickProps } from "./candlestick";
import { resolveChartChildElement } from "./chart-child-passthrough";
import {
  defaultScatterColors,
  type LineConfig,
  type Margin,
  useStableMargin,
} from "./chart-context";
import { useChartDataOverride } from "./chart-data-override";
import { ChartLoadingLabel } from "./chart-loading-label";
import { ParentSize } from "./chart-parent-size";
import {
  type ChartPhase,
  type ChartStatus,
  DEFAULT_CHART_STATUS,
  DEFAULT_Y_DOMAIN_TWEEN_MS,
  resolveRestingChartPhase,
} from "./chart-phase";
import { Line, type LineProps } from "./line";
import {
  PROFIT_LOSS_POSITIVE_COLOR,
  ProfitLossLine,
  type ProfitLossLineProps,
} from "./profit-loss-line";
import { Scatter, type ScatterProps } from "./scatter";
import { SeriesBar, type SeriesBarProps } from "./series-bar";
import {
  TimeSeriesChartInner,
  timeSeriesChartHasRoom,
} from "./time-series-chart-shell";
import { normalizeYAxisId } from "./y-axis-scales";
import type { YDomainOverride } from "./y-domain-utils";

export interface ComposedChartProps {
  /** Data array — each row typically has a date and multiple numeric series */
  data: Record<string, unknown>[];
  /** Key for the x-axis (time). Default: "date" */
  xDataKey?: string;
  margin?: Partial<Margin>;
  animationDuration?: number;
  animationEasing?: string;
  enterTransition?: Transition;
  /** Signature of motion URL state — triggers reveal replay when it changes. */
  revealSignature?: string;
  /** Aspect ratio as "width / height". Default: "2 / 1". Pass `""` to fill a sized parent. */
  aspectRatio?: string;
  className?: string;
  /** Inline container styles (e.g. a fixed height). */
  style?: CSSProperties;
  /**
   * Series and chrome. Every time-series primitive composes: `Line`, `Area`,
   * `SeriesBar`, `Scatter`, `Candlestick`, `ProfitLossLine`, plus `Band`,
   * `ProjectionLine`, `TrendLine`, `ReferenceArea`, `Grid`, axes and
   * `ChartTooltip`. Fragments are walked, so series can be grouped.
   */
  children: ReactNode;
  /** Target bar width in px (Recharts-style `barSize`). */
  barSize?: number;
  /** Maximum bar width in px (`maxBarSize`). */
  maxBarSize?: number;
  /** Gap between grouped `SeriesBar` series in px. Default: 4 */
  barGap?: number;
  /** Stack `SeriesBar` segments in child order at each x (other series are not stacked). */
  stacked?: boolean;
  /** Gap in px between stacked segments. Default: 0 */
  stackGap?: number;
  /**
   * Inset the x-axis by half a slot on each side when the chart has
   * `SeriesBar` series, so the first and last bars sit inside the plot instead
   * of spilling into the y-axis gutters. Lines, areas and the x-axis share the
   * inset scale and stay centred on their bars. Default: `true`
   */
  barEdgeInset?: boolean;
  /** Loading vs ready — drives chart phase and loading chrome. Default: `"ready"`. */
  status?: ChartStatus;
  /** Centered shimmer label while loading. */
  loadingLabel?: string;
  /** Animate y-domain over this duration (ms) on status transitions. Default: 500. */
  yDomainTweenDuration?: number;
  /** Animate y-domain when status or target domain changes. Default: true */
  yDomainTween?: boolean;
  /** Visible x-domain for brush zoom. */
  xDomain?: [Date, Date];
  /** Full dataset length for x-scale padding when `xDomain` is set. */
  xDomainSlotCount?: number;
  /** Tween y-domain when brush changes the visible x-range. Default: false */
  tweenYDomainOnXDomainChange?: boolean;
  /**
   * Fixed y-domain max for single-axis charts: `[0, yScaleDomainMax × 1.1]`.
   * Default: data max per axis (stacked `SeriesBar` axes use stack totals).
   */
  yScaleDomainMax?: number;
  /**
   * Per-axis y-domain overrides keyed by `yAxisId`: a fixed `[min, max]` or a
   * function of the auto domain, e.g. `{ volume: ([, max]) => [0, max * 3] }`
   * keeps volume bars in the bottom third under price candles. Hoist or
   * memoize the object so the domain is not recomputed every render.
   */
  yDomains?: Record<string, YDomainOverride>;
  onPhaseChange?: (phase: ChartPhase) => void;
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 40, left: 40 };

const FALLBACK_STROKE = "var(--chart-line-primary)";

function getChildComponentName(child: ReactElement): string {
  const childType = child.type as { displayName?: string; name?: string };
  return typeof child.type === "function"
    ? childType.displayName || childType.name || ""
    : "";
}

/** Matches by reference or by name (MDX / duplicate bundles break `===`). */
function isComponent(
  child: ReactElement,
  component: unknown,
  name: string
): boolean {
  return child.type === component || getChildComponentName(child) === name;
}

export interface ComposedSeries {
  /** Tooltip / y-domain series in child order. */
  lines: LineConfig[];
  /** `SeriesBar` keys in child order (grouped / stacked columns). */
  barDataKeys: string[];
  /** Value keys that only extend an axis domain (candlestick high / low). */
  extraDomainKeysByAxis: Record<string, string[]>;
  /** Axes that float around their data instead of anchoring at zero. */
  floatingYAxisIds: string[];
}

function upsertLineConfig(lines: LineConfig[], config: LineConfig): void {
  const index = lines.findIndex((line) => line.dataKey === config.dataKey);
  if (index === -1) {
    lines.push(config);
    return;
  }
  // Area+Line pairs share a dataKey — keep the later config (Line over Area).
  lines[index] = config;
}

function addExtraDomainKeys(
  byAxis: Record<string, string[]>,
  axisId: string,
  keys: string[]
) {
  const existing = byAxis[axisId] ?? [];
  for (const key of keys) {
    if (!existing.includes(key)) {
      existing.push(key);
    }
  }
  byAxis[axisId] = existing;
}

interface SeriesRegistrar {
  component: unknown;
  name: string;
  register: (
    props: unknown,
    series: ComposedSeries,
    walk: { scatterCount: number }
  ) => void;
}

const SERIES_REGISTRARS: SeriesRegistrar[] = [
  {
    component: SeriesBar,
    name: "SeriesBar",
    register: (rawProps, series) => {
      const props = rawProps as SeriesBarProps;
      if (!props.dataKey) {
        return;
      }
      series.barDataKeys.push(props.dataKey);
      upsertLineConfig(series.lines, {
        dataKey: props.dataKey,
        stroke: props.stroke || props.fill || FALLBACK_STROKE,
        strokeWidth: 0,
        yAxisId: props.yAxisId,
      });
    },
  },
  {
    component: Line,
    name: "Line",
    register: (rawProps, series) => {
      const props = rawProps as LineProps;
      if (!props.dataKey) {
        return;
      }
      upsertLineConfig(series.lines, {
        dataKey: props.dataKey,
        stroke: props.stroke || FALLBACK_STROKE,
        strokeWidth: props.strokeWidth ?? 2.5,
        yAxisId: props.yAxisId,
      });
    },
  },
  {
    component: Area,
    name: "Area",
    register: (rawProps, series) => {
      const props = rawProps as AreaProps;
      if (!props.dataKey) {
        return;
      }
      upsertLineConfig(series.lines, {
        dataKey: props.dataKey,
        stroke: props.stroke || props.fill || FALLBACK_STROKE,
        strokeWidth: props.strokeWidth ?? 2,
        yAxisId: props.yAxisId,
      });
    },
  },
  {
    component: Scatter,
    name: "Scatter",
    register: (rawProps, series, walk) => {
      const props = rawProps as ScatterProps;
      if (!props.dataKey) {
        return;
      }
      const fallback =
        defaultScatterColors[walk.scatterCount % defaultScatterColors.length] ??
        FALLBACK_STROKE;
      walk.scatterCount += 1;
      upsertLineConfig(series.lines, {
        dataKey: props.dataKey,
        stroke: props.fill || props.stroke || fallback,
        strokeWidth: props.radius ?? 5,
        yAxisId: props.yAxisId,
      });
    },
  },
  {
    component: ProfitLossLine,
    name: "ProfitLossLine",
    register: (rawProps, series) => {
      const props = rawProps as ProfitLossLineProps;
      if (!props.dataKey) {
        return;
      }
      upsertLineConfig(series.lines, {
        dataKey: props.dataKey,
        stroke: props.positiveColor || PROFIT_LOSS_POSITIVE_COLOR,
        strokeWidth: props.strokeWidth ?? 2.5,
      });
    },
  },
  {
    component: Candlestick,
    name: "Candlestick",
    register: (rawProps, series) => {
      const props = rawProps as CandlestickProps;
      const axisId = normalizeYAxisId(props.yAxisId);
      // `close` is the tooltip row; wicks and opens extend the domain only.
      upsertLineConfig(series.lines, {
        dataKey: "close",
        stroke: "var(--chart-positive, var(--color-emerald-500))",
        strokeWidth: 0,
        yAxisId: props.yAxisId,
      });
      addExtraDomainKeys(series.extraDomainKeysByAxis, axisId, [
        "high",
        "low",
        "open",
      ]);
      if (!series.floatingYAxisIds.includes(axisId)) {
        series.floatingYAxisIds.push(axisId);
      }
    },
  },
];

/**
 * Walk chart children (through fragments and clip passthrough wrappers) and
 * register every time-series primitive for the shared x-scale, y-domains and
 * tooltip.
 */
export function extractComposedSeries(children: ReactNode): ComposedSeries {
  const series: ComposedSeries = {
    lines: [],
    barDataKeys: [],
    extraDomainKeysByAxis: {},
    floatingYAxisIds: [],
  };
  const walk = { scatterCount: 0 };

  const visit = (node: ReactNode) => {
    Children.forEach(node, (rawChild) => {
      if (!isValidElement(rawChild)) {
        return;
      }
      if (rawChild.type === Fragment) {
        visit((rawChild.props as { children?: ReactNode }).children);
        return;
      }
      const child = resolveChartChildElement(rawChild);
      const registrar = SERIES_REGISTRARS.find((entry) =>
        isComponent(child, entry.component, entry.name)
      );
      registrar?.register(child.props, series, walk);
    });
  };

  visit(children);
  return series;
}

function computeStackOffsets(
  data: Record<string, unknown>[],
  barDataKeys: string[]
): Map<number, Map<string, number>> {
  const offsets = new Map<number, Map<string, number>>();
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (!d) {
      continue;
    }
    const pointOffsets = new Map<string, number>();
    let cumulative = 0;
    for (const key of barDataKeys) {
      pointOffsets.set(key, cumulative);
      const v = d[key];
      if (typeof v === "number") {
        cumulative += v;
      }
    }
    offsets.set(i, pointOffsets);
  }
  return offsets;
}

export function ComposedChart({
  data: dataProp,
  xDataKey = "date",
  margin: marginProp,
  animationDuration = 1100,
  animationEasing,
  enterTransition,
  revealSignature,
  aspectRatio = "2 / 1",
  className = "",
  style,
  children,
  barSize,
  maxBarSize,
  barGap = 4,
  stacked = false,
  stackGap = 0,
  barEdgeInset = true,
  status = DEFAULT_CHART_STATUS,
  loadingLabel,
  yDomainTweenDuration = DEFAULT_Y_DOMAIN_TWEEN_MS,
  yDomainTween = true,
  xDomain,
  xDomainSlotCount,
  tweenYDomainOnXDomainChange = false,
  yScaleDomainMax,
  yDomains,
  onPhaseChange,
}: ComposedChartProps) {
  const { data } = useChartDataOverride("ComposedChart", {
    data: dataProp,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const margin = useStableMargin({ ...DEFAULT_MARGIN, ...marginProp });

  // Keyed by a string signature so new `children` identities (every parent
  // render) keep the same series references and skip shell recomputation.
  const seriesSignature = useMemo(
    () => JSON.stringify(extractComposedSeries(children)),
    [children]
  );
  const { lines, barDataKeys, extraDomainKeysByAxis, floatingYAxisIds } =
    useMemo(
      () => JSON.parse(seriesSignature) as ComposedSeries,
      [seriesSignature]
    );

  const [chartPhase, setChartPhase] = useState<ChartPhase>(() =>
    resolveRestingChartPhase(status)
  );
  const handlePhaseChange = useCallback(
    (phase: ChartPhase) => {
      setChartPhase(phase);
      onPhaseChange?.(phase);
    },
    [onPhaseChange]
  );

  const composedStackOffsets = useMemo(
    () =>
      stacked && barDataKeys.length > 0
        ? computeStackOffsets(data, barDataKeys)
        : undefined,
    [data, barDataKeys, stacked]
  );

  const hasExtraDomainKeys = Object.keys(extraDomainKeysByAxis).length > 0;

  const showLoadingLabel = Boolean(
    loadingLabel?.trim() &&
      (chartPhase === "loading" ||
        chartPhase === "exiting" ||
        chartPhase === "gridTweenReady" ||
        chartPhase === "revealingLoading")
  );

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn("relative w-full", className)}
        ref={containerRef}
        style={{
          ...(aspectRatio ? { aspectRatio } : undefined),
          touchAction: "none",
          ...style,
        }}
      >
        <ParentSize debounceTime={10}>
          {({ width, height }) =>
            timeSeriesChartHasRoom(width, height) ? (
              <TimeSeriesChartInner
                animationDuration={animationDuration}
                animationEasing={animationEasing}
                chartStatus={status}
                clipPathId="composed-chart-grow-clip"
                composedBarDataKeys={
                  barDataKeys.length > 0 ? barDataKeys : undefined
                }
                composedBarEdgeInset={barEdgeInset}
                composedBarGap={barGap}
                composedBarSize={barSize}
                composedMaxBarSize={maxBarSize}
                composedStacked={stacked}
                composedStackGap={stackGap}
                composedStackOffsets={composedStackOffsets}
                containerRef={containerRef}
                data={data}
                enterTransition={enterTransition}
                extraDomainKeysByAxis={
                  hasExtraDomainKeys ? extraDomainKeysByAxis : undefined
                }
                floatingYAxisIds={
                  floatingYAxisIds.length > 0 ? floatingYAxisIds : undefined
                }
                height={height}
                lines={lines}
                loadingLabel={loadingLabel}
                margin={margin}
                onPhaseChange={handlePhaseChange}
                revealSignature={revealSignature}
                tweenYDomainOnXDomainChange={tweenYDomainOnXDomainChange}
                width={width}
                xDataKey={xDataKey}
                xDomain={xDomain}
                xDomainSlotCount={xDomainSlotCount}
                yDomainOverrides={yDomains}
                yDomainTween={yDomainTween}
                yDomainTweenDuration={yDomainTweenDuration}
                yScaleDomainMax={yScaleDomainMax}
              >
                {children}
              </TimeSeriesChartInner>
            ) : null
          }
        </ParentSize>
        {showLoadingLabel ? (
          <ChartLoadingLabel
            exiting={chartPhase !== "loading"}
            text={loadingLabel}
          />
        ) : null}
      </div>
    </LazyMotion>
  );
}

ComposedChart.displayName = "ComposedChart";

export default ComposedChart;
