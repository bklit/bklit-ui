"use client";

import { motion } from "motion/react";
import { useId, useMemo } from "react";
import { chartCssVars, useChartStable, useYScale } from "./chart-context";
import { type PatternPresetId, renderPatternPreset } from "./pattern-preset";
import {
  computeReferenceAreaRect,
  type ReferenceAreaIfOverflow,
} from "./reference-area-geometry";

const DEFAULT_FILL =
  "color-mix(in oklch, var(--chart-foreground-muted) 12%, transparent)";

export type ReferenceAreaStrokeStyle = "solid" | "dashed";

export interface ReferenceAreaProps {
  /** Lower Y data bound (extends to plot top when omitted). */
  y1?: number;
  /** Upper Y data bound (extends to plot bottom when omitted). */
  y2?: number;
  /** Starting X data coordinate (extends to plot left when omitted). */
  x1?: Date | number;
  /** Ending X data coordinate (extends to plot right when omitted). */
  x2?: Date | number;
  /** Y-scale group id. Default: `"left"`. */
  yAxisId?: string | number;
  /** Solid fill when `pattern` is `"none"`. */
  fill?: string;
  fillOpacity?: number;
  /** Pattern preset. `"none"` uses solid `fill`. */
  pattern?: PatternPresetId;
  /** Pattern stroke / tile color. */
  patternColor?: string;
  patternScale?: number;
  patternStrokeWidth?: number;
  patternRadius?: number;
  patternComplement?: boolean;
  patternFill?: string;
  patternDotFill?: boolean;
  patternTileBackground?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: ReferenceAreaStrokeStyle;
  /** Dash array when `strokeStyle` is `"dashed"`. Default: `"4,4"`. */
  strokeDasharray?: string;
  /** Fade fill and edge lines at left/right. Default: true */
  fadeEdges?: boolean;
  /** Horizontal fade zone as % of plot width per edge. Default: 10 */
  fadeEdgesLength?: number;
  /** Y-axis tick label color for values inside this band. */
  axisLabelColor?: string;
  /** Inward bracket markers at the horizontal center of the band. */
  showMarkers?: boolean;
  markerColor?: string;
  markerSize?: number;
  ifOverflow?: ReferenceAreaIfOverflow;
  className?: string;
}

const ENTER_FADE_MS = 420;

function clampFadeLength(length: number): number {
  return Math.min(45, Math.max(0, length));
}

function bracketMarkerPath(
  centerX: number,
  edgeY: number,
  size: number,
  direction: "down" | "up"
): string {
  const half = size / 2;
  if (direction === "down") {
    return `M ${centerX - half} ${edgeY} L ${centerX + half} ${edgeY} L ${centerX} ${edgeY + size} Z`;
  }
  return `M ${centerX - half} ${edgeY} L ${centerX + half} ${edgeY} L ${centerX} ${edgeY - size} Z`;
}

