import { Group, LinearGradient, Path, vec } from "@shopify/react-native-skia";
import { type CurveFactory, curveMonotoneX } from "d3-shape";
import { useMemo } from "react";
import { collectValues, useChart, withChartPlugin } from "./chart-context";
import { DATA_TWEEN_MS } from "./motion";
import {
  areaBuilder,
  type FadeEdges,
  HighlightBand,
  lineBuilder,
  SeriesLayer,
  useDimOpacity,
  useKeyedMorph,
  useSeriesPoints,
} from "./series-paint";
import { withAlpha } from "./theme";

export interface AreaProps {
  dataKey: string;
  /** Tooltip label. Default: `dataKey`. */
  label?: string;
  /** Fill colour (gradient start). Default: theme primary / secondary. */
  fill?: string;
  /** Gradient start opacity. Default: 0.4 (matches web). */
  fillOpacity?: number;
  /** Line colour. Default: same as `fill`. */
  stroke?: string;
  /** Default: 2 (matches web). */
  strokeWidth?: number;
  /** Default: curveMonotoneX (matches web `Area`). */
  curve?: CurveFactory;
  /** Fade fill and stroke toward the left/right edges. Default: true. */
  fadeEdges?: FadeEdges;
  /** Dim the series and re-stroke a band around the scrubbed point. Default: true. */
  showHighlight?: boolean;
  /** Morph duration in ms when `data` changes. Default: 500 (web y-domain tween). */
  morphDuration?: number;
}

function AreaImpl({
  dataKey,
  fill,
  fillOpacity = 0.4,
  stroke,
  strokeWidth = 2,
  curve = curveMonotoneX,
  fadeEdges = true,
  showHighlight = true,
  morphDuration = DATA_TWEEN_MS,
}: AreaProps) {
  const { yScale, series, height, margin } = useChart();
  const seriesColor =
    series.find((s) => s.dataKey === dataKey)?.stroke ?? "#6366f1";
  const fillColor = fill ?? seriesColor;
  const strokeColor = stroke ?? fillColor;
  const baseline = yScale.range()[0] ?? height - margin.bottom;

  const points = useSeriesPoints(dataKey, baseline);
  const buildArea = useMemo(() => areaBuilder(curve), [curve]);
  const buildLine = useMemo(() => lineBuilder(curve), [curve]);
  const areaPath = useKeyedMorph(points, buildArea, morphDuration);
  const linePath = useKeyedMorph(points, buildLine, morphDuration);
  const opacity = useDimOpacity(showHighlight);

  const stroked = (
    <Path
      color={strokeColor}
      path={linePath}
      strokeCap="round"
      strokeJoin="round"
      strokeWidth={strokeWidth}
      style="stroke"
    />
  );

  return (
    <SeriesLayer fadeEdges={fadeEdges}>
      <Group opacity={opacity}>
        <Path path={areaPath}>
          <LinearGradient
            colors={[
              withAlpha(fillColor, fillOpacity),
              withAlpha(fillColor, 0),
            ]}
            end={vec(0, baseline)}
            start={vec(0, margin.top)}
          />
        </Path>
        {stroked}
      </Group>
      {showHighlight ? <HighlightBand>{stroked}</HighlightBand> : null}
    </SeriesLayer>
  );
}

export const Area = withChartPlugin(AreaImpl, {
  series: (props, index, theme) => ({
    dataKey: props.dataKey,
    label: props.label ?? props.dataKey,
    stroke:
      props.stroke ??
      props.fill ??
      (index === 0 ? theme.linePrimary : theme.lineSecondary),
    strokeWidth: props.strokeWidth ?? 2,
  }),
  yValues: (props, data) => collectValues(data, [props.dataKey]),
});
