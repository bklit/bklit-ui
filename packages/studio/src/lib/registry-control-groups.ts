import { CHOROPLETH_ZOOM_EASE_OPTIONS } from "./choropleth-studio-options";
import { brushPatternDetailControls } from "./pattern-control-groups";
import {
  barCollapsibleGroup,
  controlGroup,
  curveControl,
  dataGroup,
  designGroup,
  lineGroup,
} from "./sidebar-control-templates";
import type { StudioUrlState } from "./studio-parsers";
import type { StudioControl, StudioControlGroup } from "./types";

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
  controlGroup("Settings", [
    {
      type: "boolean",
      key: "gaugeLinear",
      label: "Linear",
    },
  ]),
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
  controlGroup("Track", [
    {
      type: "opacity",
      key: "inactiveFillOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "var(--muted)",
    },
  ]),
  controlGroup("Center", [
    { type: "boolean", key: "gaugeShowLabel", label: "Show label" },
    {
      type: "number",
      key: "centerValue",
      label: "Value",
      min: 0,
      max: 999_999,
      step: 1000,
      input: "number",
      visibleWhen: { key: "gaugeShowLabel", truthy: true },
    },
    {
      type: "text",
      key: "gaugeLabel",
      label: "Label",
      visibleWhen: { key: "gaugeShowLabel", truthy: true },
    },
    {
      type: "text",
      key: "gaugeCenterPrefix",
      label: "Prefix",
      visibleWhen: { key: "gaugeShowLabel", truthy: true },
    },
    {
      type: "text",
      key: "gaugeCenterSuffix",
      label: "Suffix",
      visibleWhen: { key: "gaugeShowLabel", truthy: true },
    },
    {
      type: "legendPosition",
      key: "gaugeLabelPlacement",
      label: "Position",
      visibleWhen: [
        { key: "gaugeShowLabel", truthy: true },
        { key: "gaugeLinear", truthy: true },
      ],
    },
  ]),
  controlGroup("Notches", [
    { type: "number", key: "totalNotches", label: "Count", min: 8, max: 120 },
    {
      type: "number",
      key: "spacing",
      label: "Spacing",
      min: 0,
      max: 75,
      unit: "%",
      input: "studio",
    },
    {
      type: "number",
      key: "progressBarHeight",
      label: "Bar height",
      min: 12,
      max: 80,
      unit: "px",
      visibleWhen: { key: "gaugeLinear", truthy: true },
    },
    {
      type: "number",
      key: "notchWidthPercent",
      label: "Notch width",
      min: 10,
      max: 100,
      unit: "%",
      visibleWhen: { key: "gaugeLinear", truthy: true },
    },
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
      label: "Depth",
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
      visibleWhen: { key: "gaugeLinear", truthy: false },
    },
    {
      type: "angle",
      key: "endAngle",
      label: "End",
      min: 180,
      max: 450,
      visibleWhen: { key: "gaugeLinear", truthy: false },
    },
  ]),
];

export const gridControlGroups: StudioControlGroup[] = [
  controlGroup("Lines", [
    { type: "boolean", key: "gridHorizontal", label: "Horizontal" },
    { type: "boolean", key: "gridVertical", label: "Vertical" },
    {
      type: "number",
      key: "gridNumTicksRows",
      label: "Row ticks",
      min: 2,
      max: 12,
      step: 1,
      visibleWhen: { key: "gridHorizontal", truthy: true },
    },
    {
      type: "number",
      key: "gridNumTicksColumns",
      label: "Column ticks",
      min: 2,
      max: 20,
      step: 1,
      visibleWhen: { key: "gridVertical", truthy: true },
    },
  ]),
  controlGroup("Stroke", [
    { type: "color", key: "gridStroke", label: "Color" },
    {
      type: "opacity",
      key: "gridStrokeOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-grid)",
    },
    {
      type: "number",
      key: "gridStrokeWidth",
      label: "Width",
      min: 0.5,
      max: 4,
      step: 0.5,
    },
    { type: "text", key: "gridStrokeDasharray", label: "Dash array" },
  ]),
  controlGroup("Edges", [
    {
      type: "boolean",
      key: "gridFadeHorizontal",
      label: "Fade Horizontally",
      visibleWhen: { key: "gridHorizontal", truthy: true },
    },
    {
      type: "boolean",
      key: "gridFadeVertical",
      label: "Fade Vertically",
      visibleWhen: { key: "gridVertical", truthy: true },
    },
    {
      type: "boolean",
      key: "gridHideHorizontalEdgeLines",
      label: "Hide horizontal edge lines",
      visibleWhen: { key: "gridHorizontal", truthy: true },
    },
    {
      type: "boolean",
      key: "gridHideVerticalEdgeLines",
      label: "Hide vertical edge lines",
      visibleWhen: { key: "gridVertical", truthy: true },
    },
  ]),
];

const referenceAreaBoundsControls: StudioControlGroup["controls"] = [
  {
    type: "number",
    key: "referenceAreaY1",
    label: "Y1",
    min: 0,
    max: 500,
    step: 1,
  },
  {
    type: "number",
    key: "referenceAreaY2",
    label: "Y2",
    min: 0,
    max: 500,
    step: 1,
  },
];

export const referenceAreaBoundsControlGroup = controlGroup(
  "Reference range",
  referenceAreaBoundsControls
);

export const barReferenceAreaBoundsControlGroup = barCollapsibleGroup(
  "Reference range",
  referenceAreaBoundsControls
);

/** Trend line layer controls; `seriesOptions` lists the chart's fittable series. */
export function trendLineControlGroups(
  seriesOptions: { value: string; label: string }[]
): StudioControlGroup[] {
  return [
    controlGroup("Series", [
      {
        type: "select",
        key: "trendLineSeries",
        label: "Fit series",
        options: seriesOptions,
      },
    ]),
    controlGroup("Stroke", [
      {
        type: "strokeStyle",
        key: "trendLineStrokeStyle",
        label: "Style",
        options: ["solid", "dashed", "gradient"],
      },
      {
        type: "text",
        key: "trendLineDashArray",
        label: "Dash array",
        visibleWhen: { key: "trendLineStrokeStyle", equals: "dashed" },
      },
      {
        type: "color",
        key: "trendLineGradientStart",
        label: "Gradient start",
        visibleWhen: { key: "trendLineStrokeStyle", equals: "gradient" },
      },
      {
        type: "color",
        key: "trendLineGradientEnd",
        label: "Gradient end",
        visibleWhen: { key: "trendLineStrokeStyle", equals: "gradient" },
      },
      { type: "color", key: "trendLineColor", label: "Color" },
      {
        type: "number",
        key: "trendLineStrokeWidth",
        label: "Width",
        min: 1,
        max: 6,
        step: 0.5,
      },
      {
        type: "number",
        key: "trendLineOpacity",
        label: "Opacity",
        min: 0,
        max: 1,
        step: 0.05,
      },
    ]),
    controlGroup("Edges", [
      { type: "fadeEdges", key: "trendLineFadeEdges", label: "Fade edges" },
      {
        type: "number",
        key: "trendLineFadeEdgesLength",
        label: "Fade length",
        min: 0,
        max: 45,
        step: 1,
        unit: "%",
        visibleWhen: { key: "trendLineFadeEdges", not: "none" },
      },
    ]),
  ];
}

export const referenceAreaControlGroups: StudioControlGroup[] = [
  controlGroup("Bounds", referenceAreaBoundsControls),
  controlGroup("Fill", [
    { type: "referenceAreaFill", key: "referenceAreaFill", label: "Fill" },
  ]),
  controlGroup("Stroke", [
    { type: "color", key: "referenceAreaStroke", label: "Color" },
    {
      type: "strokeStyle",
      key: "referenceAreaStrokeStyle",
      label: "Style",
    },
    {
      type: "text",
      key: "referenceAreaStrokeDasharray",
      label: "Dash array",
      visibleWhen: { key: "referenceAreaStrokeStyle", equals: "dashed" },
    },
  ]),
  controlGroup("Markers", [
    {
      type: "boolean",
      key: "referenceAreaShowMarkers",
      label: "Show bracket markers",
    },
    { type: "color", key: "referenceAreaMarkerColor", label: "Marker color" },
  ]),
  controlGroup("Axis", [
    {
      type: "referenceAreaYAxis",
      key: "referenceAreaYAxis",
      label: "Y axis",
    },
    {
      type: "color",
      key: "referenceAreaAxisLabelColor",
      label: "Label color",
    },
  ]),
];

