import {
  DashPathEffect,
  Group,
  LinearGradient,
  Path,
  vec,
} from "@shopify/react-native-skia";
import { type CurveFactory, curveNatural } from "d3-shape";
import { useMemo } from "react";
import { collectValues, useChart, withChartPlugin } from "./chart-context";
import { DATA_TWEEN_MS } from "./motion";
import {
  areaBuilder,
  type FadeEdges,
  lineBuilder,
  SeriesLayer,
  useKeyedMorph,
  useSeriesPoints,
} from "./series-paint";
import { withAlpha } from "./theme";

export interface BandProps {
  lowerKey: string;
  upperKey: string;
  label?: string;
  /** Default: theme primary. */
  fill?: string;
  /** "gradient" fades to `gradientToOpacity` at the band's bottom. Default: "solid". */
  fillType?: "solid" | "gradient";
  /** Default: 0.15 (web). */
  fillOpacity?: number;
  gradientToOpacity?: number;
  /** Edge stroke colour. Default: `fill`. */
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  /** e.g. `[3, 4]` (recipe). Omit for solid edges. */
  strokeDasharray?: number[];
  curve?: CurveFactory;
  /** Default: true (15%). */
  fadeEdges?: FadeEdges;
}

/** Range band between two keys with optional dashed edges (web `Band`). */
function BandImpl({
  lowerKey,
  upperKey,
  fill,
  fillType = "solid",
  fillOpacity = 0.15,
  gradientToOpacity = 0,
  stroke,
  strokeOpacity = 1,
  strokeWidth = 1,
  strokeDasharray,
  curve = curveNatural,
  fadeEdges = true,
}: BandProps) {
  const { theme } = useChart();
  const color = fill ?? theme.linePrimary;
  const edgeColor = stroke ?? color;

  const points = useSeriesPoints(lowerKey, upperKey);
  const { top, bottom } = useMemo(() => {
    const ys = points.points.flatMap((p) => [p.y, p.y0 ?? p.y]);
    return { top: Math.min(...ys), bottom: Math.max(...ys) };
  }, [points]);
  const buildArea = useMemo(() => areaBuilder(curve), [curve]);
  const buildLower = useMemo(() => lineBuilder(curve, "y"), [curve]);
  const buildUpper = useMemo(() => lineBuilder(curve, "y0"), [curve]);
  const area = useKeyedMorph(points, buildArea, DATA_TWEEN_MS);
  const lower = useKeyedMorph(points, buildLower, DATA_TWEEN_MS);
  const upper = useKeyedMorph(points, buildUpper, DATA_TWEEN_MS);
  const dash = strokeDasharray ? (
    <DashPathEffect intervals={strokeDasharray} />
  ) : null;

  return (
    <SeriesLayer fadeEdges={fadeEdges}>
      {fillType === "gradient" ? (
        <Path path={area}>
          <LinearGradient
            colors={[
              withAlpha(color, fillOpacity),
              withAlpha(color, gradientToOpacity),
            ]}
            end={vec(0, Number.isFinite(bottom) ? bottom : 0)}
            start={vec(0, Number.isFinite(top) ? top : 0)}
          />
        </Path>
      ) : (
        <Path color={withAlpha(color, fillOpacity)} path={area} />
      )}
      <Group opacity={strokeOpacity}>
        {[lower, upper].map((p, i) => (
          <Path
            color={edgeColor}
            key={i}
            path={p}
            strokeCap="round"
            strokeWidth={strokeWidth}
            style="stroke"
          >
            {dash}
          </Path>
        ))}
      </Group>
    </SeriesLayer>
  );
}

export const Band = withChartPlugin(BandImpl, {
  yValues: (props, data) =>
    collectValues(data, [props.lowerKey, props.upperKey]),
});
