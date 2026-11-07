import { Circle, Group } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { getDate, getValue, useChart } from "./chart-context";

export interface LineSeriesTerminalMarkerProps {
  dataKey: string;
  /** Default: theme primary. */
  stroke?: string;
  /** Dot fill. Default: `stroke`. `"transparent"` for ring only. */
  fill?: string;
  /** Gap between point and ring. Default: 6 (recipe). */
  ringGap?: number;
  size?: number;
}

const ENTER_EASING = Easing.bezier(0.22, 1, 0.36, 1);

/** Dot and ring at the series' last point (web `LineSeriesTerminalMarker`). */
export function LineSeriesTerminalMarker({
  dataKey,
  stroke,
  fill,
  ringGap = 6,
  size = 5,
}: LineSeriesTerminalMarkerProps) {
  const {
    data,
    xDataKey,
    xScale,
    yScale,
    theme,
    animationDuration,
    reducedMotion,
  } = useChart();
  const color = stroke ?? theme.linePrimary;
  const point = useMemo(() => {
    for (let i = data.length - 1; i >= 0; i--) {
      const d = data[i] ?? {};
      const v = getValue(d, dataKey);
      if (v !== null) {
        return { x: xScale(getDate(d, xDataKey)), y: yScale(v) };
      }
    }
    return null;
  }, [data, dataKey, xDataKey, xScale, yScale]);

  // Fades and scales in (0.55 → 1, 280ms) once the line has drawn.
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withDelay(
        animationDuration,
        withTiming(1, { duration: 280, easing: ENTER_EASING })
      );
    }
  }, [progress, reducedMotion, animationDuration]);
  const transform = useDerivedValue(() => [
    { scale: 0.55 + 0.45 * progress.value },
  ]);

  if (!point) {
    return null;
  }
  return (
    <Group
      opacity={progress}
      origin={{ x: point.x, y: point.y }}
      transform={transform}
    >
      <Circle color={fill ?? color} cx={point.x} cy={point.y} r={size} />
      <Circle
        color={color}
        cx={point.x}
        cy={point.y}
        r={size + ringGap + 0.75}
        strokeWidth={1.5}
        style="stroke"
      />
    </Group>
  );
}
