import {
  controlGroup,
  curveControl,
  dataGroup,
  designGroup,
  lineGroup,
  patternControl,
} from "./sidebar-control-templates";
import type { StudioControlGroup } from "./types";

export const gaugeControlGroups: StudioControlGroup[] = [
  designGroup([
    patternControl(),
    { type: "number", key: "value", label: "Fill %", min: 0, max: 100 },
    {
      type: "opacity",
      key: "inactiveFillOpacity",
      label: "Track opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "var(--muted)",
    },
    {
      type: "opacity",
      key: "activeFillOpacity",
      label: "Active opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "boolean", key: "useGradient", label: "Gradient fills" },
    { type: "boolean", key: "uniformWidth", label: "Uniform width" },
  ]),
  controlGroup("Center", [
    {
      type: "number",
      key: "centerValue",
      label: "Center value",
      min: 0,
      max: 999_999,
      step: 1000,
      input: "number",
    },
    { type: "text", key: "gaugeLabel", label: "Center label" },
  ]),
  controlGroup("Notches", [
    { type: "number", key: "totalNotches", label: "Notches", min: 8, max: 80 },
    { type: "number", key: "spacing", label: "Spacing", min: 0, max: 50 },
    {
      type: "number",
      key: "notchCornerRadius",
      label: "Corner radius",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "notchLengthPercent",
      label: "Notch length %",
      min: 5,
      max: 100,
    },
  ]),
  controlGroup("Arc", [
    {
      type: "angle",
      key: "startAngle",
      label: "Start angle",
      min: 0,
      max: 360,
    },
    {
      type: "angle",
      key: "endAngle",
      label: "End angle",
      min: 180,
      max: 450,
    },
  ]),
];

export const seriesMarkersControlGroup = controlGroup("Markers", [
  { type: "boolean", key: "seriesShowMarkers", label: "Show markers" },
  {
    type: "number",
    key: "seriesMarkerRadius",
    label: "Radius",
    min: 3,
    max: 12,
    step: 1,
  },
  {
    type: "number",
    key: "seriesMarkerRingGap",
    label: "Ring gap",
    min: 0,
    max: 8,
    step: 1,
  },
  {
    type: "number",
    key: "seriesMarkerRingWidth",
    label: "Ring width",
    min: 0,
    max: 6,
    step: 0.5,
  },
]);

export const seriesDashTailControlGroup = controlGroup("Dash tail", [
  { type: "boolean", key: "seriesDashTail", label: "Dashed tail" },
  {
    type: "number",
    key: "seriesDashFromIndex",
    label: "Dash from index",
    min: 0,
    max: 48,
    step: 1,
  },
  { type: "text", key: "seriesDashArray", label: "Dash array" },
]);

export const areaChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  designGroup([
    patternControl(),
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Fill opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "opacity",
      key: "gradientToOpacity",
      label: "Gradient bottom",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "transparent",
    },
  ]),
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 0,
      max: 4,
      step: 0.5,
    },
    { type: "boolean", key: "showLine", label: "Show line" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
    { type: "boolean", key: "fadeEdges", label: "Fade edges" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

export const lineChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "fadeEdges", label: "Fade edges" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

export const barChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  controlGroup("Series", [
    {
      type: "select",
      key: "barSeriesMode",
      label: "Series mode",
      options: [
        { value: "grouped", label: "Grouped" },
        { value: "stacked", label: "Stacked" },
      ],
    },
    { type: "orientation", key: "barOrientation", label: "Orientation" },
    {
      type: "number",
      key: "barGap",
      label: "Bar gap",
      min: 0,
      max: 0.6,
      step: 0.05,
    },
    {
      type: "number",
      key: "barWidth",
      label: "Bar width (px)",
      min: 0,
      max: 48,
      input: "number",
    },
    {
      type: "number",
      key: "groupGap",
      label: "Group gap",
      min: 0,
      max: 16,
    },
    { type: "lineCap", key: "barLineCap", label: "Line cap" },
  ]),
  designGroup([
    patternControl(),
    {
      type: "opacity",
      key: "barFadedOpacity",
      label: "Faded opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
];

export const composedChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  designGroup([
    patternControl(),
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Area opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-4)",
    },
    {
      type: "number",
      key: "composedBarRadius",
      label: "Bar radius",
      min: 0,
      max: 12,
    },
  ]),
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Line width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "fadeEdges", label: "Line fade edges" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

export const pieChartControlGroups: StudioControlGroup[] = [
  designGroup([
    { type: "pieFill", key: "pieFillMode", label: "Fill" },
    { type: "pieHoverEffect", key: "pieHoverEffect", label: "Hover effect" },
    {
      type: "number",
      key: "pieSize",
      label: "Scale %",
      min: 50,
      max: 100,
    },
  ]),
  controlGroup("Geometry", [
    {
      type: "innerRadius",
      key: "innerRadius",
      label: "Inner radius",
      min: 0,
      max: 120,
    },
    {
      type: "number",
      key: "padAngle",
      label: "Pad angle",
      min: 0,
      max: 0.1,
      step: 0.01,
    },
    {
      type: "number",
      key: "pieCornerRadius",
      label: "Corner radius",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "pieHoverOffset",
      label: "Hover offset",
      min: 0,
      max: 24,
    },
    {
      type: "angle",
      key: "pieStartAngleDeg",
      label: "Start angle",
      min: -180,
      max: 360,
      variant: "pieStart",
    },
    {
      type: "angle",
      key: "pieEndAngleDeg",
      label: "End angle",
      min: 0,
      max: 720,
      variant: "pieEnd",
    },
  ]),
];

export const ringChartControlGroups: StudioControlGroup[] = [
  designGroup([
    {
      type: "number",
      key: "pieSize",
      label: "Scale %",
      min: 50,
      max: 100,
      preview: "ringScale",
    },
    {
      type: "number",
      key: "strokeWidth",
      label: "Ring width",
      min: 4,
      max: 24,
      preview: "ringWidth",
    },
    {
      type: "number",
      key: "ringGap",
      label: "Ring gap",
      min: 0,
      max: 20,
      preview: "ringGap",
    },
    {
      type: "innerRadius",
      key: "ringBaseInnerRadius",
      label: "Inner radius",
      min: 40,
      max: 100,
    },
  ]),
];

export const radarChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    {
      type: "number",
      key: "radarSize",
      label: "Scale %",
      min: 50,
      max: 100,
      input: "number",
    },
    {
      type: "number",
      key: "radarMargin",
      label: "Margin",
      min: 24,
      max: 100,
    },
    {
      type: "number",
      key: "radarLevels",
      label: "Grid levels",
      min: 3,
      max: 8,
    },
    { type: "boolean", key: "showRadarGrid", label: "Grid labels" },
  ]),
  controlGroup("Shape", [
    { type: "boolean", key: "radarShowPoints", label: "Show points" },
    { type: "boolean", key: "radarShowStroke", label: "Show stroke" },
  ]),
];

