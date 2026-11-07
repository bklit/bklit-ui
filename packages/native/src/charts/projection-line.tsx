import {
  DashPathEffect,
  LinearGradient,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useDerivedValue } from "react-native-reanimated";
import { getDate, useChart, withChartPlugin } from "./chart-context";
import { linearFit } from "./trend-line";

export interface ProjectionPoint {
  date: Date;
  value: number;
}

/**
 * Two-point linear-regression projection from the last row `horizon` steps
 * ahead (web `buildProjectionPath` with autoMethod "linearRegression").
 */
export function buildLinearProjection(
  data: Record<string, unknown>[],
  dataKey: string,
  horizon: number,
  xDataKey = "date"
): ProjectionPoint[] {
  const last = data.at(-1);
  const prev = data.at(-2);
  const fit = linearFit(data, xDataKey, dataKey);
  if (!(last && prev && fit)) {
    return [];
  }
  const t = getDate(last, xDataKey).getTime();
  const step = t - getDate(prev, xDataKey).getTime();
  const value = Number(last[dataKey]);
  return [
    { date: new Date(t), value },
    {
      date: new Date(t + step * horizon),
      value: value + fit.slope * step * horizon,
    },
  ];
}

export interface ProjectionLineProps {
  data: ProjectionPoint[];
  /** "bezier" eases out of and into horizontal tangents. Default: "linear". */
  curveKind?: "linear" | "bezier";
  /** Default: theme chart-3. */
  stroke?: string;
  /** "gradient" blends `gradientStart` → `gradientEnd` along the line. */
  strokeStyle?: "solid" | "gradient";
  gradientStart?: string;
  gradientEnd?: string;
  strokeWidth?: number;
  /** Default: [6, 4]. `[1, 4]` with round caps reads as dots (recipe). */
  strokeDasharray?: number[];
}

/** Dashed forecast from the last point (web `ProjectionLine`). */
function ProjectionLineImpl({
  data: points,
  curveKind = "linear",
  stroke,
  strokeStyle = "solid",
  gradientStart,
  gradientEnd,
  strokeWidth = 2,
  strokeDasharray = [6, 4],
}: ProjectionLineProps) {
  const { xScale, yScale, theme, revealProgress } = useChart();
  const color = stroke ?? theme.chart3;

  const { path, p0, p1 } = useMemo(() => {
    const b = Skia.PathBuilder.Make();
    const pts = points.map((p) => vec(xScale(p.date), yScale(p.value)));
    const a = pts[0];
    const z = pts.at(-1);
    if (!(a && z)) {
      return { path: b.build(), p0: vec(0, 0), p1: vec(0, 0) };
    }
    b.moveTo(a.x, a.y);
    if (curveKind === "bezier" && pts.length === 2) {
      const dx = z.x - a.x;
      b.cubicTo(a.x + 0.45 * dx, a.y, z.x - 0.45 * dx, z.y, z.x, z.y);
    } else {
      for (const p of pts.slice(1)) {
        b.lineTo(p.x, p.y);
      }
    }
    return { path: b.build(), p0: a, p1: z };
  }, [points, curveKind, xScale, yScale]);

  // Appears once the series has drawn in (web: shown from the reveal phase).
  const opacity = useDerivedValue(() => (revealProgress.value >= 1 ? 1 : 0));

  return (
    <Path
      color={color}
      opacity={opacity}
      path={path}
      strokeCap="round"
      strokeWidth={strokeWidth}
      style="stroke"
    >
      <DashPathEffect intervals={strokeDasharray} />
      {strokeStyle === "gradient" ? (
        <LinearGradient
          colors={[gradientStart ?? theme.linePrimary, gradientEnd ?? color]}
          end={p1}
          start={p0}
        />
      ) : null}
    </Path>
  );
}

export const ProjectionLine = withChartPlugin(ProjectionLineImpl, {
  yValues: (props) => props.data.map((p) => p.value),
  xValues: (props) => props.data.map((p) => p.date),
});