/** `<Weekends>` layer on date-axis charts (`<prefix>.weekends`). */
export const weekendsControlGroups: StudioControlGroup[] = [
  controlGroup("Days", [
    {
      type: "select",
      key: "weekendsDays",
      label: "Weekend",
      options: [
        { value: "sat-sun", label: "Saturday + Sunday" },
        { value: "fri-sat", label: "Friday + Saturday" },
        { value: "sun", label: "Sunday only" },
      ],
    },
    {
      type: "select",
      key: "weekendsAlign",
      label: "Align",
      options: [
        { value: "auto", label: "Auto" },
        { value: "calendar", label: "Calendar (midnight)" },
        { value: "centered", label: "Centered on points" },
      ],
    },
  ]),
  controlGroup("Fill", [
    {
      type: "select",
      key: "weekendsFillType",
      label: "Type",
      options: [
        { value: "pattern", label: "Diagonal stripes" },
        { value: "solid", label: "Solid" },
      ],
    },
    { type: "color", key: "weekendsColor", label: "Color" },
    {
      type: "number",
      key: "weekendsOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.01,
      format: { style: "percent" },
    },
    {
      type: "number",
      key: "weekendsPatternScale",
      label: "Scale",
      min: 0.1,
      max: 3,
      step: 0.1,
      input: "number",
      visibleWhen: { key: "weekendsFillType", equals: "pattern" },
    },
  ]),
];

/** `<Deadline>` layer on date-axis charts (`<prefix>.deadline`). */
export const deadlineControlGroups: StudioControlGroup[] = [
  controlGroup("Date", [
    {
      type: "number",
      key: "deadlinePosition",
      label: "Position",
      min: 0,
      max: 1,
      step: 0.01,
      format: { style: "percent" },
    },
    { type: "text", key: "deadlineLabel", label: "Label" },
  ]),
  controlGroup("Region", [
    {
      type: "select",
      key: "deadlineFillType",
      label: "Fill",
      options: [
        { value: "pattern", label: "Diagonal stripes" },
        { value: "gradient", label: "Gradient" },
        { value: "solid", label: "Solid" },
        { value: "none", label: "None (line only)" },
      ],
    },
    { type: "color", key: "deadlineColor", label: "Color" },
    {
      type: "number",
      key: "deadlineOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.01,
      format: { style: "percent" },
      visibleWhen: { key: "deadlineFillType", not: "none" },
    },
    {
      type: "number",
      key: "deadlinePatternScale",
      label: "Scale",
      min: 0.1,
      max: 3,
      step: 0.1,
      input: "number",
      visibleWhen: { key: "deadlineFillType", equals: "pattern" },
    },
    {
      type: "boolean",
      key: "deadlineFade",
      label: "Fade out",
      visibleWhen: { key: "deadlineFillType", not: "none" },
    },
    {
      type: "number",
      key: "deadlineFadeLength",
      label: "Fade length",
      min: 0,
      max: 1,
      step: 0.05,
      format: { style: "percent" },
      visibleWhen: { key: "deadlineFade", truthy: true },
    },
  ]),
  controlGroup("Line", [
    { type: "boolean", key: "deadlineShowLine", label: "Show line" },
    {
      type: "number",
      key: "deadlineStrokeWidth",
      label: "Width",
      min: 0.5,
      max: 4,
      step: 0.5,
      visibleWhen: { key: "deadlineShowLine", truthy: true },
    },
    {
      type: "strokeStyle",
      key: "deadlineStrokeStyle",
      label: "Style",
      visibleWhen: { key: "deadlineShowLine", truthy: true },
    },
  ]),
];

const bandBollinger = { key: "bandMode", equals: "bollinger" } as const;
const bandGap = { key: "bandMode", equals: "gap" } as const;
/** Per-series bands take each series' color, so the color pickers hide. */
const bandFirstSeries = { key: "bandSeries", equals: "first" } as const;

