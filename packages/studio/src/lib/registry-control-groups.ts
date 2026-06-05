import {
  controlGroup,
  curveControl,
  dataGroup,
  designGroup,
  lineGroup,
} from "./sidebar-control-templates";
import type { StudioControlGroup } from "./types";

const chartAccentColorOptions = [
  { value: "var(--color-muted-foreground)", label: "Muted" },
  { value: "var(--foreground)", label: "Foreground" },
  { value: "var(--border)", label: "Border" },
  { value: "var(--chart-grid)", label: "Grid" },
  { value: "var(--chart-crosshair)", label: "Crosshair" },
  { value: "var(--color-emerald-500)", label: "Emerald" },
  { value: "var(--color-red-500)", label: "Red" },
] as const;

export const gaugeControlGroups: StudioControlGroup[] = [
  designGroup([
    {
      type: "number",
      key: "value",
      label: "Fill",
      min: 0,
      max: 100,
      unit: "%",
    },
    {
      type: "opacity",
      key: "inactiveFillOpacity",
      label: "Track",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "var(--muted)",
    },
    {
      type: "opacity",
      key: "activeFillOpacity",
      label: "Active",
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
      label: "Value",
      min: 0,
      max: 999_999,
      step: 1000,
      input: "number",
    },
    { type: "text", key: "gaugeLabel", label: "Label" },
    { type: "text", key: "gaugeCenterPrefix", label: "Prefix" },
    { type: "text", key: "gaugeCenterSuffix", label: "Suffix" },
  ]),
  controlGroup("Notches", [
    { type: "number", key: "totalNotches", label: "Count", min: 8, max: 80 },
    { type: "number", key: "spacing", label: "Spacing", min: 0, max: 50 },
    {
      type: "number",
      key: "notchCornerRadius",
      label: "Corner",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "notchLengthPercent",
      label: "Length",
      min: 5,
      max: 100,
      unit: "%",
    },
  ]),
  controlGroup("Arc", [
    {
      type: "angle",
      key: "startAngle",
      label: "Start",
      min: 0,
      max: 360,
    },
    {
      type: "angle",
      key: "endAngle",
      label: "End",
      min: 180,
      max: 450,
    },
  ]),
];

export const seriesMarkersControlGroup = controlGroup("Markers", [
  { type: "boolean", key: "seriesShowMarkers", label: "Show" },
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
    label: "Gap",
    min: 0,
    max: 8,
    step: 1,
  },
  {
    type: "number",
    key: "seriesMarkerRingWidth",
    label: "Width",
    min: 0,
    max: 6,
    step: 0.5,
  },
]);

export const seriesDashTailControlGroup = controlGroup("Dash tail", [
  { type: "boolean", key: "seriesDashTail", label: "Dash" },
  {
    type: "number",
    key: "seriesDashFromIndex",
    label: "From index",
    min: 0,
    max: 48,
    step: 1,
  },
  { type: "text", key: "seriesDashArray", label: "Dash array" },
]);

/** Line, marker, and dash controls for each area-chart series layer. */
export const areaSeriesLineControlGroups: StudioControlGroup[] = [
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Width",
      min: 0,
      max: 4,
      step: 0.5,
    },
    { type: "boolean", key: "showLine", label: "Show line" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
    { type: "fadeEdges", key: "fadeEdges", label: "Fade edges" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

/** Line + marker controls for each composed-chart overlay series (index ≥ 1). */
export const composedOverlayLineControlGroups: StudioControlGroup[] = [
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "fadeEdges", key: "fadeEdges", label: "Fade edges" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

export const areaChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  designGroup([
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "opacity",
      key: "gradientToOpacity",
      label: "Bottom",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "transparent",
    },
  ]),
  ...areaSeriesLineControlGroups,
];

export const lineChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "fadeEdges", key: "fadeEdges", label: "Fade edges" },
    { type: "boolean", key: "showHighlight", label: "Highlight on hover" },
  ]),
  seriesMarkersControlGroup,
  seriesDashTailControlGroup,
];

export const tooltipAppearanceControlGroup = controlGroup("Appearance", [
  {
    type: "opacity",
    key: "tooltipBackgroundOpacity",
    label: "Background",
    min: 0.2,
    max: 1,
    step: 0.05,
    color: "var(--chart-tooltip-background)",
  },
  {
    type: "number",
    key: "tooltipBlur",
    label: "Blur",
    min: 0,
    max: 24,
    step: 1,
    unit: "px",
  },
]);

