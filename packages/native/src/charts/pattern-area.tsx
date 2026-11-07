import { Path } from "@shopify/react-native-skia";
import { type CurveFactory, curveMonotoneX } from "d3-shape";
import { useMemo } from "react";
import { collectValues, useChart, withChartPlugin } from "./chart-context";
import { usePlotRect } from "./fade-mask";
import { DATA_TWEEN_MS } from "./motion";
import { PatternFill, type PatternPreset } from "./patterns";
import {
  areaBuilder,
  type FadeEdges,
  SeriesLayer,
  useDimOpacity,
  useKeyedMorph,
  useSeriesPoints,
} from "./series-paint";

export interface PatternAreaProps {
  dataKey: string;
  label?: string;
  /** Default: "diagonal-up". */
  pattern?: PatternPreset;
  /** Pattern colour. Default: theme primary. */
  color?: string;
  scale?: number;
  strokeWidth?: number;
  /** Faint solid wash under the pattern (0 = none). Default: 0. */
  fillOpacity?: number;
  /** Default: curveMonotoneX (web PatternArea). */
  curve?: CurveFactory;
  /** Default: true. */
  fadeEdges?: FadeEdges;
}

/** Area filled with a pattern; pair with `<Area fillOpacity={0}>` for the stroke. */
function PatternAreaImpl({
  dataKey,
  pattern = "diagonal-up",
  color,
  scale = 1,
  strokeWidth = 1,
  fillOpacity = 0,
  curve = curveMonotoneX,
  fadeEdges = true,
}: PatternAreaProps) {
  const { yScale, theme } = useChart();
  const rect = usePlotRect();
  const tint = color ?? theme.linePrimary;
  const baseline = yScale.range()[0] ?? rect.y + rect.height;
  const opacity = useDimOpacity(true);

  const points = useSeriesPoints(dataKey, baseline);
  const build = useMemo(() => areaBuilder(curve), [curve]);
  const areaPath = useKeyedMorph(points, build, DATA_TWEEN_MS);

  return (
    <SeriesLayer fadeEdges={fadeEdges}>
      {fillOpacity > 0 ? (
        <Path color={tint} opacity={fillOpacity} path={areaPath} />
      ) : null}
      <PatternFill
        clip={areaPath}
        color={tint}
        opacity={opacity}
        preset={pattern}
        rect={rect}
        scale={scale}
        strokeWidth={strokeWidth}
      />
    </SeriesLayer>
  );
}

export const PatternArea = withChartPlugin(PatternAreaImpl, {
  yValues: (props, data) => collectValues(data, [props.dataKey]),
});
