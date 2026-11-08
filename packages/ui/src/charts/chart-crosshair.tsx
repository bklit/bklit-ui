"use client";

import NumberFlow from "@number-flow/react";
import { m, useReducedMotion, useSpring } from "motion/react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type SpringConfig, useChartConfig } from "./chart-config-context";
import {
  chartCssVars,
  useChartHoverStore,
  useChartPortalContainer,
  useChartStable,
} from "./chart-context";
import {
  type ChartStatFlowFormat,
  useNumberFlowElementReady,
} from "./chart-stat-flow";
import { setCrosshairY } from "./crosshair-store";
import { normalizeYAxisId } from "./y-axis-scales";

export interface ChartCrosshairProps {
  /** Draw the horizontal line at the cursor's y. Default: `true` */
  horizontal?: boolean;
  /** Draw the vertical line. Default: `true` */
  vertical?: boolean;
  /**
   * Vertical line snaps to the hovered column (the tooltip's x) instead of
   * following the cursor freely. Default: `true`
   */
  snap?: boolean;
  /** Axis whose scale converts the cursor y into the pill value. Default: `"left"` */
  yAxisId?: string | number;
  /** Which plot edge the value pill sits on. Default: `"right"` for the right axis, else `"left"`. */
  side?: "left" | "right";
  /** Show the y-value pill on the axis. Default: `true` */
  showValueLabel?: boolean;
  /**
   * Roll digits with NumberFlow as the value changes. Uses `format` / `prefix`
   * / `suffix` (`formatValue` is ignored). Default: `false`
   */
  numberFlow?: boolean;
  /** `Intl.NumberFormat` options for the pill. Default: up to 2 fraction digits. */
  format?: ChartStatFlowFormat;
  /** Text before the value (e.g. `"$"`). */
  prefix?: string;
  /** Text after the value (e.g. `"%"`). */
  suffix?: string;
  /** Custom formatter for the static (non-NumberFlow) pill. */
  formatValue?: (value: number) => string;
  /** Line colour. Default: `var(--chart-crosshair)` */
  stroke?: string;
  /** Line dash pattern. Default: `"3,3"` */
  strokeDasharray?: string;
  /** Line width. Default: `1` */
  strokeWidth?: number;
  /** Spring for the lines and pill. Default: the chart's tooltip spring. */
  springConfig?: SpringConfig;
}

type Spring = ReturnType<typeof useSpring>;

const DEFAULT_FORMAT: ChartStatFlowFormat = { maximumFractionDigits: 2 };

/**
 * Pill offset from the plot edge: its text lines up with the `YAxis` labels
 * (8px gutter) and the 16px padding overlaps the plot.
 */
const PILL_TEXT_INSET = 8 - 16;

/**
 * Minimum gap (ms) between NumberFlow value updates. Each update starts a
 * digit animation; updating on every pointer move restarts them every frame.
 */
const NUMBER_FLOW_UPDATE_MS = 120;

/**
 * Shorter than NumberFlow's default (~900ms): a crosshair value changes many
 * times a second, and long spins pile up overlapping digit animations.
 */
const NUMBER_FLOW_TIMING: EffectTiming = {
  duration: 350,
  easing: "cubic-bezier(0.23, 1, 0.32, 1)",
};

function drive(value: Spring, target: number, instant: boolean) {
  if (instant) {
    value.jump(target);
  } else {
    value.set(target);
  }
}

/**
 * Finance-style crosshair: a horizontal line that tracks the cursor's y, with
 * the axis value in a pill styled like the x-axis date ticker, and a vertical
 * line on the hovered column. A `YAxis` on the same axis fades the ticks the
 * pill covers. Pair with `<ChartTooltip showCrosshair={false} />`.
 *
 * Pointer moves never re-render React: the lines and pill follow motion
 * values, the static label is written to the DOM, and only NumberFlow (when
 * enabled) re-renders, throttled.
 */
export function ChartCrosshair(props: ChartCrosshairProps) {
  const { containerRef } = useChartStable();
  const container = useChartPortalContainer(containerRef);
  if (!container) {
    return null;
  }
  return <ChartCrosshairInner {...props} container={container} />;
}

ChartCrosshair.displayName = "ChartCrosshair";

