import { type SkFont, Text } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getDate, useChart } from "./chart-context";
import {
  CHART_EASING,
  DATA_TWEEN_MS,
  EASE_IN_OUT,
  HOVER_DIM_MS,
} from "./motion";
import { selectEvenlySpacedIndices } from "./x-axis-ticks";

export interface XAxisProps {
  /** Ticks to aim for, including first and last. Default: 5 (web). */
  numTicks?: number;
  /**
   * "data" (default): labels sit on data rows so they line up with the
   * crosshair. "domain": evenly spaced across the time domain.
   */
  tickMode?: "data" | "domain";
  formatLabel?: (date: Date) => string;
  color?: string;
}

const defaultFormat = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Labels fade back in over this many px past the date ticker (web: 20). */
const FADE_BUFFER = 20;
/** Keep edge labels this far inside the canvas. */
const EDGE_INSET = 4;

interface Tick {
  key: number;
  label: string;
  /** Centre x in px. */
  x: number;
}

function dedupe(ticks: Tick[]): Tick[] {
  const seen = new Set<string>();
  return ticks.filter((t) => {
    if (seen.has(t.label)) {
      return false;
    }
    seen.add(t.label);
    return true;
  });
}

/** Same tick rules as web XAxis (data-aligned, or domain when a forecast extends past the data). */
export function XAxis({
  numTicks = 5,
  tickMode = "data",
  formatLabel = defaultFormat,
  color,
}: XAxisProps) {
  const {
    data,
    xDataKey,
    width,
    height,
    margin,
    xScale,
    xs,
    theme,
    fonts,
    crosshairX,
    tooltipOpacity,
    tickerWidth,
  } = useChart();

  const ticks = useMemo<Tick[]>(() => {
    const [d0, d1] = xScale.domain();
    const last = data.at(-1);
    const extendsPastData =
      last !== undefined &&
      d1 !== undefined &&
      d1.getTime() > getDate(last, xDataKey).getTime();

    if (tickMode === "domain" || extendsPastData) {
      if (!(d0 && d1)) {
        return [];
      }
      const count = Math.max(2, numTicks);
      const span = d1.getTime() - d0.getTime();
      return dedupe(
        Array.from({ length: count }, (_, i) => {
          const date = new Date(d0.getTime() + (i / (count - 1)) * span);
          return {
            key: date.getTime(),
            label: formatLabel(date),
            x: xScale(date),
          };
        })
      );
    }

    const labels = data.map((d) => formatLabel(getDate(d, xDataKey)));
    const indices = selectEvenlySpacedIndices(data.length, numTicks, {
      labels,
      resolveXPx: (i) => xs[i] ?? i,
    });
    return dedupe(
      indices.map((i) => ({
        key: getDate(data[i] ?? {}, xDataKey).getTime(),
        label: labels[i] ?? "",
        x: xs[i] ?? 0,
      }))
    );
  }, [data, xDataKey, xScale, xs, numTicks, tickMode, formatLabel]);

  // Vertically centred on the date ticker pill.
  const y = height - margin.bottom / 2 + 4;

  return (
    <>
      {ticks.map((tick) => (
        <AxisLabel
          canvasWidth={width}
          center={tick.x}
          color={color ?? theme.label}
          crosshairX={crosshairX}
          font={fonts.axis}
          key={tick.key}
          text={tick.label}
          tickerWidth={tickerWidth}
          tooltipOpacity={tooltipOpacity}
          y={y}
        />
      ))}
    </>
  );
}

function AxisLabel({
  text,
  center,
  canvasWidth,
  y,
  font,
  color,
  crosshairX,
  tooltipOpacity,
  tickerWidth,
}: {
  text: string;
  center: number;
  canvasWidth: number;
  y: number;
  font: SkFont;
  color: string;
  crosshairX: SharedValue<number>;
  tooltipOpacity: SharedValue<number>;
  tickerWidth: SharedValue<number>;
}) {
  const w = Math.ceil(font.getTextWidth(text));
  // Centred on its point, nudged inside the canvas at the edges.
  const targetX = Math.min(
    Math.max(center - w / 2, EDGE_INSET),
    canvasWidth - w - EDGE_INSET
  );

  // Web: `left` tweens over the y-domain duration when ticks move.
  const x = useSharedValue(targetX);
  useEffect(() => {
    x.value = withTiming(targetX, {
      duration: DATA_TWEEN_MS,
      easing: CHART_EASING,
    });
  }, [x, targetX]);
  const mid = useDerivedValue(() => x.value + w / 2);

  // Hidden under the date ticker, fading back in just beyond it. Web eases
  // label opacity with `opacity 0.4s ease-in-out`.
  const target = useDerivedValue(() => {
    const half = tickerWidth.value / 2;
    if (half === 0 || tooltipOpacity.value === 0) {
      return 1;
    }
    const distance = Math.abs(mid.value - crosshairX.value);
    if (distance < half) {
      return 0;
    }
    if (distance < half + FADE_BUFFER) {
      return (distance - half) / FADE_BUFFER;
    }
    return 1;
  });
  const opacity = useSharedValue(1);
  useAnimatedReaction(
    () => target.value,
    (next, prev) => {
      if (prev !== null && next !== prev) {
        opacity.value = withTiming(next, {
          duration: HOVER_DIM_MS,
          easing: EASE_IN_OUT,
        });
      }
    }
  );

  return (
    <Text color={color} font={font} opacity={opacity} text={text} x={x} y={y} />
  );
}
