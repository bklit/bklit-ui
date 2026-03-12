"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { useChart } from "./chart-context";

const DEFAULT_POSITIVE = "url(#candlestick-positive)";
const DEFAULT_NEGATIVE = "url(#candlestick-negative)";

export interface CandlestickProps {
  /** Whether to animate the candlesticks. Default: true */
  animate?: boolean;
  /** Fill for positive (close >= open) candles. Color or url(#gradient). Default: --chart-1 */
  positiveFill?: string;
  /** Fill for negative candles. Color or url(#gradient). Default: --chart-5 */
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

const WICK_WIDTH = 1.5;

function getSolidColor(isPositive: boolean): string {
  return isPositive ? SOLID_POSITIVE : SOLID_NEGATIVE;
}

interface CandleShape {
  bodyHeight: number;
  bodyLeft: number;
  bodyTop: number;
  bodySolidFill: string;
  wickFill: string;
  wickHeight: number;
  wickLeft: number;
  wickTop: number;
  centerX: number;
  wickCenterY: number;
  candleWidth: number;
  bodyPattern: string | undefined;
  hasPatternOverlay: boolean;
  insideStrokeWidth: number;
  transition: { duration: number; ease: readonly number[] };
  delay: number;
  isFaded: boolean;
  fadedOpacity: number;
}

function CandleRect({
  bodyHeight,
  bodyLeft,
  bodyTop,
  bodySolidFill,
  wickFill,
  wickHeight,
  wickLeft,
  wickTop,
  centerX,
  wickCenterY,
  candleWidth,
  bodyPattern,
  hasPatternOverlay,
  insideStrokeWidth,
  transition,
  delay,
  isFaded,
  fadedOpacity,
}: CandleShape) {
  const bodyOrigin = `${centerX}px ${bodyTop + bodyHeight / 2}px`;
  const t = { ...transition, delay };
  return (
    <motion.g
      animate={{ opacity: isFaded ? fadedOpacity : 1 }}
      initial={{ opacity: 0 }}
      style={{ transformOrigin: `${centerX}px ${wickCenterY}px` }}
      transition={{ ...t, opacity: { duration: 0.15 } }}
    >
      <motion.rect
        animate={{ scaleY: 1 }}
        fill={wickFill}
        height={wickHeight}
        initial={{ scaleY: 0 }}
        style={{ transformOrigin: `${centerX}px ${wickCenterY}px` }}
        transition={t}
        width={WICK_WIDTH}
        x={wickLeft}
        y={wickTop}
      />
      <motion.rect
        animate={{ scaleY: 1 }}
        fill={bodySolidFill}
        height={bodyHeight}
        initial={{ scaleY: 0 }}
        rx={1}
        ry={1}
        stroke={bodySolidFill}
        strokeWidth={1}
        style={{ transformOrigin: bodyOrigin }}
        transition={t}
        width={candleWidth}
        x={bodyLeft}
        y={bodyTop}
      />
      {hasPatternOverlay && bodyPattern && (
        <motion.rect
          animate={{ scaleY: 1 }}
          fill={bodyPattern}
          height={bodyHeight}
          initial={{ scaleY: 0 }}
          rx={1}
          ry={1}
          style={{ transformOrigin: bodyOrigin }}
          transition={t}
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
          style={{ transformOrigin: bodyOrigin }}
          transition={t}
          width={candleWidth - insideStrokeWidth}
          x={bodyLeft + insideStrokeWidth / 2}
          y={bodyTop + insideStrokeWidth / 2}
        />
      )}
    </motion.g>
  );
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
        const wickTop = Math.min(yHigh, yLow);
        const wickHeight = Math.abs(yLow - yHigh) || 1;
        const wickLeft = centerX - WICK_WIDTH / 2;
        const wickCenterY = wickTop + wickHeight / 2;
        const isPositive = close >= open;
        const fill = isPositive ? positiveFill : negativeFill;
        const bodyPattern = isPositive
          ? bodyPatternPositive
          : bodyPatternNegative;
        const hasPatternOverlay = Boolean(bodyPattern);
        const bodySolidFill = hasPatternOverlay
          ? getSolidColor(isPositive)
          : fill;
        const wickFill = hasPatternOverlay ? bodySolidFill : fill;
        const isFaded =
          hoveredCandleIndex !== null && hoveredCandleIndex !== index;
        const delay = animate ? (index * staggerDelayMs) / 1000 : 0;

        return (
          <CandleRect
            bodyHeight={bodyHeight}
            bodyLeft={bodyLeft}
            bodyPattern={bodyPattern}
            bodySolidFill={bodySolidFill}
            bodyTop={bodyTop}
            candleWidth={candleWidth}
            centerX={centerX}
            delay={delay}
            fadedOpacity={fadedOpacity}
            hasPatternOverlay={hasPatternOverlay}
            insideStrokeWidth={insideStrokeWidth}
            isFaded={isFaded}
            key={xAccessor(d).getTime()}
            transition={transition}
            wickCenterY={wickCenterY}
            wickFill={wickFill}
            wickHeight={wickHeight}
            wickLeft={wickLeft}
            wickTop={wickTop}
          />
        );
      })}
    </g>
  );
}

Candlestick.displayName = "Candlestick";

export default Candlestick;