export const candlestickChartControlGroups: StudioControlGroup[] = [
  designGroup([
    patternControl(),
    {
      type: "opacity",
      key: "candleFadedOpacity",
      label: "Faded opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "boolean", key: "candleUseGradient", label: "Gradient fills" },
  ]),
  controlGroup("Candles", [
    {
      type: "number",
      key: "candleGap",
      label: "Candle gap",
      min: 0,
      max: 0.5,
      step: 0.05,
    },
    { type: "boolean", key: "candleShowDots", label: "Tooltip dots" },
  ]),
];

export const funnelChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    { type: "number", key: "funnelLayers", label: "Layers", min: 1, max: 5 },
    {
      type: "number",
      key: "funnelGap",
      label: "Segment gap",
      min: 0,
      max: 16,
    },
    { type: "orientation", key: "funnelOrientation", label: "Orientation" },
    { type: "funnelEdges", key: "funnelEdges", label: "Edges" },
  ]),
  controlGroup("Labels", [
    { type: "boolean", key: "funnelShowValues", label: "Show values" },
    { type: "boolean", key: "funnelShowLabels", label: "Show labels" },
    { type: "boolean", key: "funnelShowPercentage", label: "Show %" },
  ]),
];

export const scatterChartControlGroups: StudioControlGroup[] = [
  controlGroup("Points", [
    {
      type: "number",
      key: "scatterRadius",
      label: "Radius",
      min: 3,
      max: 14,
      step: 1,
    },
    {
      type: "number",
      key: "scatterRingGap",
      label: "Ring gap",
      min: 0,
      max: 8,
      step: 1,
    },
    {
      type: "number",
      key: "scatterRingWidth",
      label: "Ring width",
      min: 0,
      max: 6,
      step: 0.5,
    },
  ]),
  controlGroup("Interaction", [
    { type: "boolean", key: "scatterFadeOnHover", label: "Fade on hover" },
    {
      type: "opacity",
      key: "scatterInactiveOpacity",
      label: "Inactive opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "boolean", key: "scatterSecondSeries", label: "Second series" },
    {
      type: "boolean",
      key: "scatterShowActiveHighlight",
      label: "Highlight active point",
    },
  ]),
];

export const liveLineChartControlGroups: StudioControlGroup[] = [
  controlGroup("Stream", [
    {
      type: "number",
      key: "liveInterval",
      label: "Interval (ms)",
      min: 200,
      max: 2000,
      step: 100,
      input: "number",
    },
    {
      type: "number",
      key: "liveWindow",
      label: "Window (sec)",
      min: 10,
      max: 120,
      input: "number",
    },
    {
      type: "number",
      key: "liveLerpSpeed",
      label: "Lerp speed",
      min: 0.02,
      max: 0.2,
      step: 0.01,
    },
    { type: "boolean", key: "livePaused", label: "Paused" },
  ]),
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Stroke width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "liveFill", label: "Area fill" },
    { type: "boolean", key: "livePulse", label: "Live pulse" },
    { type: "boolean", key: "liveBadge", label: "Value badge" },
    { type: "boolean", key: "liveExaggerate", label: "Tight Y-axis" },
  ]),
];

export const choroplethChartControlGroups: StudioControlGroup[] = [
  designGroup([
    { type: "boolean", key: "choroplethAnalytics", label: "Visitor analytics" },
    { type: "graticuleToggle", key: "showGraticule", label: "Graticule" },
    {
      type: "pattern",
      key: "choroplethBgPattern",
      label: "Background pattern",
    },
    {
      type: "pattern",
      key: "choroplethFgPattern",
      label: "Foreground pattern",
    },
  ]),
];

export const sankeyChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    {
      type: "number",
      key: "sankeyNodePadding",
      label: "Node padding",
      min: 4,
      max: 32,
    },
    {
      type: "number",
      key: "sankeyNodeWidth",
      label: "Node width",
      min: 8,
      max: 32,
    },
    {
      type: "opacity",
      key: "linkOpacity",
      label: "Link opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
];