/** Line chart `<Band>` layer (`line.band`). */
export const bandControlGroups: StudioControlGroup[] = [
  controlGroup("Source", [
    {
      type: "select",
      key: "bandMode",
      label: "Mode",
      options: [
        { value: "range", label: "Range (upper / lower)" },
        { value: "bollinger", label: "Bollinger bands" },
        { value: "gap", label: "Gap (series 1 vs 2)" },
      ],
    },
    {
      type: "select",
      key: "bandSeries",
      visibleWhen: { key: "bandMode", not: "gap" },
      label: "Series",
      options: [
        { value: "first", label: "First series" },
        { value: "all", label: "Every series (own color)" },
      ],
    },
    {
      type: "number",
      key: "bandSpread",
      label: "Spread",
      min: 0,
      max: 0.5,
      step: 0.01,
      format: { style: "percent" },
      visibleWhen: { key: "bandMode", equals: "range" },
    },
    {
      type: "number",
      key: "bandPeriod",
      label: "Period",
      min: 2,
      max: 30,
      step: 1,
      visibleWhen: bandBollinger,
    },
    {
      type: "number",
      key: "bandMultiplier",
      label: "Std. dev.",
      min: 0.5,
      max: 4,
      step: 0.25,
      visibleWhen: bandBollinger,
    },
    {
      type: "select",
      key: "bandWarmup",
      label: "Warm-up",
      options: [
        { value: "gap", label: "Gap until window fills" },
        { value: "partial", label: "Partial window" },
      ],
      visibleWhen: bandBollinger,
    },
    {
      type: "boolean",
      key: "bandShowMiddle",
      label: "Show SMA",
      visibleWhen: bandBollinger,
    },
    { type: "boolean", key: "bandShowInTooltip", label: "Tooltip range" },
  ]),
  controlGroup("Fill", [
    {
      type: "select",
      key: "bandFillType",
      label: "Type",
      options: [
        { value: "solid", label: "Solid" },
        { value: "gradient", label: "Gradient" },
        { value: "pattern", label: "Pattern" },
      ],
    },
    {
      type: "color",
      key: "bandFill",
      label: "Color",
      visibleWhen: bandFirstSeries,
    },
    {
      type: "opacity",
      key: "bandFillOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "opacity",
      key: "bandGradientToOpacity",
      label: "Gradient to",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      visibleWhen: { key: "bandFillType", equals: "gradient" },
    },
    {
      type: "boolean",
      key: "bandNegativeFillEnabled",
      label: "Negative fill",
      visibleWhen: bandGap,
    },
    {
      type: "color",
      key: "bandNegativeFill",
      label: "Negative color",
      visibleWhen: [bandGap, { key: "bandNegativeFillEnabled", truthy: true }],
    },
    {
      type: "pattern",
      key: "bandPattern",
      label: "Pattern",
      visibleWhen: { key: "bandFillType", equals: "pattern" },
    },
    {
      type: "color",
      key: "bandPatternColor",
      label: "Pattern color",
      visibleWhen: { key: "bandFillType", equals: "pattern" },
    },
    {
      type: "number",
      key: "bandPatternScale",
      label: "Scale",
      min: 0.1,
      max: 3,
      step: 0.1,
      input: "number",
      visibleWhen: { key: "bandFillType", equals: "pattern" },
    },
    {
      type: "number",
      key: "bandPatternStrokeWidth",
      label: "Pattern stroke",
      min: 0.5,
      max: 4,
      step: 0.5,
      visibleWhen: { key: "bandFillType", equals: "pattern" },
    },
    {
      type: "opacity",
      key: "bandPatternOpacity",
      label: "Pattern opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      visibleWhen: { key: "bandFillType", equals: "pattern" },
    },
  ]),
  controlGroup("Stroke", [
    { type: "boolean", key: "bandShowUpperStroke", label: "Upper edge" },
    { type: "boolean", key: "bandShowLowerStroke", label: "Lower edge" },
    {
      type: "color",
      key: "bandStroke",
      label: "Color",
      visibleWhen: bandFirstSeries,
    },
    {
      type: "number",
      key: "bandStrokeWidth",
      label: "Width",
      min: 0.5,
      max: 4,
      step: 0.5,
    },
    {
      type: "select",
      key: "bandStrokeStyle",
      label: "Style",
      options: [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
        { value: "dotted", label: "Dotted" },
      ],
    },
    {
      type: "text",
      key: "bandStrokeDasharray",
      label: "Dash array",
      visibleWhen: { key: "bandStrokeStyle", equals: "dashed" },
    },
    {
      type: "opacity",
      key: "bandStrokeOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
  controlGroup("Fade edges", [
    { type: "boolean", key: "bandFadeTop", label: "Top" },
    { type: "boolean", key: "bandFadeRight", label: "Right" },
    { type: "boolean", key: "bandFadeBottom", label: "Bottom" },
    { type: "boolean", key: "bandFadeLeft", label: "Left" },
    {
      type: "number",
      key: "bandFadeSize",
      label: "Size",
      min: 0.05,
      max: 0.5,
      step: 0.01,
      format: { style: "percent" },
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
    visibleWhen: { key: "seriesShowMarkers", truthy: true },
  },
  {
    type: "number",
    key: "seriesMarkerRingGap",
    label: "Gap",
    min: 0,
    max: 8,
    step: 1,
    visibleWhen: { key: "seriesShowMarkers", truthy: true },
  },
  {
    type: "number",
    key: "seriesMarkerRingWidth",
    label: "Width",
    min: 0,
    max: 6,
    step: 0.5,
    visibleWhen: { key: "seriesShowMarkers", truthy: true },
  },
]);

/** Projection anchor at the last data point (line chart, per series). */
export const lineSeriesTerminalMarkerControlGroup = controlGroup(
  "Terminal marker",
  [
    { type: "boolean", key: "seriesTerminalMarkerShow", label: "Show" },
    { type: "color", key: "seriesTerminalMarkerFill", label: "Dot" },
    { type: "color", key: "seriesTerminalMarkerRingColor", label: "Ring" },
    {
      type: "number",
      key: "seriesTerminalMarkerRingGap",
      label: "Ring offset",
      min: 0,
      max: 8,
      step: 1,
    },
  ],
  { collapsible: true, defaultOpen: false }
);

export const seriesDashTailControlGroup = controlGroup("Dash tail", [
  { type: "boolean", key: "seriesDashTail", label: "Dash" },
  {
    type: "number",
    key: "seriesDashFromIndex",
    label: "From index",
    min: 0,
    max: 48,
    step: 1,
    input: "studio",
    visibleWhen: { key: "seriesDashTail", truthy: true },
  },
  {
    type: "text",
    key: "seriesDashArray",
    label: "Dash array",
    visibleWhen: { key: "seriesDashTail", truthy: true },
  },
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

const loadingStyleControl = {
  type: "select" as const,
  key: "loadingStyle" as const,
  label: "Loading style",
  options: [
    { value: "pulse", label: "Pulse" },
    { value: "sweep", label: "Sweep" },
  ],
};

export const areaChartControlGroups: StudioControlGroup[] = [
  controlGroup("Settings", [
    {
      type: "select",
      key: "areaChartState",
      label: "State",
      options: [
        { value: "ready", label: "Ready" },
        { value: "loading", label: "Loading" },
      ],
    },
    { type: "boolean", key: "areaShowValue", label: "Show values" },
    {
      type: "number",
      key: "areaValueLabelMinCount",
      label: "Minimum values",
      min: 0,
      max: 30,
      step: 1,
      visibleWhen: { key: "areaShowValue", truthy: true },
    },
    {
      type: "number",
      key: "areaValueLabelMaxCount",
      label: "Maximum values",
      min: 0,
      max: 30,
      step: 1,
      visibleWhen: { key: "areaShowValue", truthy: true },
    },
    {
      type: "boolean",
      key: "areaFadeValueLabels",
      label: "Fade values at edges",
      visibleWhen: { key: "areaShowValue", truthy: true },
    },
    {
      ...loadingStyleControl,
      visibleWhen: { key: "areaChartState", equals: "loading" },
    },
  ]),
  dataGroup(),
  referenceAreaBoundsControlGroup,
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
      type: "number",
      key: "fadeLeft",
      label: "Fade left",
      min: 0,
      max: 50,
      step: 1,
      unit: "%",
    },
    {
      type: "number",
      key: "fadeRight",
      label: "Fade right",
      min: 0,
      max: 50,
      step: 1,
      unit: "%",
    },
    {
      type: "number",
      key: "fadeBottom",
      label: "Fade bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ]),
  ...areaSeriesLineControlGroups,
];

export const projectionControlGroup = controlGroup("Projection", [
  {
    type: "select",
    key: "projectionMode",
    label: "Mode",
    options: [
      { value: "auto", label: "Auto (trend)" },
      { value: "target", label: "Target value" },
      { value: "manual", label: "Manual points" },
    ],
  },
  {
    type: "select",
    key: "projectionAutoMethod",
    label: "Auto method",
    options: [
      { value: "linearRegression", label: "Linear trend" },
      { value: "lastSegment", label: "Last segment" },
    ],
    visibleWhen: { key: "projectionMode", equals: "auto" },
  },
  {
    type: "number",
    key: "projectionHorizonPoints",
    label: "Horizon",
    min: 1,
    max: 48,
    step: 1,
    input: "studio",
  },
  {
    type: "number",
    key: "projectionEndValue",
    label: "End value",
    min: 0,
    max: 10_000,
    step: 1,
    input: "number",
    visibleWhen: { key: "projectionMode", equals: "target" },
  },
  {
    type: "projectionCurve",
    key: "projectionCurve",
    label: "Curve",
  },
  { type: "projectionStroke", key: "projectionStroke", label: "Stroke" },
  {
    type: "text",
    key: "projectionDashArray",
    label: "Dash array",
  },
  {
    type: "number",
    key: "projectionStrokeWidth",
    label: "Width",
    min: 1,
    max: 5,
    step: 0.5,
  },
  {
    type: "boolean",
    key: "projectionShowEndpoints",
    label: "End point",
  },
  {
    type: "boolean",
    key: "projectionShowEndLabel",
    label: "End label",
  },
  {
    type: "select",
    key: "projectionAreaFill",
    label: "Area",
    options: [
      { value: "none", label: "None" },
      { value: "solid", label: "Solid" },
      { value: "gradient", label: "Gradient" },
      { value: "pattern", label: "Pattern" },
    ],
  },
  {
    type: "number",
    key: "projectionAreaOpacity",
    label: "Area opacity",
    min: 0,
    max: 1,
    step: 0.01,
    visibleWhen: { key: "projectionAreaFill", not: "none" },
  },
  {
    type: "number",
    key: "projectionAreaFadeBottom",
    label: "Area fade",
    min: 0,
    max: 100,
    step: 1,
    visibleWhen: { key: "projectionAreaFill", not: "none" },
  },
  {
    type: "number",
    key: "projectionAreaPatternTint",
    label: "Pattern tint",
    min: 0,
    max: 1,
    step: 0.01,
    visibleWhen: { key: "projectionAreaFill", equals: "pattern" },
  },
  {
    type: "boolean",
    key: "projectionShowTarget",
    label: "Goal",
  },
  {
    type: "number",
    key: "projectionTarget",
    label: "Goal (0 = auto)",
    min: 0,
    max: 10_000,
    step: 1,
    input: "number",
    visibleWhen: { key: "projectionShowTarget", truthy: true },
  },
  {
    type: "boolean",
    key: "projectionShowGuides",
    label: "Guides",
  },
]);

export function lineChartDataGroup(): StudioControlGroup {
  return controlGroup("Data", [
    {
      type: "trendDirection",
      key: "lineDataTrend",
      label: "Trend",
      // Trending data only feeds projection previews.
      visibleWhen: { key: "projectionCount", truthy: true },
    },
    {
      type: "number",
      key: "dataSeries",
      label: "Series",
      min: 1,
      max: 10,
      step: 1,
    },
    {
      type: "number",
      key: "dataPoints",
      label: "Points",
      min: 3,
      max: 365,
      step: 1,
    },
  ]);
}

export const lineChartControlGroups: StudioControlGroup[] = [
  lineChartDataGroup(),
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
  lineSeriesTerminalMarkerControlGroup,
  seriesDashTailControlGroup,
];

export const xAxisControlGroups: StudioControlGroup[] = [
  controlGroup("Ticks", [
    {
      type: "number",
      key: "xAxisNumTicks",
      label: "Approx. tick count",
      min: 2,
      max: 12,
      step: 1,
    },
    {
      type: "select",
      key: "xAxisTickMode",
      label: "Snap",
      options: [
        { value: "data", label: "Data points" },
        { value: "domain", label: "Even spacing" },
      ],
    },
  ]),
];

export const barXAxisControlGroups: StudioControlGroup[] = [
  barCollapsibleGroup("Labels", [
    { type: "boolean", key: "barXAxisShowAllLabels", label: "Show all" },
    {
      type: "number",
      key: "barXAxisMaxLabels",
      label: "Max labels",
      min: 2,
      max: 24,
      step: 1,
      visibleWhen: { key: "barXAxisShowAllLabels", truthy: false },
    },
  ]),
];

export const barYAxisControlGroups: StudioControlGroup[] = [
  barCollapsibleGroup("Labels", [
    { type: "boolean", key: "barYAxisShowAllLabels", label: "Show all" },
    {
      type: "number",
      key: "barYAxisMaxLabels",
      label: "Max labels",
      min: 2,
      max: 24,
      step: 1,
      visibleWhen: { key: "barYAxisShowAllLabels", truthy: false },
    },
  ]),
];

export const tooltipAppearanceControlGroup = controlGroup("Appearance", [
  {
    type: "color",
    key: "tooltipBackgroundColor",
    label: "Background color",
  },
  {
    type: "opacity",
    key: "tooltipBackgroundOpacity",
    label: "Background opacity",
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

export const heatmapTooltipControlGroups: StudioControlGroup[] = [
  controlGroup("Tooltip", [
    {
      type: "number",
      key: "tooltipDamping",
      label: "Panel damping",
      min: 0,
      max: 100,
      step: 1,
    },
  ]),
  tooltipAppearanceControlGroup,
];

export const standardCrosshairControlGroup = barCollapsibleGroup("Crosshair", [
  { type: "boolean", key: "showCrosshair", label: "Show" },
  { type: "boolean", key: "showTooltipDots", label: "Dots" },
  { type: "tooltipDotVariant", key: "tooltipDotVariant", label: "Style" },
  {
    type: "number",
    key: "tooltipDotHaloScale",
    label: "Halo size",
    min: 0,
    max: 4,
    step: 0.1,
    visibleWhen: { key: "tooltipDotVariant", equals: "dot" },
  },
  {
    type: "opacity",
    key: "tooltipDotHaloOpacity",
    label: "Halo opacity",
    min: 0,
    max: 1,
    step: 0.05,
    color: "var(--chart-1)",
    visibleWhen: { key: "tooltipDotVariant", equals: "dot" },
  },
  {
    type: "number",
    key: "tooltipDotRadius",
    label: "Radius",
    min: 0,
    max: 0.5,
    step: 0.05,
    visibleWhen: { key: "tooltipDotVariant", equals: "ring" },
  },
  {
    type: "number",
    key: "tooltipDotScale",
    label: "Scale",
    min: 0.5,
    max: 2.5,
    step: 0.05,
    visibleWhen: { key: "tooltipDotVariant", equals: "ring" },
  },
  {
    type: "number",
    key: "tooltipDotStrokeWidth",
    label: "Width",
    min: 0.5,
    max: 6,
    step: 0.25,
    visibleWhen: { key: "tooltipDotVariant", equals: "ring" },
  },
  {
    type: "tooltipDotColorMode",
    key: "tooltipDotColorMode",
    label: "Color",
    visibleWhen: { key: "tooltipDotVariant", equals: "ring" },
  },
  { type: "color", key: "crosshairColor", label: "Indicator" },
  { type: "strokeStyle", key: "crosshairStyle", label: "Style" },
  {
    type: "text",
    key: "crosshairDashArray",
    label: "Dash array",
    visibleWhen: { key: "crosshairStyle", equals: "dashed" },
  },
  {
    type: "crosshairFade",
    key: "crosshairFadeEdges",
    label: "Fade",
    visibleWhen: { key: "crosshairStyle", not: "dashed" },
  },
  {
    type: "number",
    key: "crosshairFadeLength",
    label: "Fade size",
    min: 2,
    max: 40,
    step: 1,
    unit: "%",
    visibleWhen: [
      { key: "crosshairFadeEdges", not: "none" },
      { key: "crosshairStyle", not: "dashed" },
    ],
  },
]);

/** Bar charts hide the crosshair line by default (`barShowCrosshair`). */
export const barCrosshairControlGroup: StudioControlGroup = {
  ...standardCrosshairControlGroup,
  controls: standardCrosshairControlGroup.controls.map((control) =>
    control.key === "showCrosshair"
      ? { ...control, key: "barShowCrosshair" }
      : control
  ),
};

export const barChartTooltipControlGroups: StudioControlGroup[] = [
  barCollapsibleGroup("Tooltip", [
    { type: "boolean", key: "showTooltipDatePill", label: "Date pill" },
    {
      type: "boolean",
      key: "tooltipMatchCrosshair",
      label: "Match crosshair",
    },
    {
      type: "number",
      key: "tooltipDamping",
      label: "Panel damping",
      min: 0,
      max: 100,
      step: 1,
      visibleWhen: { key: "tooltipMatchCrosshair", truthy: false },
    },
  ]),
  barCollapsibleGroup("Appearance", tooltipAppearanceControlGroup.controls),
  barCrosshairControlGroup,
];

export const standardChartTooltipControlGroups: StudioControlGroup[] = [
  controlGroup("Tooltip", [
    { type: "boolean", key: "showTooltipDatePill", label: "Date pill" },
    {
      type: "boolean",
      key: "tooltipMatchCrosshair",
      label: "Match crosshair",
    },
    {
      type: "number",
      key: "tooltipDamping",
      label: "Panel damping",
      min: 0,
      max: 100,
      step: 1,
      visibleWhen: { key: "tooltipMatchCrosshair", truthy: false },
    },
  ]),
  tooltipAppearanceControlGroup,
  standardCrosshairControlGroup,
];

/** Jittered scatter hides the crosshair line by default (`scatterJitterShowCrosshair`). */
export const scatterJitterChartTooltipControlGroups: StudioControlGroup[] =
  standardChartTooltipControlGroups.map((group) =>
    group === standardCrosshairControlGroup
      ? {
          ...group,
          controls: group.controls.map((control) =>
            control.key === "showCrosshair"
              ? { ...control, key: "scatterJitterShowCrosshair" }
              : control
          ),
        }
      : group
  );

export const standardBrushStripControlGroups: StudioControlGroup[] = [
  controlGroup("Brush", [
    { type: "boolean", key: "showBrush", label: "Show" },
    {
      type: "number",
      key: "brushHeight",
      label: "Height",
      min: 32,
      max: 120,
      step: 4,
      unit: "px",
    },
    { type: "boolean", key: "brushFadeEdges", label: "Fade edges" },
    {
      type: "number",
      key: "brushBlur",
      label: "Blur",
      min: 0,
      max: 5,
      step: 0.5,
      unit: "px",
    },
    {
      type: "boolean",
      key: "brushSelectionPatternEnabled",
      label: "Selection pattern",
    },
    {
      type: "pattern",
      key: "brushSelectionPattern",
      label: "Pattern",
      enabledWhen: "brushSelectionPatternEnabled",
    },
    ...brushPatternDetailControls(),
  ]),
];

export const standardBrushAreaStripControlGroups: StudioControlGroup[] = [
  controlGroup("Areas", [
    {
      type: "opacity",
      key: "brushAreaOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "opacity",
      key: "brushGradientToOpacity",
      label: "Bottom",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      secondaryColor: "transparent",
    },
    {
      type: "number",
      key: "brushGradientSpan",
      label: "Gradient height",
      min: 0.05,
      max: 1,
      step: 0.05,
    },
  ]),
];

export const standardBrushControlGroups: StudioControlGroup[] = [
  ...standardBrushStripControlGroups,
  ...standardBrushAreaStripControlGroups,
];

export const standardLegendControlGroups: StudioControlGroup[] = [
  controlGroup("Legend", [
    { type: "boolean", key: "showLegend", label: "Show" },
    { type: "legendPosition", key: "legendPlacement", label: "" },
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
    controls.push(
      {
        type: "select",
        key: "lineChartState",
        label: "State",
        options: [
          { value: "ready", label: "Ready" },
          { value: "loading", label: "Loading" },
        ],
      },
      {
        type: "number",
        key: "projectionCount",
        label: "Projections",
        min: 0,
        max: 5,
        step: 1,
        input: "studio",
      },
      {
        ...loadingStyleControl,
        visibleWhen: { key: "lineChartState", equals: "loading" },
      }
    );
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
      type: "color",
      key: "crosshairColor",
      label: "Fixed color",
      visibleWhen: { key: "crosshairFollowsValue", truthy: false },
    },
    { type: "strokeStyle", key: "crosshairStyle", label: "Style" },
    {
      type: "text",
      key: "crosshairDashArray",
      label: "Dash array",
      visibleWhen: { key: "crosshairStyle", equals: "dashed" },
    },
    {
      type: "crosshairFade",
      key: "crosshairFadeEdges",
      label: "Fade",
      visibleWhen: { key: "crosshairStyle", not: "dashed" },
    },
    {
      type: "number",
      key: "crosshairFadeLength",
      label: "Fade size",
      min: 2,
      max: 40,
      step: 1,
      unit: "%",
      visibleWhen: [
        { key: "crosshairFadeEdges", not: "none" },
        { key: "crosshairStyle", not: "dashed" },
      ],
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
      referenceAreaBoundsControlGroup,
      ...profitLossLineSettingsGroups,
    ];
  }

  return [lineChartSettingsGroup("standard"), ...lineChartControlGroups];
}

export const profitLossLineChartControlGroups = getLineChartControlGroups({
  lineChartMode: "profitLoss",
});

export const barChartControlGroups: StudioControlGroup[] = [
  barCollapsibleGroup(
    "Settings",
    [
      {
        type: "select",
        key: "barChartState",
        label: "State",
        options: [
          { value: "ready", label: "Ready" },
          { value: "loading", label: "Loading" },
        ],
      },
      { type: "barShape", key: "barVariant", label: "Shape" },
      {
        type: "boolean",
        key: "barSquareFit",
        label: "Scale to fit",
        visibleWhen: { key: "barVariant", equals: ["shape", "squares"] },
      },
      {
        type: "number",
        key: "barSquareGap",
        label: "Square gap",
        min: 0,
        max: 12,
        visibleWhen: { key: "barVariant", equals: ["shape", "squares"] },
      },
      {
        type: "number",
        key: "barSquareRadius",
        label: "Radius",
        min: 0,
        max: 0.5,
        step: 0.05,
        visibleWhen: { key: "barVariant", equals: ["shape", "squares"] },
      },
      {
        type: "number",
        key: "barLollipopRadius",
        label: "Dot radius",
        min: 2,
        max: 12,
        visibleWhen: { key: "barVariant", equals: ["lollipop"] },
      },
      {
        type: "boolean",
        key: "barLollipopDashed",
        label: "Dashed stems",
        visibleWhen: { key: "barVariant", equals: ["lollipop"] },
      },
      {
        type: "boolean",
        key: "barLollipopHighlight",
        label: "Hover pill",
        visibleWhen: { key: "barVariant", equals: ["lollipop"] },
      },
      {
        type: "boolean",
        key: "barLollipopBaseline",
        label: "Zero line",
        visibleWhen: { key: "barVariant", equals: ["lollipop"] },
      },
    ],
    true
  ),
  barCollapsibleGroup("Value labels", [
    {
      type: "boolean",
      key: "barShowValue",
      label: "Show values",
    },
    {
      type: "select",
      key: "barValueLabelOrientation",
      label: "Orientation",
      options: [
        { value: "auto", label: "Auto" },
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
      visibleWhen: { key: "barShowValue", truthy: true },
    },
    {
      type: "select",
      key: "barValueLabelPosition",
      label: "Position",
      options: [
        { value: "top", label: "Top" },
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" },
      ],
      visibleWhen: { key: "barShowValue", truthy: true },
    },
    {
      type: "color",
      key: "barValueLabelColor",
      label: "Text color",
      visibleWhen: { key: "barShowValue", truthy: true },
    },
  ]),
  dataGroup(),
  barReferenceAreaBoundsControlGroup,
  barCollapsibleGroup("Series", [
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
  barCollapsibleGroup("Design", [
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
  referenceAreaBoundsControlGroup,
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
      type: "select",
      key: "pieStyle",
      label: "Style",
      options: [
        { value: "slices", label: "Slices" },
        { value: "ticks", label: "Ticks" },
      ],
    },
    {
      type: "number",
      key: "pieTickCount",
      label: "Ticks",
      min: 24,
      max: 180,
      visibleWhen: { key: "pieStyle", equals: "ticks" },
    },
    {
      type: "number",
      key: "pieTickWidth",
      label: "Tick width",
      min: 1,
      max: 8,
      step: 0.5,
      visibleWhen: { key: "pieStyle", equals: "ticks" },
    },
    {
      type: "select",
      key: "pieTickHoverEffect",
      label: "Hover",
      options: [
        { value: "slice", label: "Slice" },
        { value: "tick", label: "Tick" },
      ],
      visibleWhen: { key: "pieStyle", equals: "ticks" },
    },
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
      visibleWhen: { key: "pieStyle", equals: "slices" },
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
    {
      type: "pieHoverEffect",
      key: "pieHoverEffect",
      label: "Hover effect",
      visibleWhen: { key: "pieStyle", equals: "slices" },
    },
  ]),
];

export const pieCenterControlGroup = controlGroup("Center", [
  {
    type: "select",
    key: "pieCenterValueDisplay",
    label: "Value",
    options: [
      { value: "value", label: "Value" },
      { value: "percent", label: "Percent" },
    ],
  },
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

/** Per-ring `<Ring>` controls (scoped to one ring in the layer tree). */
export const ringLayerControlGroup = controlGroup("Ring", [
  {
    type: "select",
    key: "ringLineCap",
    label: "Line cap",
    options: [
      { value: "round", label: "Round" },
      { value: "butt", label: "Flat" },
    ],
  },
  { type: "boolean", key: "ringShowGlow", label: "Glow on hover" },
]);

export const ringGridControlGroups: StudioControlGroup[] = [
  controlGroup("Grid", [
    { type: "boolean", key: "ringGridShowLabels", label: "Labels" },
    { type: "boolean", key: "ringGridShowSpokes", label: "Spokes" },
    {
      type: "opacity",
      key: "ringGridStrokeOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--foreground)",
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
  ]),
];

/** Per-series `<RadarArea>` controls (scoped to one area in the layer tree). */
export const radarAreaControlGroup = controlGroup("Shape", [
  { type: "boolean", key: "radarShowPoints", label: "Show points" },
  { type: "boolean", key: "radarShowStroke", label: "Show stroke" },
  { type: "boolean", key: "radarShowGlow", label: "Glow on hover" },
]);

export const radarGridControlGroups: StudioControlGroup[] = [
  controlGroup("Grid", [
    { type: "boolean", key: "showRadarGrid", label: "Labels" },
    {
      type: "opacity",
      key: "radarGridStrokeOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--border)",
    },
  ]),
];

export const radarAxisControlGroups: StudioControlGroup[] = [
  controlGroup("Axis", [
    {
      type: "opacity",
      key: "radarAxisStrokeOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--border)",
    },
  ]),
];

export const radarLabelsControlGroups: StudioControlGroup[] = [
  controlGroup("Labels", [
    {
      type: "number",
      key: "radarLabelFontSize",
      label: "Font size",
      min: 8,
      max: 18,
      step: 1,
    },
    {
      type: "number",
      key: "radarLabelOffset",
      label: "Offset",
      min: 0,
      max: 40,
      step: 1,
    },
    {
      type: "boolean",
      key: "radarLabelsInteractive",
      label: "Hover to highlight",
    },
  ]),
];

export const candlestickChartControlGroups: StudioControlGroup[] = [
  referenceAreaBoundsControlGroup,
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
    {
      type: "number",
      key: "candleInsideStrokeWidth",
      label: "Inner border",
      min: 0,
      max: 4,
      step: 0.5,
      unit: "px",
    },
    {
      type: "boolean",
      key: "candleShowHoverFade",
      label: "Fade on hover",
    },
  ]),
];

/** Candlestick tooltip dots use `candleShowDots` (off by default). */
export const candlestickChartTooltipControlGroups: StudioControlGroup[] =
  standardChartTooltipControlGroups.map((group) =>
    group === standardCrosshairControlGroup
      ? {
          ...group,
          controls: group.controls.map((control) =>
            control.key === "showTooltipDots"
              ? { ...control, key: "candleShowDots" }
              : control
          ),
        }
      : group
  );

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
    {
      type: "select",
      key: "funnelLabelLayout",
      label: "Layout",
      options: [
        { value: "spread", label: "Spread" },
        { value: "grouped", label: "Grouped" },
      ],
    },
    {
      type: "select",
      key: "funnelLabelOrientation",
      label: "Stack",
      options: [
        { value: "auto", label: "Auto" },
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
      ],
      visibleWhen: { key: "funnelLabelLayout", equals: "grouped" },
    },
    {
      type: "select",
      key: "funnelLabelAlign",
      label: "Align",
      options: [
        { value: "center", label: "Center" },
        { value: "start", label: "Start" },
        { value: "end", label: "End" },
      ],
      visibleWhen: { key: "funnelLabelLayout", equals: "grouped" },
    },
  ]),
];

/** `<FunnelChart grid>` — opt-in layer (`funnel.funnel-grid`). */
export const funnelGridControlGroups: StudioControlGroup[] = [
  controlGroup("Grid", [
    { type: "boolean", key: "funnelGridBands", label: "Bands" },
    { type: "boolean", key: "funnelGridLines", label: "Lines" },
    {
      type: "opacity",
      key: "funnelGridLineOpacity",
      label: "Line opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-grid)",
      visibleWhen: { key: "funnelGridLines", truthy: true },
    },
    {
      type: "number",
      key: "funnelGridLineWidth",
      label: "Line width",
      min: 0.5,
      max: 4,
      step: 0.5,
      unit: "px",
      visibleWhen: { key: "funnelGridLines", truthy: true },
    },
  ]),
];

export const sunburstChartControlGroups: StudioControlGroup[] = [
  controlGroup("Chart", [
    {
      type: "number",
      key: "pieSize",
      label: "Scale",
      min: 75,
      max: 100,
      unit: "%",
    },
    {
      type: "number",
      key: "pieHoverOffset",
      label: "Hover pop",
      min: 0,
      max: 24,
    },
    { type: "boolean", key: "sunburstShowLabels", label: "Show labels" },
  ]),
];

export const sunburstLabelsControlGroups: StudioControlGroup[] = [
  controlGroup("Labels", [
    {
      type: "number",
      key: "sunburstLabelFontSize",
      label: "Font size",
      min: 8,
      max: 24,
      step: 1,
    },
    { type: "color", key: "sunburstLabelColor", label: "Text color" },
    {
      type: "color",
      key: "sunburstLabelOutlineColor",
      label: "Outline color",
    },
    {
      type: "number",
      key: "sunburstLabelOutlineWidth",
      label: "Outline width",
      min: 0,
      max: 8,
      step: 0.5,
    },
  ]),
];

export const scatterPointsControlGroup = controlGroup("Points", [
  {
    type: "number",
    key: "scatterRadius",
    label: "Radius",
    min: 2,
    max: 14,
    step: 0.5,
  },
  { type: "boolean", key: "scatterShowRings", label: "Rings" },
  {
    type: "number",
    key: "scatterRingGap",
    label: "Ring gap",
    min: 0,
    max: 8,
    step: 1,
    visibleWhen: { key: "scatterShowRings", truthy: true },
  },
  {
    type: "number",
    key: "scatterRingWidth",
    label: "Ring width",
    min: 0.5,
    max: 6,
    step: 0.5,
    visibleWhen: { key: "scatterShowRings", truthy: true },
  },
]);

export const scatterInteractionControlGroup = controlGroup("Interaction", [
  { type: "boolean", key: "scatterFadeOnHover", label: "Fade on hover" },
  {
    type: "select",
    key: "scatterInactiveMode",
    label: "Inactive",
    options: [
      { value: "opacity", label: "Opacity" },
      { value: "blur", label: "Opacity + blur" },
    ],
    visibleWhen: { key: "scatterFadeOnHover", truthy: true },
  },
  {
    type: "opacity",
    key: "scatterInactiveOpacity",
    label: "Inactive opacity",
    min: 0.1,
    max: 1,
    step: 0.05,
    color: "var(--chart-1)",
    visibleWhen: { key: "scatterFadeOnHover", truthy: true },
  },
  {
    type: "number",
    key: "scatterInactiveBlur",
    label: "Inactive blur",
    min: 0.5,
    max: 8,
    step: 0.5,
    unit: "px",
    visibleWhen: [
      { key: "scatterFadeOnHover", truthy: true },
      { key: "scatterInactiveMode", equals: "blur" },
    ],
  },
  { type: "boolean", key: "scatterSecondSeries", label: "Second series" },
  {
    type: "boolean",
    key: "scatterShowActiveHighlight",
    label: "Highlight active point",
  },
]);

export const scatterJitterControlGroup = controlGroup("Jitter", [
  { type: "boolean", key: "scatterJitter", label: "Jitter" },
  {
    type: "number",
    key: "scatterJitterX",
    label: "X spread (band)",
    min: 0,
    max: 1,
    step: 0.05,
    visibleWhen: { key: "scatterJitter", truthy: true },
  },
  {
    type: "number",
    key: "scatterJitterY",
    label: "Y spread",
    min: 0,
    max: 24,
    step: 1,
    unit: "px",
    visibleWhen: { key: "scatterJitter", truthy: true },
  },
]);

export const scatterChartControlGroups: StudioControlGroup[] = [
  referenceAreaBoundsControlGroup,
  scatterPointsControlGroup,
  scatterInteractionControlGroup,
  scatterJitterControlGroup,
];

export const liveLineChartControlGroups: StudioControlGroup[] = [
  referenceAreaBoundsControlGroup,
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
    {
      type: "select",
      key: "choroplethRender",
      label: "Render as",
      options: [
        { value: "fill", label: "Filled regions" },
        { value: "dots", label: "Dot grid" },
      ],
    },
    { type: "graticuleToggle", key: "showGraticule", label: "Graticule" },
    { type: "boolean", key: "choroplethShowMarkers", label: "Markers" },
    { type: "boolean", key: "choroplethBackground", label: "Background" },
    {
      type: "pattern",
      key: "choroplethBgPattern",
      label: "Background",
      visibleWhen: { key: "choroplethRender", equals: "fill" },
    },
    {
      type: "pattern",
      key: "choroplethFgPattern",
      label: "Foreground",
      visibleWhen: { key: "choroplethRender", equals: "fill" },
    },
  ]),
  controlGroup("Click to zoom", [
    { type: "boolean", key: "choroplethClickZoom", label: "Enabled" },
    {
      type: "number",
      key: "choroplethZoomDuration",
      label: "Duration",
      min: 150,
      max: 2000,
      step: 10,
      unit: "ms",
      visibleWhen: { key: "choroplethClickZoom", truthy: true },
    },
    {
      type: "select",
      key: "choroplethZoomEase",
      label: "Easing",
      options: CHOROPLETH_ZOOM_EASE_OPTIONS,
      visibleWhen: { key: "choroplethClickZoom", truthy: true },
    },
    {
      type: "number",
      key: "choroplethFocusMaxZoom",
      label: "Max zoom",
      min: 1.5,
      max: 12,
      step: 0.5,
      unit: "×",
      visibleWhen: { key: "choroplethClickZoom", truthy: true },
    },
    {
      type: "boolean",
      key: "choroplethHideContextOnFocus",
      label: "Hide ocean dots, graticule & background",
      visibleWhen: { key: "choroplethClickZoom", truthy: true },
    },
  ]),
  controlGroup("Camera · zoomed out", [
    {
      type: "select",
      key: "choroplethOverviewView",
      label: "View from",
      options: [
        { value: "flat", label: "Flat" },
        { value: "west", label: "West" },
        { value: "east", label: "East" },
        { value: "pointer", label: "Follow pointer" },
      ],
    },
    {
      type: "number",
      key: "choroplethOverviewYaw",
      label: "Yaw",
      min: 0,
      max: 45,
      step: 1,
      unit: "°",
      visibleWhen: { key: "choroplethOverviewView", not: "flat" },
    },
    {
      type: "number",
      key: "choroplethOverviewTilt",
      label: "Tilt",
      min: 0,
      max: 60,
      step: 1,
      unit: "°",
    },
  ]),
  controlGroup("Camera · zoomed in", [
    {
      type: "select",
      key: "choroplethFocusView",
      label: "View from",
      options: [
        { value: "auto", label: "Auto (side of region)" },
        { value: "flat", label: "Flat" },
        { value: "west", label: "West" },
        { value: "east", label: "East" },
      ],
    },
    {
      type: "number",
      key: "choroplethFocusYaw",
      label: "Yaw",
      min: 0,
      max: 45,
      step: 1,
      unit: "°",
      visibleWhen: { key: "choroplethFocusView", not: "flat" },
    },
    {
      type: "number",
      key: "choroplethFocusTilt",
      label: "Tilt",
      min: 0,
      max: 60,
      step: 1,
      unit: "°",
    },
    {
      type: "number",
      key: "choroplethDepth",
      label: "Perspective",
      min: 400,
      max: 4000,
      step: 50,
      unit: "px",
    },
    {
      type: "number",
      key: "choroplethEdgeFade",
      label: "Edge fade",
      min: 0,
      max: 45,
      step: 1,
      unit: "%",
    },
  ]),
];

export const choroplethDotGridControlGroups: StudioControlGroup[] = [
  controlGroup("Grid", [
    {
      type: "number",
      key: "choroplethDotGap",
      label: "Grid size",
      min: 3,
      max: 20,
      step: 0.5,
      unit: "px",
    },
    {
      type: "number",
      key: "choroplethDotSize",
      label: "Dot size",
      min: 0.1,
      max: 1,
      step: 0.05,
    },
    {
      type: "number",
      key: "choroplethDotZoomSize",
      label: "Zoomed dot size",
      min: 0.1,
      max: 1,
      step: 0.05,
    },
    {
      type: "select",
      key: "choroplethDotLattice",
      label: "Lattice",
      options: [
        { value: "hex", label: "Hex" },
        { value: "square", label: "Square" },
      ],
    },
  ]),
  controlGroup("Ocean", [
    { type: "boolean", key: "choroplethDotOcean", label: "Ocean dots" },
    {
      type: "opacity",
      key: "choroplethDotOceanOpacity",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-scale-01)",
      visibleWhen: { key: "choroplethDotOcean", truthy: true },
    },
  ]),
  controlGroup("Edges", [
    {
      type: "number",
      key: "choroplethDotEdgeFade",
      label: "Edge fade",
      min: 0,
      max: 45,
      step: 1,
      unit: "%",
    },
  ]),
  controlGroup("Hover", [
    {
      type: "opacity",
      key: "choroplethFeatureFadedOpacity",
      label: "Faded",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-3)",
    },
  ]),
];

export const choroplethMarkerControlGroups: StudioControlGroup[] = [
  controlGroup("Locations", [
    { type: "text", key: "choroplethMarkers", label: "Label lat,lon; …" },
  ]),
  controlGroup("Style", [
    { type: "markerShape", key: "choroplethMarkerShape", label: "Shape" },
    {
      type: "number",
      key: "choroplethMarkerSize",
      label: "Size",
      min: 4,
      max: 28,
      step: 1,
      unit: "px",
    },
    { type: "color", key: "choroplethMarkerColor", label: "Color" },
    { type: "boolean", key: "choroplethMarkerLabels", label: "Show labels" },
  ]),
  controlGroup("Stroke", [
    { type: "boolean", key: "choroplethMarkerStroke", label: "Stroke" },
    {
      type: "color",
      key: "choroplethMarkerStrokeColor",
      label: "Color",
      visibleWhen: { key: "choroplethMarkerStroke", truthy: true },
    },
    {
      type: "number",
      key: "choroplethMarkerStrokeWidth",
      label: "Width",
      min: 0.5,
      max: 4,
      step: 0.25,
      unit: "px",
      visibleWhen: { key: "choroplethMarkerStroke", truthy: true },
    },
  ]),
  controlGroup("Effects", [
    {
      type: "select",
      key: "choroplethMarkerPulse",
      label: "Pulse",
      options: [
        { value: "none", label: "None" },
        { value: "hover", label: "On hover" },
        { value: "always", label: "Always" },
      ],
    },
    {
      type: "number",
      key: "choroplethMarkerGlow",
      label: "Glow",
      min: 0,
      max: 16,
      step: 1,
      unit: "px",
    },
  ]),
];

export const choroplethFeatureControlGroups: StudioControlGroup[] = [
  controlGroup("Borders", [
    { type: "color", key: "choroplethFeatureStroke", label: "Stroke" },
    {
      type: "number",
      key: "choroplethFeatureStrokeWidth",
      label: "Width",
      min: 0,
      max: 3,
      step: 0.25,
      unit: "px",
    },
  ]),
  controlGroup("Hover", [
    {
      type: "opacity",
      key: "choroplethFeatureFadedOpacity",
      label: "Faded",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-3)",
    },
  ]),
];

export const choroplethGraticuleControlGroups: StudioControlGroup[] = [
  controlGroup("Lines", [
    {
      type: "number",
      key: "choroplethGraticuleStrokeWidth",
      label: "Width",
      min: 0.25,
      max: 3,
      step: 0.25,
      unit: "px",
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
  ]),
];

export const sankeyNodeControlGroups: StudioControlGroup[] = [
  controlGroup("Nodes", [
    {
      type: "number",
      key: "sankeyNodeCornerRadius",
      label: "Corner",
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
    },
    {
      type: "opacity",
      key: "sankeyNodeFadedOpacity",
      label: "Faded",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
  controlGroup("Labels", [
    { type: "boolean", key: "sankeyNodeShowLabels", label: "Show labels" },
    {
      type: "boolean",
      key: "sankeyNodeShowValueLabels",
      label: "Show values",
      visibleWhen: { key: "sankeyNodeShowLabels", truthy: true },
    },
    {
      type: "select",
      key: "sankeyNodeLabelOrientation",
      label: "Orientation",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
      visibleWhen: { key: "sankeyNodeShowLabels", truthy: true },
    },
  ]),
];

export const sankeyLinkControlGroups: StudioControlGroup[] = [
  controlGroup("Links", [
    {
      type: "opacity",
      key: "linkOpacity",
      label: "Opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "opacity",
      key: "sankeyLinkFadedOpacity",
      label: "Faded",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    { type: "boolean", key: "sankeyLinkUseGradient", label: "Gradient" },
  ]),
];

const heatmapLevelPane = (
  level: 0 | 1 | 2 | 3 | 4,
  title: string,
  colorKey: keyof StudioUrlState
): StudioControlGroup =>
  controlGroup(
    title,
    [{ type: "heatmapLevel", level, label: title, key: colorKey }],
    { collapsible: true, defaultOpen: level === 0 }
  );

export const heatmapChartControlGroups: StudioControlGroup[] = [
  controlGroup("Settings", [
    {
      type: "select",
      key: "heatmapChartState",
      label: "State",
      options: [
        { value: "ready", label: "Ready" },
        { value: "loading", label: "Loading" },
      ],
    },
  ]),
  controlGroup("Layout", [
    {
      type: "number",
      key: "heatmapGap",
      label: "Gap",
      min: 0,
      max: 8,
    },
    {
      type: "number",
      key: "heatmapCornerRadius",
      label: "Radius",
      min: 0,
      max: 8,
    },
    {
      type: "select",
      key: "heatmapWeekStartDay",
      label: "Week starts",
      options: [
        { value: "0", label: "Sunday" },
        { value: "1", label: "Monday" },
        { value: "2", label: "Tuesday" },
        { value: "3", label: "Wednesday" },
        { value: "4", label: "Thursday" },
        { value: "5", label: "Friday" },
        { value: "6", label: "Saturday" },
      ],
    },
  ]),
  heatmapLevelPane(0, "Empty", "heatmapLevel0Color"),
  heatmapLevelPane(1, "Level 1", "heatmapLevel1Color"),
  heatmapLevelPane(2, "Level 2", "heatmapLevel2Color"),
  heatmapLevelPane(3, "Level 3", "heatmapLevel3Color"),
  heatmapLevelPane(4, "Level 4", "heatmapLevel4Color"),
];

export const heatmapCellsControlGroups: StudioControlGroup[] = [
  controlGroup("Cells", [
    {
      type: "opacity",
      key: "heatmapCellsInactiveOpacity",
      label: "Inactive opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
    {
      type: "number",
      key: "heatmapCellsInactiveScale",
      label: "Inactive scale",
      min: 0.5,
      max: 1,
      step: 0.05,
      unit: "",
    },
  ]),
];

export const heatmapYAxisControlGroups: StudioControlGroup[] = [
  controlGroup("Y Axis", [
    {
      type: "select",
      key: "heatmapYAxisTickFilter",
      label: "Ticks",
      options: [
        { value: "odd", label: "Odd (Mon / Wed / Fri)" },
        { value: "even", label: "Even (Sun / Tue / Thu / Sat)" },
        { value: "all", label: "All" },
      ],
    },
    {
      type: "select",
      key: "heatmapYAxisLabelFormat",
      label: "Labels",
      options: [
        { value: "full", label: "Full" },
        { value: "initial", label: "Initial" },
      ],
    },
  ]),
];

export const heatmapSeparatorControlGroups: StudioControlGroup[] = [
  controlGroup("Separators", [
    {
      type: "select",
      key: "heatmapSeparatorGroupBy",
      label: "Group by",
      options: [
        { value: "off", label: "Off" },
        { value: "quarter", label: "Calendar quarter" },
        { value: "every", label: "Every N columns" },
      ],
    },
    {
      type: "number",
      key: "heatmapSeparatorEvery",
      label: "Every N columns",
      min: 1,
      max: 12,
      step: 1,
      unit: "",
      visibleWhen: { key: "heatmapSeparatorGroupBy", equals: "every" },
    },
    {
      type: "boolean",
      key: "heatmapSeparatorShowLabels",
      label: "Quarter labels",
      visibleWhen: { key: "heatmapSeparatorGroupBy", equals: "quarter" },
    },
    {
      type: "select",
      key: "heatmapSeparatorStrokeStyle",
      label: "Line style",
      options: [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
      ],
      visibleWhen: { key: "heatmapSeparatorGroupBy", not: "off" },
    },
    {
      type: "boolean",
      key: "heatmapSeparatorUseGradient",
      label: "Gradient fade",
      visibleWhen: { key: "heatmapSeparatorGroupBy", not: "off" },
    },
    {
      type: "color",
      key: "heatmapSeparatorStroke",
      label: "Stroke",
      visibleWhen: { key: "heatmapSeparatorGroupBy", not: "off" },
    },
  ]),
];

export const heatmapLegendControlGroups: StudioControlGroup[] = [
  controlGroup("Legend", [
    { type: "boolean", key: "showLegend", label: "Show" },
    { type: "legendPosition", key: "legendPlacement", label: "" },
    {
      type: "select",
      key: "heatmapLegendVariant",
      label: "Variant",
      options: [
        { value: "swatches", label: "Swatches" },
        { value: "gradient", label: "Gradient bar" },
      ],
    },
    {
      type: "number",
      key: "heatmapLegendGradientSpan",
      label: "Gradient width",
      min: 3,
      max: 10,
      step: 1,
      unit: "swatches",
      visibleWhen: { key: "heatmapLegendVariant", equals: "gradient" },
    },
    {
      type: "number",
      key: "legendFontSize",
      label: "Font size",
      min: 10,
      max: 18,
      step: 1,
      unit: "px",
    },
    {
      type: "number",
      key: "heatmapLegendCellSize",
      label: "Swatch size",
      min: 8,
      max: 16,
      step: 1,
      unit: "px",
    },
  ]),
];

const sparklineNotBar = { key: "sparklineVariant", not: "bar" } as const;
const sparklineArea = { key: "sparklineVariant", equals: "area" } as const;
const sparklineBar = { key: "sparklineVariant", equals: "bar" } as const;

/** Order matters — `resolveSparklineComponents` destructures by position. */
export const sparklineControlGroups: StudioControlGroup[] = [
  controlGroup("Data", [
    {
      type: "number",
      key: "sparklinePoints",
      label: "Points",
      min: 4,
      max: 120,
      step: 1,
    },
  ]),
  controlGroup("Settings", [
    {
      type: "select",
      key: "sparklineVariant",
      label: "Variant",
      options: [
        { value: "line", label: "Line" },
        { value: "area", label: "Area" },
        { value: "bar", label: "Bar" },
      ],
    },
    {
      type: "number",
      key: "sparklineHeight",
      label: "Height",
      min: 16,
      max: 120,
      step: 1,
      unit: "px",
    },
  ]),
  controlGroup("Series", [
    {
      type: "select",
      key: "sparklineCurve",
      label: "Curve",
      options: [
        { value: "linear", label: "Linear" },
        { value: "monotone", label: "Monotone" },
        { value: "natural", label: "Natural" },
        { value: "step", label: "Step" },
      ],
      visibleWhen: sparklineNotBar,
    },
    {
      type: "number",
      key: "sparklineStrokeWidth",
      label: "Stroke width",
      min: 0.5,
      max: 6,
      step: 0.5,
      visibleWhen: sparklineNotBar,
    },
    {
      type: "select",
      key: "sparklineFill",
      label: "Fill",
      options: [
        { value: "gradient", label: "Gradient" },
        { value: "solid", label: "Solid" },
      ],
      visibleWhen: sparklineArea,
    },
    {
      type: "opacity",
      key: "sparklineFillOpacity",
      label: "Fill opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      visibleWhen: sparklineArea,
    },
    {
      type: "number",
      key: "sparklineBarGap",
      label: "Bar gap",
      min: 0,
      max: 12,
      step: 0.5,
      visibleWhen: sparklineBar,
    },
    {
      type: "number",
      key: "sparklineBarRadius",
      label: "Bar radius",
      min: 0,
      max: 8,
      step: 0.5,
      visibleWhen: sparklineBar,
    },
    {
      type: "opacity",
      key: "sparklineInactiveOpacity",
      label: "Inactive opacity",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
      visibleWhen: sparklineBar,
    },
  ]),
  controlGroup("Crosshair", [
    {
      type: "strokeStyle",
      key: "sparklineCrosshair",
      label: "Style",
      options: ["dashed", "solid", "gradient"],
    },
    {
      type: "boolean",
      key: "sparklineHoverSpring",
      label: "Spring",
    },
    {
      type: "number",
      key: "sparklineSpringDamping",
      label: "Damping",
      min: 5,
      max: 80,
      step: 1,
      visibleWhen: { key: "sparklineHoverSpring", truthy: true },
    },
  ]),
  controlGroup("Dot", [
    {
      type: "boolean",
      key: "sparklineEndDot",
      label: "End dot",
      visibleWhen: sparklineNotBar,
    },
  ]),
];

/** Rendered above the motion curve in the left Animation section. */
export const sparklineMotionControls: StudioControl[] = [
  { type: "boolean", key: "sparklineAnimate", label: "Animate" },
];

/** Radial chart root (RadialChart). */
export const radialChartControlGroups: StudioControlGroup[] = [
  controlGroup("Layout", [
    {
      type: "number",
      key: "radialSize",
      label: "Scale",
      min: 50,
      max: 100,
      input: "number",
      unit: "%",
    },
  ]),
];

export const radialAxisControlGroups: StudioControlGroup[] = [
  controlGroup("Axis", [
    { type: "boolean", key: "radialCenterGradient", label: "Center gradient" },
    { type: "boolean", key: "radialAxisCircle", label: "Outer circle" },
  ]),
];

export const radialDotBarControlGroups: StudioControlGroup[] = [
  controlGroup("Dots", [
    {
      type: "number",
      key: "radialRows",
      label: "Rows",
      min: 6,
      max: 24,
      step: 1,
    },
    {
      type: "number",
      key: "radialDotSize",
      label: "Dot size",
      min: 0.2,
      max: 0.9,
      step: 0.02,
    },
    {
      type: "select",
      key: "radialDotLayout",
      label: "Layout",
      options: [
        { value: "grid", label: "Grid" },
        { value: "columns", label: "Columns" },
      ],
    },
    {
      type: "opacity",
      key: "radialFadedOpacity",
      label: "Faded",
      min: 0,
      max: 1,
      step: 0.05,
      color: "var(--chart-1)",
    },
  ]),
  controlGroup("Comparison", [
    { type: "boolean", key: "radialGhost", label: "Yesterday ghost" },
    { type: "boolean", key: "radialAnnotations", label: "Spike callout" },
  ]),
];

export const radialScrubberControlGroups: StudioControlGroup[] = [
  controlGroup("Scrubber", [
    {
      type: "strokeStyle",
      key: "radialScrubberVariant",
      label: "Style",
      options: ["solid", "dashed", "gradient"],
    },
  ]),
];

export const radialLegendControlGroups: StudioControlGroup[] = [
  controlGroup("Legend", [
    { type: "boolean", key: "showLegend", label: "Show" },
    { type: "boolean", key: "radialLegendValues", label: "Totals" },
  ]),
];