export const standardCrosshairControlGroup = controlGroup("Crosshair", [
  { type: "boolean", key: "showCrosshair", label: "Show" },
  { type: "boolean", key: "showTooltipDots", label: "Dots" },
  {
    type: "select",
    key: "crosshairColor",
    label: "Color",
    options: [...chartAccentColorOptions],
  },
]);

export const standardChartTooltipControlGroups: StudioControlGroup[] = [
  controlGroup("Tooltip", [
    { type: "boolean", key: "showTooltipDatePill", label: "Date pill" },
  ]),
  tooltipAppearanceControlGroup,
  standardCrosshairControlGroup,
];

export const standardLegendControlGroups: StudioControlGroup[] = [
  controlGroup("Legend", [
    { type: "boolean", key: "showLegend", label: "Show" },
    { type: "legendPosition", key: "legendPlacement", label: "Placement" },
    { type: "orientation", key: "legendLayout", label: "Orientation" },
    {
      type: "number",
      key: "legendFontSize",
      label: "Font size",
      min: 10,
      max: 18,
      step: 1,
      unit: "px",
    },
    { type: "boolean", key: "legendShowProgress", label: "Progress bars" },
    { type: "boolean", key: "legendShowMarker", label: "Markers" },
    { type: "boolean", key: "legendShowValue", label: "Values" },
  ]),
];

function lineChartSettingsGroup(
  mode: "standard" | "profitLoss"
): StudioControlGroup {
  const controls: StudioControlGroup["controls"] = [
    {
      type: "select",
      key: "lineChartMode",
      label: "Line type",
      options: [
        { value: "standard", label: "Standard" },
        { value: "profitLoss", label: "Profit / loss" },
      ],
    },
  ];

  if (mode === "standard") {
    controls.push({
      type: "select",
      key: "lineChartState",
      label: "State",
      options: [
        { value: "ready", label: "Ready" },
        { value: "loading", label: "Loading" },
      ],
    });
  }

  return controlGroup("Settings", controls);
}

const profitLossDataGroup = controlGroup("Data", [
  {
    type: "number",
    key: "dataPoints",
    label: "Points",
    min: 3,
    max: 365,
    step: 1,
  },
]);

