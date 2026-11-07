import { Group, Path, rect } from "@shopify/react-native-skia";
import { type CurveFactory, curveMonotoneX } from "d3-shape";
import { useMemo } from "react";
import { collectValues, useChart, withChartPlugin } from "./chart-context";
import { DATA_TWEEN_MS } from "./motion";
import {
  type FadeEdges,
  lineBuilder,
  SeriesLayer,
  useKeyedMorph,
  useSeriesPoints,
} from "./series-paint";

export interface ProfitLossLineProps {
  dataKey: string;
  /** Tooltip label. Default: "Profit/Loss". */
  label?: string;
  strokeWidth?: number;
  positiveColor?: string;
  negativeColor?: string;
  /** Default: curveMonotoneX (smooth, no false zero crossings). */
  curve?: CurveFactory;
  /** Default: true. */
  fadeEdges?: FadeEdges;
}

/**
 * Sign-coloured line: one continuous curve drawn twice and clipped above /
 * below zero, so it stays smooth through crossings.
 */
function ProfitLossLineImpl({
  dataKey,
  strokeWidth = 2.5,
  positiveColor,
  negativeColor,
  curve = curveMonotoneX,
  fadeEdges = true,
}: ProfitLossLineProps) {
  const { yScale, width, height, theme } = useChart();

  const points = useSeriesPoints(dataKey);
  const build = useMemo(() => lineBuilder(curve), [curve]);
  const path = useKeyedMorph(points, build, DATA_TWEEN_MS);
  const zeroY = yScale(0);

  const sides = [
    {
      key: "pos",
      color: positiveColor ?? theme.positive,
      clip: rect(0, 0, width, zeroY),
    },
    {
      key: "neg",
      color: negativeColor ?? theme.negative,
      clip: rect(0, zeroY, width, Math.max(0, height - zeroY)),
    },
  ];

  return (
    <SeriesLayer fadeEdges={fadeEdges}>
      {sides.map((side) => (
        <Group clip={side.clip} key={side.key}>
          <Path
            color={side.color}
            path={path}
            strokeCap="round"
            strokeJoin="round"
            strokeWidth={strokeWidth}
            style="stroke"
          />
        </Group>
      ))}
    </SeriesLayer>
  );
}

export const ProfitLossLine = withChartPlugin(ProfitLossLineImpl, {
  series: (props, _index, theme) => ({
    dataKey: props.dataKey,
    label: props.label ?? "Profit/Loss",
    stroke: props.positiveColor ?? theme.positive,
    strokeWidth: props.strokeWidth ?? 2.5,
    signColors: {
      positive: props.positiveColor ?? theme.positive,
      negative: props.negativeColor ?? theme.negative,
    },
  }),
  yValues: (props, data) => collectValues(data, [props.dataKey]),
});
