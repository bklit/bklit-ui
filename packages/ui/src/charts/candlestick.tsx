"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { useChart } from "./chart-context";

const DEFAULT_POSITIVE = "url(#candlestick-positive)";
const DEFAULT_NEGATIVE = "url(#candlestick-negative)";

export interface CandlestickProps {
  /** Whether to animate the candlesticks. Default: true */
  animate?: boolean;
  /** Fill for positive (close >= open) candles. Color or url(#gradient). Default: emerald */
  positiveFill?: string;
  /** Fill for negative candles. Color or url(#gradient). Default: red */
  negativeFill?: string;
  /** Optional pattern URL for body only (e.g. url(#pattern)). When set, body is drawn solid first, then pattern overlaid and masked to the body rect. */
  bodyPatternPositive?: string;
  /** Optional pattern URL for negative candle body. */
  bodyPatternNegative?: string;
  /** Inner border width on the body (drawn inside so it does not expand the shape). Default: 0 (off). */
  insideStrokeWidth?: number;
  /** Opacity when another candle is hovered. Default: 0.3 */
  fadedOpacity?: number;
}

const SOLID_POSITIVE = "var(--color-emerald-500)";
const SOLID_NEGATIVE = "var(--color-red-500)";

function getSolidColor(isPositive: boolean): string {
  return isPositive ? SOLID_POSITIVE : SOLID_NEGATIVE;
}

function getWickStroke(fill: string, isPositive: boolean): string {
  if (fill.startsWith("url(") && fill.includes("#")) {
    return getSolidColor(isPositive);
  }
  return fill;
}

export function Candlestick({
  animate = true,
  positiveFill = DEFAULT_POSITIVE,
  negativeFill = DEFAULT_NEGATIVE,
  bodyPatternPositive,
  bodyPatternNegative,
  insideStrokeWidth = 0,
  fadedOpacity = 0.3,
}: CandlestickProps) {
  const {
    data,
    xScale,
    yScale,
    xAccessor,
    animationDuration,
    bandWidth,
    columnWidth,
    hoveredCandleIndex,
  } = useChart();

  const candleWidth = Math.min(bandWidth ?? columnWidth * 0.8, columnWidth);
  const staggerDelayMs = useMemo(() => {
    if (data.length === 0) {
      return 0;
    }
    return (animationDuration * 0.6) / data.length;
  }, [animationDuration, data.length]);

  const transition = useMemo(
    () => ({
      duration: 0.4,
      ease: [0.85, 0, 0.15, 1] as const,
    }),
    []
  );

  return (
    <g className="chart-candlesticks">
      {data.map((d, index) => {
        const date = xAccessor(d);
        const open = d.open as number;
        const high = d.high as number;
        const low = d.low as number;
        const close = d.close as number;

        const centerX = xScale(date) ?? 0;
        const yHigh = yScale(high) ?? 0;
        const yLow = yScale(low) ?? 0;
        const yOpen = yScale(open) ?? 0;
        const yClose = yScale(close) ?? 0;

        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.abs(yClose - yOpen) || 1;
        const bodyLeft = centerX - candleWidth / 2;

        const wickCenterY = (yHigh + yLow) / 2;
        const wickHalfLength = Math.abs(yHigh - yLow) / 2 || 0.5;

        const isPositive = close >= open;
        const fill = isPositive ? positiveFill : negativeFill;
        const bodyPattern = isPositive
          ? bodyPatternPositive
          : bodyPatternNegative;
        const hasPatternOverlay = Boolean(bodyPattern);
        const bodySolidFill = hasPatternOverlay
          ? getSolidColor(isPositive)
          : fill;
        const wickStroke = getWickStroke(fill, isPositive);
        const isFaded =
          hoveredCandleIndex !== null && hoveredCandleIndex !== index;

        const delay = animate ? (index * staggerDelayMs) / 1000 : 0;

        return (
          <motion.g
            animate={{ opacity: isFaded ? fadedOpacity : 1 }}
            initial={{ opacity: 0 }}
            key={xAccessor(d).getTime()}
            style={{ transformOrigin: `${centerX}px ${wickCenterY}px` }}
            transition={{
              ...transition,
              delay,
              opacity: { duration: 0.15 },
            }}
          >
            {/* Wick: draw in a group centered at wick center so scaleY grows from center */}
            <g transform={`translate(${centerX}, ${wickCenterY})`}>
              <motion.line
                animate={{ scaleY: 1 }}
                initial={{ scaleY: 0 }}
                stroke={wickStroke}
                strokeWidth={1.5}
                style={{ transformOrigin: "center center" }}
                transition={{ ...transition, delay }}
                x1={0}
                x2={0}
                y1={-wickHalfLength}
                y2={wickHalfLength}
              />
            </g>
            {/* Body: solid base, then optional pattern overlay (same bounds as body, no clipping). */}
            <motion.rect
              animate={{ scaleY: 1 }}
              fill={bodySolidFill}
              height={bodyHeight}
              initial={{ scaleY: 0 }}
              rx={1}
              ry={1}
              stroke={bodySolidFill}
              strokeWidth={1}
              style={{
                transformOrigin: `${centerX}px ${bodyTop + bodyHeight / 2}px`,
              }}
              transition={{ ...transition, delay }}
              width={candleWidth}
              x={bodyLeft}
              y={bodyTop}
            />
            {hasPatternOverlay && (
              <motion.rect
                animate={{ scaleY: 1 }}
                fill={bodyPattern}
                height={bodyHeight}
                initial={{ scaleY: 0 }}
                rx={1}
                ry={1}
                style={{
                  transformOrigin: `${centerX}px ${bodyTop + bodyHeight / 2}px`,
                }}
                transition={{ ...transition, delay }}
                width={candleWidth}
                x={bodyLeft}
                y={bodyTop}
              />
            )}
            {insideStrokeWidth > 0 && (
              <motion.rect
                animate={{ scaleY: 1 }}
                fill="none"
                height={bodyHeight - insideStrokeWidth}
                initial={{ scaleY: 0 }}
                rx={1}
                ry={1}
                stroke={bodySolidFill}
                strokeWidth={insideStrokeWidth}
                style={{
                  transformOrigin: `${centerX}px ${bodyTop + bodyHeight / 2}px`,
                }}
                transition={{ ...transition, delay }}
                width={candleWidth - insideStrokeWidth}
                x={bodyLeft + insideStrokeWidth / 2}
                y={bodyTop + insideStrokeWidth / 2}
              />
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

Candlestick.displayName = "Candlestick";

export default Candlestick;
