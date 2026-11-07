import { DashPathEffect, Path } from "@shopify/react-native-skia";
import { type CurveFactory, curveNatural } from "d3-shape";
import { useMemo } from "react";
import { collectValues, useChart, withChartPlugin } from "./chart-context";
import { DATA_TWEEN_MS } from "./motion";
import {
  type FadeEdges,
  HighlightBand,
  lineBuilder,
  SeriesLayer,
  useDimOpacity,
  useKeyedMorph,
  useSeriesPoints,
} from "./series-paint";

export interface LineProps {
  dataKey: string;
  /** Tooltip label. Default: `dataKey`. */
  label?: string;
  /** Default: theme primary for the first series, secondary after. */
  stroke?: string;
  /** Default: 2.5 (matches web). */
  strokeWidth?: number;
  /** Dash pattern, e.g. `[6, 4]` for a forecast. Omit for solid. */
  strokeDasharray?: number[];
  /** Default: curveNatural (matches web). */
  curve?: CurveFactory;
  /** Fade the line out toward the left/right edges. Default: true. */
  fadeEdges?: FadeEdges;
  /** Dim the line and re-stroke a band around the scrubbed point. Default: true. */
  showHighlight?: boolean;
  /** Morph duration in ms when `data` changes. Default: 500 (web y-domain tween). */
  morphDuration?: number;
}

function LineImpl({
  dataKey,
  stroke,
  strokeWidth = 2.5,
  strokeDasharray,
  curve = curveNatural,
  fadeEdges = true,
  showHighlight = true,
  morphDuration = DATA_TWEEN_MS,
}: LineProps) {
  const { series } = useChart();
  const color =
    stroke ?? series.find((s) => s.dataKey === dataKey)?.stroke ?? "#6366f1";

  const points = useSeriesPoints(dataKey);
  const build = useMemo(() => lineBuilder(curve), [curve]);
  const path = useKeyedMorph(points, build, morphDuration);
  const opacity = useDimOpacity(showHighlight);
  const dash = strokeDasharray ? (
    <DashPathEffect intervals={strokeDasharray} />
  ) : null;

  return (
    <SeriesLayer fadeEdges={fadeEdges}>
      <Path
        color={color}
        opacity={opacity}
        path={path}
        strokeCap="round"
        strokeJoin="round"
        strokeWidth={strokeWidth}
        style="stroke"
      >
        {dash}
      </Path>
      {showHighlight ? (
        <HighlightBand>
          <Path
            color={color}
            path={path}
            strokeCap="round"
            strokeJoin="round"
            strokeWidth={strokeWidth}
            style="stroke"
          >
            {dash}
          </Path>
        </HighlightBand>
      ) : null}
    </SeriesLayer>
  );
}

export const Line = withChartPlugin(LineImpl, {
  series: (props, index, theme) => ({
    dataKey: props.dataKey,
    label: props.label ?? props.dataKey,
    stroke:
      props.stroke ?? (index === 0 ? theme.linePrimary : theme.lineSecondary),
    strokeWidth: props.strokeWidth ?? 2.5,
  }),
  yValues: (props, data) => collectValues(data, [props.dataKey]),
});