const ChartCrosshairInner = memo(function ChartCrosshairInner({
  container,
  yAxisId,
  horizontal = true,
  vertical = true,
  snap = true,
  side,
  showValueLabel = true,
  numberFlow = false,
  format = DEFAULT_FORMAT,
  prefix,
  suffix,
  formatValue,
  stroke = chartCssVars.crosshair,
  strokeDasharray = "3,3",
  strokeWidth = 1,
  springConfig,
}: ChartCrosshairProps & { container: HTMLDivElement }) {
  const { margin, innerWidth, innerHeight, yScales, yScale } = useChartStable();
  const hoverStore = useChartHoverStore();
  const { tooltipSpring } = useChartConfig();
  const reduceMotion = useReducedMotion() === true;
  const numberFlowReady = useNumberFlowElementReady();
  const spring = springConfig ?? tooltipSpring;

  const axisId = normalizeYAxisId(yAxisId);
  const scale = yScales[axisId] ?? yScale;
  const resolvedSide = side ?? (axisId === "right" ? "right" : "left");
  const showPill = horizontal && showValueLabel;
  const useFlow = showPill && numberFlow && numberFlowReady;

  const springX = useSpring(0, spring);
  const springY = useSpring(0, spring);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [flowValue, setFlowValue] = useState(0);

  const formatLabel = useMemo(() => {
    if (formatValue) {
      return formatValue;
    }
    const intl = new Intl.NumberFormat(undefined, format);
    return (value: number) =>
      `${prefix ?? ""}${intl.format(value)}${suffix ?? ""}`;
  }, [formatValue, format, prefix, suffix]);

  // Everything the pointer handler reads, kept current without re-binding.
  const latest = {
    scale,
    margin,
    innerWidth,
    innerHeight,
    snap,
    axisId,
    showPill,
    useFlow,
    reduceMotion,
    formatLabel,
  };
  const live = useRef(latest);
  live.current = latest;

  useEffect(() => {
    let rect: DOMRect | null = null;
    let visible = false;
    let lastLabel = "";
    let lastFlowAt = 0;
    let flowTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingFlow: number | null = null;

    const snappedX = () => hoverStore?.getSnapshot().tooltipData?.x ?? null;

    const flushFlow = () => {
      flowTimer = undefined;
      if (pendingFlow !== null) {
        lastFlowAt = performance.now();
        setFlowValue(pendingFlow);
        pendingFlow = null;
      }
    };

    const setVisible = (next: boolean) => {
      if (visible === next) {
        return;
      }
      visible = next;
      if (rootRef.current) {
        rootRef.current.style.visibility = next ? "visible" : "hidden";
      }
      if (!next) {
        lastLabel = "";
        setCrosshairY(container, null);
      }
    };

    const updateLabel = (y: number) => {
      const s = live.current;
      setCrosshairY(container, { y, axisId: s.axisId });
      const value = s.scale.invert(y);
      const label = s.formatLabel(value);
      if (label === lastLabel) {
        return;
      }
      lastLabel = label;
      if (!s.useFlow) {
        if (labelRef.current) {
          labelRef.current.textContent = label;
        }
        return;
      }
      pendingFlow = value;
      const wait = NUMBER_FLOW_UPDATE_MS - (performance.now() - lastFlowAt);
      if (wait <= 0) {
        flushFlow();
      } else {
        flowTimer ??= setTimeout(flushFlow, wait);
      }
    };

    const onMove = (event: PointerEvent) => {
      rect ??= container.getBoundingClientRect();
      const s = live.current;
      const x = event.clientX - rect.left - s.margin.left;
      const y = event.clientY - rect.top - s.margin.top;
      if (x < 0 || x > s.innerWidth || y < 0 || y > s.innerHeight) {
        setVisible(false);
        return;
      }
      // First frame on entry jumps, so the lines don't sweep in from 0.
      const instant = !visible || s.reduceMotion;
      drive(springY, y, instant);
      drive(springX, s.snap ? (snappedX() ?? x) : x, instant);
      setVisible(true);
      if (s.showPill) {
        updateLabel(y);
      }
    };

    const onLeave = () => {
      rect = null;
      setVisible(false);
    };
    // Scrolling / resizing moves the container — re-measure on the next move.
    const invalidate = () => {
      rect = null;
    };

    // Snapped vertical line follows the hovered column without re-rendering.
    const unsubscribe = hoverStore?.subscribe(() => {
      if (!(visible && live.current.snap)) {
        return;
      }
      const x = snappedX();
      if (x !== null) {
        drive(springX, x, live.current.reduceMotion);
      }
    });

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate, { capture: true });
      window.removeEventListener("resize", invalidate);
      unsubscribe?.();
      clearTimeout(flowTimer);
      setCrosshairY(container, null);
    };
  }, [container, hoverStore, springX, springY]);

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      ref={rootRef}
      style={{ visibility: "hidden" }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 overflow-visible"
        height="100%"
        width="100%"
      >
        <g
          shapeRendering="crispEdges"
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeWidth={strokeWidth}
          transform={`translate(${margin.left},${margin.top})`}
        >
          {horizontal && (
            <m.line x1={0} x2={innerWidth} y1={springY} y2={springY} />
          )}
          {vertical && (
            <m.line x1={springX} x2={springX} y1={0} y2={innerHeight} />
          )}
        </g>
      </svg>
      {showPill && (
        <m.div
          className="absolute z-50 w-max"
          style={{
            top: margin.top,
            y: springY,
            ...(resolvedSide === "right"
              ? { left: margin.left + innerWidth + PILL_TEXT_INSET }
              : { right: `calc(100% - ${margin.left - PILL_TEXT_INSET}px)` }),
          }}
        >
          <div className="-translate-y-1/2 overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
            <div className="flex h-6 items-center whitespace-nowrap font-medium text-sm tabular-nums">
              {useFlow ? (
                <NumberFlow
                  format={format}
                  isolate
                  prefix={prefix}
                  spinTiming={NUMBER_FLOW_TIMING}
                  suffix={suffix}
                  transformTiming={NUMBER_FLOW_TIMING}
                  value={flowValue}
                />
              ) : (
                <span ref={labelRef} />
              )}
            </div>
          </div>
        </m.div>
      )}
    </div>,
    container
  );
});
