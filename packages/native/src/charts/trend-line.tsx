import {
  DashPathEffect,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { getDate, getValue, useChart } from "./chart-context";
import { useEnterOpacity } from "./fade-mask";
import { DATA_TWEEN_MS } from "./motion";
import { useMorphPath } from "./series-paint";
import { withAlpha } from "./theme";

export interface TrendLineProps {
  dataKey: string;
  /** "dashed" (default, `6,4`), "solid" or "gradient". */
  strokeStyle?: "dashed" | "solid" | "gradient";
  /** Default: theme primary. */
  stroke?: string;
  /** Gradient start / end (recipe: chart-3 → chart-1). */
  gradientStart?: string;
  gradientEnd?: string;
  strokeWidth?: number;
  strokeDasharray?: number[];
  /** Fade both ends 15% along the line. Default: false. */
  fadeEdges?: boolean;
}

/** Least-squares fit of value against time. */
export function linearFit(
  data: Record<string, unknown>[],
  xKey: string,
  yKey: string
): { slope: number; intercept: number } | null {
  let n = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const d of data) {
    const y = getValue(d, yKey);
    if (y === null) {
      continue;
    }
    const x = getDate(d, xKey).getTime();
    n++;
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const denom = n * sxx - sx * sx;
  if (n < 2 || denom === 0) {
    return null;
  }
  const slope = (n * sxy - sx * sy) / denom;
  return { slope, intercept: (sy - slope * sx) / n };
}

/** Regression line across the data (web `TrendLine`). */
export function TrendLine({
  dataKey,
  strokeStyle = "dashed",
  stroke,
  gradientStart,
  gradientEnd,
  strokeWidth = 2,
  strokeDasharray = [6, 4],
  fadeEdges = false,
}: TrendLineProps) {
  const { data, xDataKey, xScale, yScale, theme } = useChart();
  const enter = useEnterOpacity();
  const color = stroke ?? theme.linePrimary;

  const { target, p0, p1 } = useMemo(() => {
    const fit = linearFit(data, xDataKey, dataKey);
    const dates = data.map((d) => getDate(d, xDataKey).getTime());
    const t0 = Math.min(...dates);
    const t1 = Math.max(...dates);
    const b = Skia.PathBuilder.Make();
    if (!(fit && Number.isFinite(t0))) {
      return { target: b.build(), p0: vec(0, 0), p1: vec(0, 0) };
    }
    const a = vec(xScale(new Date(t0)), yScale(fit.intercept + fit.slope * t0));
    const z = vec(xScale(new Date(t1)), yScale(fit.intercept + fit.slope * t1));
    b.moveTo(a.x, a.y);
    b.lineTo(z.x, z.y);
    return { target: b.build(), p0: a, p1: z };
  }, [data, xDataKey, dataKey, xScale, yScale]);

  const path = useMorphPath(target, DATA_TWEEN_MS);
  const start = gradientStart ?? theme.chart3;
  const end = gradientEnd ?? color;
  const gradient = strokeStyle === "gradient";
  const from = gradient ? start : color;
  const to = gradient ? end : color;
  const shaded = gradient || fadeEdges;

  return (
    <Group opacity={enter}>
      <Path
        color={color}
        path={path}
        strokeCap="round"
        strokeWidth={strokeWidth}
        style="stroke"
      >
        {strokeStyle === "dashed" ? (
          <DashPathEffect intervals={strokeDasharray} />
        ) : null}
        {shaded ? (
          <LinearGradient
            colors={
              fadeEdges
                ? [withAlpha(from, 0), from, to, withAlpha(to, 0)]
                : [from, to]
            }
            end={p1}
            positions={fadeEdges ? [0, 0.15, 0.85, 1] : [0, 1]}
            start={p0}
          />
        ) : null}
      </Path>
    </Group>
  );
}
