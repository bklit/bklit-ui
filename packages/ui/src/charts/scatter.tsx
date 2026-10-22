"use client";

import { useCallback, useId } from "react";
import { useChartStable } from "./chart-context";
import { scatterJitterOffset, useScatterJitter } from "./scatter-jitter";
import { SeriesMarkers, type SeriesMarkersProps } from "./series-markers";

/**
 * How non-active points are de-emphasised while hovering.
 * - `"opacity"` — fade to `inactiveOpacity` (default)
 * - `"blur"` — fade to `inactiveOpacity` and blur by `inactiveBlur` px
 */
export type ScatterInactiveMode = "opacity" | "blur";

export interface ScatterProps
  extends Omit<SeriesMarkersProps, "animate" | "getPointOffset"> {
  /** Y-scale group id (Recharts `yAxisId`). Default: `"left"`. */
  yAxisId?: string | number;
  /** Whether to animate points with clip reveal. Default: true */
  animate?: boolean;
  /**
   * Outer ring stroke width in px. Rings are opt-in — set e.g. `2` to draw an
   * offset ring around each point (see `ringGap`). Default: 0 (no ring)
   */
  strokeWidth?: number;
  /** Opacity for non-active points while hovering. Default: 0.3 */
  inactiveOpacity?: number;
  /** De-emphasis style for non-active points while hovering. Default: "opacity" */
  inactiveMode?: ScatterInactiveMode;
  /** Blur in px for non-active points when `inactiveMode="blur"`. Default: 2 */
  inactiveBlur?: number;
  /**
   * Color each dot by its vertical position using a chart-space linear gradient.
   * Lower values use `from`; higher values use `to`. Default stops: red (bottom) → green (top).
   */
  yGradient?: boolean | { from?: string; to?: string };
}

const DEFAULT_Y_GRADIENT_FROM = "var(--chart-negative, var(--color-red-500))";
const DEFAULT_Y_GRADIENT_TO = "var(--chart-positive, var(--color-emerald-500))";

export function Scatter({
  dataKey,
  fill,
  stroke,
  strokeWidth = 0,
  ringGap = 2,
  outlineWidth = 0,
  outlineColor,
  radius = 5,
  animate = true,
  fadeOnHover = true,
  inactiveOpacity = 0.3,
  inactiveMode = "opacity",
  inactiveBlur = 2,
  enterBlur = 2,
  showActiveHighlight = true,
  yGradient,
}: ScatterProps) {
  const { innerHeight } = useChartStable();
  const jitter = useScatterJitter();
  const getPointOffset = useCallback(
    (index: number, seriesIndex: number) =>
      jitter ? scatterJitterOffset(jitter, index, seriesIndex) : { x: 0, y: 0 },
    [jitter]
  );

  const yGradientConfig = (() => {
    if (!yGradient) {
      return null;
    }
    if (yGradient === true) {
      return { from: DEFAULT_Y_GRADIENT_FROM, to: DEFAULT_Y_GRADIENT_TO };
    }
    return {
      from: yGradient.from ?? DEFAULT_Y_GRADIENT_FROM,
      to: yGradient.to ?? DEFAULT_Y_GRADIENT_TO,
    };
  })();

  const yGradientId = `scatter-y-gradient-${useId().replace(/:/g, "")}`;
  const gradientFill = yGradientConfig ? `url(#${yGradientId})` : undefined;

  const resolvedFill = gradientFill ?? fill;
  const resolvedStroke = stroke ?? (gradientFill ? gradientFill : undefined);

  return (
    <>
      {yGradientConfig ? (
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={yGradientId}
            x1={0}
            x2={0}
            y1={innerHeight}
            y2={0}
          >
            <stop offset="0%" stopColor={yGradientConfig.from} />
            <stop offset="100%" stopColor={yGradientConfig.to} />
          </linearGradient>
        </defs>
      ) : null}
      <SeriesMarkers
        animate={animate}
        dataKey={dataKey}
        enterBlur={enterBlur}
        fadeOnHover={fadeOnHover}
        fill={resolvedFill}
        getPointOffset={jitter ? getPointOffset : undefined}
        inactiveBlur={inactiveMode === "blur" ? inactiveBlur : 0}
        inactiveOpacity={inactiveOpacity}
        outlineColor={outlineColor}
        outlineWidth={outlineWidth}
        radius={radius}
        ringGap={ringGap}
        showActiveHighlight={showActiveHighlight}
        stroke={resolvedStroke}
        strokeWidth={strokeWidth}
      />
    </>
  );
}

Scatter.displayName = "Scatter";

export default Scatter;