export function ReferenceArea({
  y1,
  y2,
  x1,
  x2,
  yAxisId,
  fill = DEFAULT_FILL,
  fillOpacity = 1,
  pattern = "none",
  patternColor = chartCssVars.foregroundMuted,
  patternScale = 1,
  patternStrokeWidth,
  patternRadius,
  patternComplement,
  patternFill,
  patternDotFill,
  patternTileBackground,
  stroke = chartCssVars.foregroundMuted,
  strokeWidth = 1,
  strokeStyle = "dashed",
  strokeDasharray = "4,4",
  fadeEdges = true,
  fadeEdgesLength = 10,
  showMarkers = false,
  markerColor = "var(--chart-1)",
  markerSize = 6,
  ifOverflow = "hidden",
  className,
}: ReferenceAreaProps) {
  const { innerWidth, innerHeight, xScale, isLoaded, enterTransition } =
    useChartStable();
  const yScale = useYScale(yAxisId);
  const uniqueId = useId().replace(/:/g, "");
  const patternId = `chart-reference-area-pattern-${uniqueId}`;
  const hMaskId = `chart-reference-area-fade-${uniqueId}`;
  const hGradientId = `${hMaskId}-gradient`;

  const rect = useMemo(
    () =>
      computeReferenceAreaRect({
        innerWidth,
        innerHeight,
        x1,
        x2,
        y1,
        y2,
        ifOverflow,
        xScale,
        yScale,
      }),
    [innerWidth, innerHeight, x1, x2, y1, y2, ifOverflow, xScale, yScale]
  );

  const usesPattern = pattern !== "none";
  const patternNode = useMemo(() => {
    if (!usesPattern) {
      return null;
    }
    return renderPatternPreset(pattern, patternId, {
      color: patternColor,
      scale: patternScale,
      strokeWidth: patternStrokeWidth,
      radius: patternRadius,
      complement: patternComplement,
      fill: patternFill,
      dotFill: patternDotFill,
      tileBackground: patternTileBackground,
    });
  }, [
    usesPattern,
    pattern,
    patternId,
    patternColor,
    patternScale,
    patternStrokeWidth,
    patternRadius,
    patternComplement,
    patternFill,
    patternDotFill,
    patternTileBackground,
  ]);

  const fadeEdge = clampFadeLength(fadeEdgesLength);
  const edgeMask = fadeEdges ? `url(#${hMaskId})` : undefined;
  const lineDash = strokeStyle === "dashed" ? strokeDasharray : undefined;

  if (!rect) {
    return null;
  }

  const { x, y, width, height } = rect;
  const topEdgeY = y;
  const bottomEdgeY = y + height;
  const centerX = x + width / 2;
  const targetOpacity = fillOpacity;
  const revealOpacity = isLoaded ? targetOpacity : 0;
  const enterFade =
    enterTransition && typeof enterTransition === "object"
      ? enterTransition
      : { duration: ENTER_FADE_MS / 1000, ease: "easeOut" as const };
  const areaFill = usesPattern && patternNode ? `url(#${patternId})` : fill;

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative reference band
    <g aria-hidden="true" className={className ?? "chart-reference-area"}>
      {edgeMask ? (
        <defs>
          <linearGradient id={hGradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0 }} />
            <stop
              offset={`${fadeEdge}%`}
              style={{ stopColor: "white", stopOpacity: 1 }}
            />
            <stop
              offset={`${100 - fadeEdge}%`}
              style={{ stopColor: "white", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "white", stopOpacity: 0 }}
            />
          </linearGradient>
          <mask id={hMaskId}>
            <rect
              fill={`url(#${hGradientId})`}
              height={innerHeight}
              width={innerWidth}
              x={0}
              y={0}
            />
          </mask>
        </defs>
      ) : null}
      {patternNode ? <defs>{patternNode}</defs> : null}
      <motion.rect
        animate={{ opacity: revealOpacity }}
        fill={areaFill}
        height={height}
        initial={{ opacity: 0 }}
        mask={edgeMask}
        transition={isLoaded ? enterFade : { duration: 0 }}
        width={width}
        x={x}
        y={y}
      />
      <g mask={edgeMask}>
        <line
          stroke={stroke}
          strokeDasharray={lineDash}
          strokeWidth={strokeWidth}
          x1={x}
          x2={x + width}
          y1={topEdgeY}
          y2={topEdgeY}
        />
        <line
          stroke={stroke}
          strokeDasharray={lineDash}
          strokeWidth={strokeWidth}
          x1={x}
          x2={x + width}
          y1={bottomEdgeY}
          y2={bottomEdgeY}
        />
      </g>
      {showMarkers ? (
        <>
          <path
            d={bracketMarkerPath(centerX, topEdgeY, markerSize, "down")}
            fill={markerColor}
          />
          <path
            d={bracketMarkerPath(centerX, bottomEdgeY, markerSize, "up")}
            fill={markerColor}
          />
        </>
      ) : null}
    </g>
  );
}

ReferenceArea.displayName = "ReferenceArea";

export default ReferenceArea;
