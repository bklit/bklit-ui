import {
  DashPathEffect,
  Group,
  Rect,
  Line as SkLine,
  vec,
} from "@shopify/react-native-skia";
import { useChart, withChartPlugin } from "./chart-context";
import { EdgeFade, useEnterOpacity, usePlotRect } from "./fade-mask";
import { withAlpha } from "./theme";

export interface ReferenceAreaProps {
  /** Value range (horizontal band). */
  y1?: number;
  y2?: number;
  /** Date range (vertical band). */
  x1?: Date;
  x2?: Date;
  /** Default: foregroundMuted at 12% (web DEFAULT_FILL). */
  fill?: string;
  fillOpacity?: number;
  /** Edge lines. Default: "dashed". */
  strokeStyle?: "solid" | "dashed" | "none";
  stroke?: string;
  strokeDasharray?: number[];
  /** Fade fill and edges left/right. Default: true. */
  fadeEdges?: boolean;
  /** % of plot width per side. Default: 10. */
  fadeEdgesLength?: number;
}

/** Solid band over a value or date range (web `ReferenceArea`). */
function ReferenceAreaImpl({
  y1,
  y2,
  x1,
  x2,
  fill,
  fillOpacity = 1,
  strokeStyle = "dashed",
  stroke,
  strokeDasharray = [4, 4],
  fadeEdges = true,
  fadeEdgesLength = 10,
}: ReferenceAreaProps) {
  const { xScale, yScale, theme } = useChart();
  const plot = usePlotRect();
  const enter = useEnterOpacity();

  const top = y2 === undefined ? plot.y : yScale(Math.max(y1 ?? y2, y2));
  const bottom =
    y1 === undefined ? plot.y + plot.height : yScale(Math.min(y1, y2 ?? y1));
  const left = x1 ? xScale(x1) : plot.x;
  const right = x2 ? xScale(x2) : plot.x + plot.width;
  const band = {
    x: Math.max(plot.x, left),
    y: Math.max(plot.y, top),
    width: Math.max(
      0,
      Math.min(plot.x + plot.width, right) - Math.max(plot.x, left)
    ),
    height: Math.max(
      0,
      Math.min(plot.y + plot.height, bottom) - Math.max(plot.y, top)
    ),
  };
  const lineColor = stroke ?? theme.foregroundMuted;
  const horizontal = x1 === undefined && x2 === undefined;
  const edges = horizontal
    ? [
        [vec(band.x, band.y), vec(band.x + band.width, band.y)],
        [
          vec(band.x, band.y + band.height),
          vec(band.x + band.width, band.y + band.height),
        ],
      ]
    : [
        [vec(band.x, band.y), vec(band.x, band.y + band.height)],
        [
          vec(band.x + band.width, band.y),
          vec(band.x + band.width, band.y + band.height),
        ],
      ];
  const fade = fadeEdges && horizontal ? fadeEdgesLength : 0;

  return (
    <Group opacity={enter}>
      <EdgeFade left={fade} rect={plot} right={fade}>
        <Rect
          color={fill ?? withAlpha(theme.foregroundMuted, 0.12)}
          height={band.height}
          opacity={fillOpacity}
          width={band.width}
          x={band.x}
          y={band.y}
        />
        {strokeStyle === "none"
          ? null
          : edges.map(([p1, p2], i) => (
              <SkLine color={lineColor} key={i} p1={p1} p2={p2} strokeWidth={1}>
                {strokeStyle === "dashed" ? (
                  <DashPathEffect intervals={strokeDasharray} />
                ) : null}
              </SkLine>
            ))}
      </EdgeFade>
    </Group>
  );
}

export const ReferenceArea = withChartPlugin(ReferenceAreaImpl, {
  yValues: (props) =>
    [props.y1, props.y2].filter((v): v is number => v !== undefined),
});