const profitLossLineSettingsGroups: StudioControlGroup[] = [
  lineGroup([
    curveControl(),
    {
      type: "number",
      key: "strokeWidth",
      label: "Width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "fadeEdges", key: "fadeEdges", label: "Fade edges" },
  ]),
  controlGroup("Zero line", [
    { type: "boolean", key: "showZeroLine", label: "Show" },
    {
      type: "select",
      key: "zeroLineStroke",
      label: "Color",
      options: [...chartAccentColorOptions],
    },
    {
      type: "number",
      key: "zeroLineStrokeWidth",
      label: "Width",
      min: 0.5,
      max: 4,
      step: 0.5,
    },
    {
      type: "select",
      key: "zeroLineStyle",
      label: "Style",
      options: [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
      ],
    },
  ]),
  controlGroup("Tooltip", [
    { type: "text", key: "tooltipLabel", label: "Label" },
    { type: "boolean", key: "showTooltipDots", label: "Show dot" },
    { type: "boolean", key: "showTooltipDatePill", label: "Show date pill" },
  ]),
  tooltipAppearanceControlGroup,
  controlGroup("Crosshair", [
    { type: "boolean", key: "showCrosshair", label: "Show crosshair" },
    {
      type: "boolean",
      key: "crosshairFollowsValue",
      label: "Color follows value",
    },
    {
      type: "select",
      key: "crosshairColor",
      label: "Fixed color",
      options: [...chartAccentColorOptions],
    },
  ]),
  ...standardLegendControlGroups,
];

export function getLineChartControlGroups(state: {
  lineChartMode: "standard" | "profitLoss";
}): StudioControlGroup[] {
  if (state.lineChartMode === "profitLoss") {
    return [
      lineChartSettingsGroup("profitLoss"),
      profitLossDataGroup,
      ...profitLossLineSettingsGroups,
    ];
  }

  return [lineChartSettingsGroup("standard"), ...lineChartControlGroups];
}

export const profitLossLineChartControlGroups = getLineChartControlGroups({
  lineChartMode: "profitLoss",
});

export const barChartControlGroups: StudioControlGroup[] = [
  dataGroup(),
  controlGroup("Series", [
    {
      type: "select",
      key: "barSeriesMode",
      label: "Mode",
      options: [
        { value: "grouped", label: "Grouped" },
        { value: "stacked", label: "Stacked" },
      ],
    },
    { type: "orientation", key: "barOrientation", label: "Orientation" },
    {
      type: "number",
      key: "barGap",
      label: "Gap",
      min: 0,
      max: 0.6,
      step: 0.05,
    },
    {
      type: "number",
      key: "barWidth",
      label: "Width",
      min: 0,
      max: 48,
      input: "number",
      unit: "px",
    },
    {
      type: "number",
      key: "groupGap",
      label: "Groups",
      min: 0,
      max: 16,
    },
    { type: "lineCap", key: "barLineCap", label: "Line cap" },
  ]),
  designGroup([
    {
      type: "opacity",
      key: "barFadedOpacity",
      label: "Faded",
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
    {
      type: "opacity",
      key: "fillOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-4)",
    },
    {
      type: "number",
      key: "composedBarRadius",
      label: "Radius",
      min: 0,
      max: 12,
      unit: "px",
    },
  ]),
  ...composedOverlayLineControlGroups,
];

export const pieChartControlGroups: StudioControlGroup[] = [
  controlGroup("Chart", [
    {
      type: "number",
      key: "pieSize",
      label: "Scale",
      min: 50,
      max: 100,
      unit: "%",
    },
    {
      type: "innerRadius",
      key: "innerRadius",
      label: "Inner",
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
      label: "Corner",
      min: 0,
      max: 12,
    },
    {
      type: "number",
      key: "pieHoverOffset",
      label: "Offset",
      min: 0,
      max: 24,
    },
    {
      type: "angle",
      key: "pieStartAngleDeg",
      label: "Start",
      min: -180,
      max: 360,
      variant: "pieStart",
    },
    {
      type: "angle",
      key: "pieEndAngleDeg",
      label: "End",
      min: 0,
      max: 720,
      variant: "pieEnd",
    },
    { type: "pieHoverEffect", key: "pieHoverEffect", label: "Hover effect" },
  ]),
];

export const pieCenterControlGroup = controlGroup("Center", [
  { type: "text", key: "pieCenterLabel", label: "Label" },
  { type: "text", key: "pieCenterPrefix", label: "Prefix" },
  { type: "text", key: "pieCenterSuffix", label: "Suffix" },
]);

export const ringCenterControlGroup = controlGroup("Center", [
  { type: "text", key: "ringCenterLabel", label: "Label" },
  { type: "text", key: "ringCenterPrefix", label: "Prefix" },
  { type: "text", key: "ringCenterSuffix", label: "Suffix" },
]);

export const ringChartControlGroups: StudioControlGroup[] = [
  designGroup([
    {
      type: "number",
      key: "pieSize",
      label: "Scale",
      min: 50,
      max: 100,
      preview: "ringScale",
      unit: "%",
    },
    {
      type: "number",
      key: "ringStrokeWidth",
      label: "Width",
      min: 4,
      max: 24,
      preview: "ringWidth",
    },
    {
      type: "number",
      key: "ringGap",
      label: "Gap",
      min: 0,
      max: 20,
      preview: "ringGap",
    },
    {
      type: "innerRadius",
      key: "ringBaseInnerRadius",
      label: "Inner",
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
      label: "Scale",
      min: 50,
      max: 100,
      input: "number",
      unit: "%",
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
      label: "Levels",
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
    {
      type: "opacity",
      key: "candleFadedOpacity",
      label: "Faded",
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
      label: "Gap",
      min: 0,
      max: 0.5,
      step: 0.05,
    },
    { type: "boolean", key: "candleShowDots", label: "Dots" },
  ]),
];

export const funnelChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    { type: "number", key: "funnelLayers", label: "Layers", min: 1, max: 5 },
    {
      type: "number",
      key: "funnelGap",
      label: "Gap",
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
      label: "Gap",
      min: 0,
      max: 8,
      step: 1,
    },
    {
      type: "number",
      key: "scatterRingWidth",
      label: "Width",
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
      label: "Inactive",
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
      label: "Interval",
      min: 200,
      max: 2000,
      step: 100,
      input: "number",
      unit: "ms",
    },
    {
      type: "number",
      key: "liveWindow",
      label: "Window",
      min: 10,
      max: 120,
      input: "number",
      unit: "s",
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
      label: "Width",
      min: 1,
      max: 5,
      step: 0.5,
    },
    { type: "boolean", key: "liveFill", label: "Fill" },
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
      label: "Background",
    },
    {
      type: "pattern",
      key: "choroplethFgPattern",
      label: "Foreground",
    },
  ]),
];

export const sankeyChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    {
      type: "number",
      key: "sankeyNodePadding",
      label: "Padding",
      min: 4,
      max: 32,
    },
    {
      type: "number",
      key: "sankeyNodeWidth",
      label: "Width",
      min: 8,
      max: 32,
    },
    {
      type: "opacity",
      key: "linkOpacity",
      label: "Links",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
];
