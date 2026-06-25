import {
  clampStudioSeriesCount,
  funnelData,
  getRadarData,
  pieData,
  ringData,
  STUDIO_SERIES_KEYS,
} from "@/lib/demo-data";
import {
  isAreaChartLoadingMode,
  isBarChartLoadingMode,
  isProfitLossLineMode,
} from "@/lib/line-chart-mode";
import type { LineYAxisId } from "@/lib/line-series-y-axis";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getDesignSeriesLabel,
  getEffectiveSeriesColor,
} from "@/lib/studio-series-design";
import type {
  StudioChartConfig,
  StudioComponentDefinition,
  StudioComponentKind,
  StudioComponentTreeIcon,
  StudioControlGroup,
} from "@/lib/types";
import { getStudioControlGroups } from "./control-groups";
import { backgroundControlGroups } from "./pattern-control-groups";
import {
  areaChartControlGroups,
  areaSeriesLineControlGroups,
  barChartControlGroups,
  candlestickChartControlGroups,
  choroplethChartControlGroups,
  composedChartControlGroups,
  composedOverlayLineControlGroups,
  funnelChartControlGroups,
  gaugeControlGroups,
  getLineChartControlGroups,
  gridControlGroups,
  heatmapCellsControlGroups,
  heatmapChartControlGroups,
  heatmapLegendControlGroups,
  liveLineChartControlGroups,
  pieCenterControlGroup,
  pieChartControlGroups,
  projectionControlGroup,
  radarChartControlGroups,
  referenceAreaControlGroups,
  ringCenterControlGroup,
  ringChartControlGroups,
  sankeyChartControlGroups,
  scatterChartControlGroups,
  standardBrushControlGroups,
  standardBrushStripControlGroups,
  standardChartTooltipControlGroups,
  standardLegendControlGroups,
  tooltipAppearanceControlGroup,
} from "./registry-control-groups";
import { controlGroup } from "./sidebar-control-templates";
import { firstConfigurableStudioComponentId } from "./studio-component-visibility";
import {
  getProjectionCount,
  getProjectionSeriesIndex,
  getProjectionStroke,
  PER_PROJECTION_CONTROL_KEYS,
  PROJECTION_PRESET_LABELS,
} from "./studio-projection-props";

const DESIGN_SERIES_LABEL_PREFIX = /^Series \d+ · /;

const PER_SERIES_LINE_CONTROL_KEYS = new Set([
  "curve",
  "strokeWidth",
  "fadeEdges",
  "showHighlight",
  "showLine",
  "seriesShowMarkers",
  "seriesMarkerRadius",
  "seriesMarkerRingGap",
  "seriesMarkerRingWidth",
  "seriesTerminalMarkerShow",
  "seriesTerminalMarkerFill",
  "seriesTerminalMarkerRingColor",
  "seriesTerminalMarkerRingGap",
  "seriesDashTail",
  "seriesDashFromIndex",
  "seriesDashArray",
]);

function seriesScopedControlGroups(
  groups: StudioControlGroup[],
  seriesIndex: number
): StudioControlGroup[] {
  return groups.map((group) => ({
    ...group,
    controls: group.controls.map((control) => {
      if (
        "key" in control &&
        PER_SERIES_LINE_CONTROL_KEYS.has(String(control.key))
      ) {
        return { ...control, seriesIndex };
      }
      return control;
    }),
  }));
}

function projectionScopedControlGroups(
  groups: StudioControlGroup[],
  projectionIndex: number
): StudioControlGroup[] {
  return groups.map((group) => ({
    ...group,
    controls: group.controls.map((control) => {
      if ("key" in control && PER_PROJECTION_CONTROL_KEYS.has(control.key)) {
        return { ...control, projectionIndex };
      }
      return control;
    }),
  }));
}

function rootPaletteDesign(
  supportsPattern = false
): StudioComponentDefinition["design"] {
  return { seriesIndex: 0, supportsPattern };
}

function legendNode(chartPrefix: string): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.legend`,
    label: "ChartLegend",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: standardLegendControlGroups,
  };
}

function brushNode(
  chartPrefix: string,
  controlGroups: StudioControlGroup[] = standardBrushControlGroups
): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.brush`,
    label: "ChartBrush",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups,
  };
}

function chartTooltipNode(
  chartPrefix: string,
  controlGroups: StudioControlGroup[] = standardChartTooltipControlGroups
): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.tooltip`,
    label: "ChartTooltip",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups,
  };
}

function passiveNode(
  chartPrefix: string,
  idSuffix: string,
  label: string
): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.${idSuffix}`,
    label,
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: [],
  };
}

function gridNode(
  chartPrefix: string,
  extraControlGroups: StudioControlGroup[] = []
): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.grid`,
    label: "Grid",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: [...gridControlGroups, ...extraControlGroups],
  };
}

function backgroundNode(chartPrefix: string): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.background`,
    label: "Background",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: backgroundControlGroups,
  };
}

function referenceAreaNode(chartPrefix: string): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.reference-area`,
    label: "Reference area",
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: referenceAreaControlGroups,
  };
}

function chartYAxisNode(
  chartPrefix: string,
  axis: LineYAxisId,
  label: string
): StudioComponentDefinition {
  return {
    id: `${chartPrefix}.yaxis.${axis}`,
    label,
    parentId: `${chartPrefix}.chart`,
    kind: "chart",
    controlGroups: [
      controlGroup("Ticks", [
        {
          type: "lineYAxisNumTicks",
          key: "lineYAxisNumTicks",
          label: "Approx. tick count",
          axis,
        },
        {
          type: "lineYAxisFormatLarge",
          key: "lineYAxisFormatLarge",
          label: "Format large numbers (1k)",
          axis,
        },
      ]),
    ],
  };
}

function seriesYAxisControlGroup(seriesIndex: number): StudioControlGroup {
  return controlGroup("Axis", [
    {
      type: "lineSeriesYAxis",
      key: "lineSeriesYAxes",
      label: "Y axis",
      seriesIndex,
    },
  ]);
}

function slugifyComponentId(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupsToComponents(
  groups: StudioControlGroup[],
  options?: { supportsPatterns?: boolean }
): StudioComponentDefinition[] {
  return groups
    .filter((group) => group.title !== "Data")
    .map((group) => {
      const id = slugifyComponentId(group.title);
      const isDesign = group.title.toLowerCase() === "design";
      let kind: StudioComponentKind = "chart";
      if (isDesign) {
        kind = "series";
      } else if (group.title === "Data") {
        kind = "data";
      }
      return {
        id,
        label: group.title,
        kind,
        controlGroups: [group],
        design: isDesign
          ? {
              seriesIndex: 0,
              supportsPattern: options?.supportsPatterns,
            }
          : undefined,
      };
    });
}

export function resolveGaugeComponents(): StudioComponentDefinition[] {
  const [design, center, notches, arc] = gaugeControlGroups;

  return [
    {
      id: "gauge.chart",
      label: "Gauge",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: [],
      design: rootPaletteDesign(true),
    },
    {
      id: "gauge.arc-fill",
      label: "Arc fill",
      parentId: "gauge.chart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: design ? [design] : [],
      design: { seriesIndex: 0, supportsPattern: true },
    },
    {
      id: "gauge.notches",
      label: "Notches",
      parentId: "gauge.chart",
      kind: "geometry",
      controlGroups: notches ? [notches] : [],
    },
    {
      id: "gauge.arc",
      label: "Arc",
      parentId: "gauge.chart",
      kind: "geometry",
      controlGroups: arc ? [arc] : [],
    },
    {
      id: "gauge.center",
      label: "PieCenterShell",
      parentId: "gauge.chart",
      kind: "text",
      controlGroups: center ? [center] : [],
    },
    legendNode("gauge"),
  ];
}

export function isStudioDataComponent(
  component: StudioComponentDefinition
): boolean {
  return (
    component.kind === "data" ||
    component.id === "chart.data" ||
    component.id === "data"
  );
}

export function getStudioDataControlGroups(
  config: StudioChartConfig,
  state: StudioUrlState
): StudioControlGroup[] {
  const groups = getStudioControlGroups(config, state);
  const result: StudioControlGroup[] = [];
  const dataGroupConfig = groups.find((group) => group.title === "Data");
  if (dataGroupConfig) {
    result.push(dataGroupConfig);
  }
  return result;
}

function loadingGridControlGroups(state: StudioUrlState): StudioControlGroup[] {
  const showGridShimmer =
    state.loadingStyle !== "sweep" && state.lineLoadingGridShimmer;

  return [
    ...gridControlGroups,
    controlGroup("Loading", [
      {
        type: "color",
        key: "lineLoadingGridStroke",
        label: "Grid",
      },
      {
        type: "boolean",
        key: "lineLoadingGridShimmer",
        label: "Shimmer",
        visibleWhen: { key: "loadingStyle", not: "sweep" },
      },
      ...(showGridShimmer
        ? [
            {
              type: "color" as const,
              key: "lineLoadingGridShimmerStroke" as const,
              label: "Shimmer",
            },
            {
              type: "number" as const,
              key: "lineLoadingGridShimmerLength" as const,
              label: "Length",
              min: 40,
              max: 280,
              step: 10,
              unit: "px",
            },
          ]
        : []),
    ]),
    ...(showGridShimmer
      ? [
          controlGroup("Animation", [
            {
              type: "boolean" as const,
              key: "lineLoadingGridShimmerSync" as const,
              label: "Sync with line",
            },
            {
              type: "number" as const,
              key: "lineLoadingGridShimmerSpeed" as const,
              label: "Speed",
              min: 0.5,
              max: 3,
              step: 0.1,
              unit: "×",
              disabledWhen: "lineLoadingGridShimmerSync" as const,
            },
          ]),
        ]
      : []),
  ];
}

function resolveCartesianLoadingStudioComponents(options: {
  chartId: string;
  chartLabel: string;
  treeIcon: StudioComponentTreeIcon;
  gridId: string;
  labelId: string;
  lineId: string;
  lineKind: StudioComponentKind;
  lineLabel: string;
  state: StudioUrlState;
  settingsControlGroups: StudioControlGroup[];
}): StudioComponentDefinition[] {
  const {
    chartId,
    chartLabel,
    gridId,
    labelId,
    lineId,
    lineKind,
    lineLabel,
    settingsControlGroups,
    state,
    treeIcon,
  } = options;

  return [
    {
      id: chartId,
      label: chartLabel,
      kind: "chart",
      treeIcon,
      controlGroups: settingsControlGroups,
    },
    {
      id: gridId,
      label: "Grid",
      parentId: chartId,
      kind: "chart",
      controlGroups: loadingGridControlGroups(state),
    },
    {
      id: labelId,
      label: "Label",
      parentId: chartId,
      kind: "chart",
      controlGroups: [
        controlGroup("Label", [
          {
            type: "text",
            key: "lineLoadingLabel",
            label: "Text",
          },
        ]),
      ],
    },
    {
      id: lineId,
      label: lineLabel,
      parentId: chartId,
      kind: lineKind,
      controlGroups: [
        controlGroup("Line", [
          {
            type: "opacity",
            key: "lineLoadingStrokeOpacity",
            label: "Opacity",
            min: 0.1,
            max: 1,
            step: 0.05,
            color: "var(--foreground)",
          },
        ]),
      ],
      design: {
        accentKey: "lineLoadingStroke",
        colorLabel: "Line",

        supportsPattern: false,
      },
    },
  ];
}

export function resolveAreaComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const chartId = "area.chart";

  if (isAreaChartLoadingMode(state)) {
    const settings = areaChartControlGroups.find(
      (group) => group.title === "Settings"
    );
    return resolveCartesianLoadingStudioComponents({
      chartId,
      chartLabel: "AreaChart",
      gridId: "area.grid",
      labelId: "area.loading-label",
      lineId: "area.loading-line",
      lineKind: "series",
      lineLabel: "Area",
      settingsControlGroups: settings ? [settings] : [],
      state,
      treeIcon: "area-chart",
    });
  }

  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const settings = areaChartControlGroups.find(
    (group) => group.title === "Settings"
  );
  const design = areaChartControlGroups.find(
    (group) => group.title === "Design"
  );

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "AreaChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: settings ? [settings] : [],
      design: rootPaletteDesign(true),
    },
    gridNode("area"),
    backgroundNode("area"),
    referenceAreaNode("area"),
  ];

  for (let index = 0; index < seriesCount; index += 1) {
    const controlGroups: StudioControlGroup[] = [];
    if (index === 0 && design) {
      controlGroups.push(design);
    }
    controlGroups.push(
      seriesYAxisControlGroup(index),
      ...seriesScopedControlGroups(areaSeriesLineControlGroups, index)
    );

    components.push({
      id: `area.series.${index}`,
      label: `Area · ${getDesignSeriesLabel(index).replace(DESIGN_SERIES_LABEL_PREFIX, "")}`,
      parentId: chartId,
      kind: "series",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups,
      design: {
        seriesIndex: index,
        supportsPattern: true,
      },
    });
  }

  components.push(
    chartYAxisNode("area", "left", "YAxis · left"),
    chartYAxisNode("area", "right", "YAxis · right"),
    passiveNode("area", "xaxis", "XAxis"),
    chartTooltipNode("area"),
    legendNode("area"),
    brushNode("area")
  );

  return components;
}

export function resolveBarComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const settings = barChartControlGroups.find(
    (group) => group.title === "Settings"
  );
  const referenceAreaBounds = barChartControlGroups.find(
    (group) => group.title === "Reference range"
  );
  const chartId = "bar.chart";

  if (isBarChartLoadingMode(state)) {
    return [
      {
        id: chartId,
        label: "BarChart",
        kind: "chart",
        treeIcon: "layers",
        controlGroups: settings ? [settings] : [],
      },
      {
        id: "bar.grid",
        label: "Grid",
        parentId: chartId,
        kind: "chart",
        controlGroups: loadingGridControlGroups(state),
      },
    ];
  }

  const seriesCount = clampStudioSeriesCount(state.dataSeries);

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "BarChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: settings ? [settings] : [],
      design: rootPaletteDesign(true),
    },
    gridNode("bar"),
    backgroundNode("bar"),
    referenceAreaNode("bar"),
  ];

  const horizontal = state.barOrientation === "horizontal";

  for (let index = 0; index < seriesCount; index += 1) {
    const controlGroups: StudioControlGroup[] = [];
    if (index === 0 && referenceAreaBounds) {
      controlGroups.push(referenceAreaBounds);
    }
    if (!horizontal) {
      controlGroups.push(seriesYAxisControlGroup(index));
    }

    components.push({
      id: `bar.series.${index}`,
      label:
        seriesCount > 1
          ? `SeriesBar · ${STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`}`
          : "SeriesBar",
      parentId: chartId,
      kind: "series",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups,
      design: {
        seriesIndex: index,
        supportsPattern: true,
      },
    });
  }

  if (horizontal) {
    components.push(passiveNode("bar", "baryaxis", "BarYAxis"));
  } else {
    components.push(
      chartYAxisNode("bar", "left", "YAxis · left"),
      chartYAxisNode("bar", "right", "YAxis · right")
    );
  }

  components.push(
    passiveNode("bar", "xaxis", "BarXAxis"),
    chartTooltipNode("bar"),
    legendNode("bar")
  );

  return components;
}

export function resolveComposedComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const [, design] = composedChartControlGroups;
  const chartId = "composed.chart";

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "ComposedChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: [],
      design: rootPaletteDesign(true),
    },
    passiveNode("composed", "grid", "Grid"),
    backgroundNode("composed"),
    referenceAreaNode("composed"),
  ];

  for (let index = 0; index < seriesCount; index += 1) {
    const isBarSeries = index === 0;
    const controlGroups: StudioControlGroup[] = [];

    if (isBarSeries) {
      if (design) {
        controlGroups.push(design);
      }
    } else {
      if (index === 1) {
        controlGroups.push(
          controlGroup("Area", [
            {
              type: "opacity",
              key: "fillOpacity",
              label: "Opacity",
              min: 0,
              max: 1,
              step: 0.05,
              color: "var(--chart-4)",
            },
          ])
        );
      }
      controlGroups.push(
        seriesYAxisControlGroup(index),
        ...seriesScopedControlGroups(composedOverlayLineControlGroups, index)
      );
    }

    components.push({
      id: `composed.series.${index}`,
      label: isBarSeries
        ? `SeriesBar · ${STUDIO_SERIES_KEYS[0] ?? "Series 1"}`
        : `Area · ${STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`}`,
      parentId: chartId,
      kind: "series",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups,
      design: {
        seriesIndex: index,
        supportsPattern: true,
      },
    });
  }

  components.push(
    chartYAxisNode("composed", "left", "YAxis · left"),
    chartYAxisNode("composed", "right", "YAxis · right"),
    passiveNode("composed", "xaxis", "XAxis"),
    chartTooltipNode("composed"),
    legendNode("composed")
  );

  return components;
}

export function resolveFunnelComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [layout, labels] = funnelChartControlGroups;
  const chartId = "funnel.chart";

  return [
    {
      id: chartId,
      label: "Funnel",
      kind: "chart",
      treeIcon: "funnel",
      controlGroups: [...(layout ? [layout] : []), ...(labels ? [labels] : [])],
      design: { seriesIndex: 0, supportsPattern: true },
    },
    ...funnelData.map((stage, index) => ({
      id: `funnel.stage.${index}`,
      label: stage.label,
      parentId: chartId,
      kind: "series" as StudioComponentKind,
      listMarker: "color-dot" as const,
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [] as StudioControlGroup[],
      design: {
        seriesIndex: index,
        supportsPattern: true,
      },
    })),
    legendNode("funnel"),
  ];
}

export function resolvePieComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [chartProps] = pieChartControlGroups;

  return [
    {
      id: "pie.chart",
      label: "Pie",
      kind: "chart",
      treeIcon: "pie-chart",
      controlGroups: chartProps ? [chartProps] : [],
      design: { seriesIndex: 0, supportsPattern: false },
    },
    ...pieData.map((slice, index) => ({
      id: `pie.slice.${index}`,
      label: slice.label,
      parentId: "pie.chart",
      kind: "series" as StudioComponentKind,
      listMarker: "color-dot" as const,
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [] as StudioControlGroup[],
      design: {
        seriesIndex: index,
        supportsPattern: true,
      },
    })),
    ...(state.innerRadius > 0
      ? [
          {
            id: "pie.center",
            label: "PieCenter",
            parentId: "pie.chart",
            kind: "text" as StudioComponentKind,
            controlGroups: [pieCenterControlGroup],
          },
        ]
      : []),
    legendNode("pie"),
  ];
}

export function resolveLiveLineComponents(): StudioComponentDefinition[] {
  const [stream, line] = liveLineChartControlGroups;
  const chartId = "live-line.chart";

  return [
    {
      id: chartId,
      label: "LiveLineChart",
      kind: "chart",
      treeIcon: "line-chart",
      controlGroups: [],
      design: rootPaletteDesign(true),
    },
    gridNode("live-line"),
    backgroundNode("live-line"),
    referenceAreaNode("live-line"),
    {
      id: "live-line.line",
      label: "LiveLine",
      parentId: chartId,
      kind: "line",
      controlGroups: line ? [line] : [],
    },
    {
      id: "live-line.xaxis",
      label: "LiveXAxis",
      parentId: chartId,
      kind: "chart",
      controlGroups: [],
    },
    {
      id: "live-line.yaxis",
      label: "LiveYAxis",
      parentId: chartId,
      kind: "chart",
      controlGroups: [],
    },
    {
      id: "live-line.stream",
      label: "Stream",
      parentId: chartId,
      kind: "chart",
      controlGroups: stream ? [stream] : [],
    },
    legendNode("live-line"),
  ];
}

function resolveProfitLossLineComponents(): StudioComponentDefinition[] {
  const groups = getLineChartControlGroups({ lineChartMode: "profitLoss" });
  const chartId = "line.chart";
  const settings = groups.find((group) => group.title === "Settings");
  const lineControls = groups.find((group) => group.title === "Line");
  const zeroLine = groups.find((group) => group.title === "Zero line");
  const tooltip = groups.find((group) => group.title === "Tooltip");
  const crosshair = groups.find((group) => group.title === "Crosshair");
  const legend = groups.find((group) => group.title === "Legend");

  return [
    {
      id: chartId,
      label: "LineChart",
      kind: "chart",
      treeIcon: "line-chart",
      controlGroups: settings ? [settings] : [],
      design: rootPaletteDesign(false),
    },
    gridNode("line", zeroLine ? [zeroLine] : []),
    backgroundNode("line"),
    referenceAreaNode("line"),
    {
      id: "line.profit-loss",
      label: "ProfitLossLine",
      parentId: chartId,
      kind: "line",
      controlGroups: lineControls ? [lineControls] : [],
    },
    chartYAxisNode("line", "left", "YAxis · left"),
    chartYAxisNode("line", "right", "YAxis · right"),
    chartYAxisNode("line", "left", "YAxis · left"),
    chartYAxisNode("line", "right", "YAxis · right"),
    passiveNode("line", "xaxis", "XAxis"),
    chartTooltipNode("line", [
      ...(tooltip ? [tooltip] : []),
      ...(crosshair ? [crosshair] : []),
      tooltipAppearanceControlGroup,
    ]),
    {
      id: "line.legend",
      label: "ProfitLossLegend",
      parentId: chartId,
      kind: "chart",
      controlGroups: legend ? [legend] : standardLegendControlGroups,
    },
  ];
}

function appendLineSeriesComponents(
  components: StudioComponentDefinition[],
  state: StudioUrlState,
  chartId: string,
  seriesCount: number,
  projectionCount: number,
  lineControls: StudioControlGroup | undefined,
  markers: StudioControlGroup | undefined,
  terminalMarker: StudioControlGroup | undefined,
  dashTail: StudioControlGroup | undefined
) {
  for (let index = 0; index < seriesCount; index += 1) {
    const seriesId = `line.series.${index}`;
    components.push({
      id: seriesId,
      label: `Line · ${STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`}`,
      parentId: chartId,
      kind: "line",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [
        seriesYAxisControlGroup(index),
        ...seriesScopedControlGroups(
          [
            ...(lineControls ? [lineControls] : []),
            ...(markers ? [markers] : []),
            ...(terminalMarker ? [terminalMarker] : []),
            ...(dashTail ? [dashTail] : []),
          ],
          index
        ),
      ],
      design: {
        seriesIndex: index,
        supportsPattern: false,
      },
    });

    for (
      let projectionIndex = 0;
      projectionIndex < projectionCount;
      projectionIndex += 1
    ) {
      if (getProjectionSeriesIndex(state, projectionIndex) !== index) {
        continue;
      }
      components.push({
        id: `line.projection.${projectionIndex}`,
        label: `Projection · ${PROJECTION_PRESET_LABELS[projectionIndex] ?? `Projection ${projectionIndex + 1}`}`,
        parentId: seriesId,
        kind: "line",
        listMarker: "color-dot",
        swatchColor: getProjectionStroke(state, projectionIndex),
        controlGroups: projectionScopedControlGroups(
          [projectionControlGroup],
          projectionIndex
        ),
      });
    }
  }
}

export function resolveLineComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  if (isProfitLossLineMode(state)) {
    return resolveProfitLossLineComponents();
  }

  const chartId = "line.chart";
  const isLoading = state.lineChartState === "loading";
  const groups = getLineChartControlGroups({ lineChartMode: "standard" });
  const settings = groups.find((group) => group.title === "Settings");

  if (isLoading) {
    return resolveCartesianLoadingStudioComponents({
      chartId,
      chartLabel: "LineChart",
      gridId: "line.grid",
      labelId: "line.loading-label",
      lineId: "line.loading-line",
      lineKind: "line",
      lineLabel: "Line",
      settingsControlGroups: settings ? [settings] : [],
      state,
      treeIcon: "line-chart",
    });
  }

  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const projectionCount = getProjectionCount(state);
  const lineControls = groups.find((group) => group.title === "Line");
  const markers = groups.find((group) => group.title === "Markers");
  const terminalMarker =
    projectionCount > 0
      ? groups.find((group) => group.title === "Terminal marker")
      : undefined;
  const dashTail = groups.find((group) => group.title === "Dash tail");

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "LineChart",
      kind: "chart",
      treeIcon: "line-chart",
      controlGroups: settings ? [settings] : [],
      design: rootPaletteDesign(false),
    },
    gridNode("line"),
    backgroundNode("line"),
    referenceAreaNode("line"),
  ];

  appendLineSeriesComponents(
    components,
    state,
    chartId,
    seriesCount,
    projectionCount,
    lineControls,
    markers,
    terminalMarker,
    dashTail
  );

  components.push(
    chartYAxisNode("line", "left", "YAxis · left"),
    chartYAxisNode("line", "right", "YAxis · right"),
    passiveNode("line", "xaxis", "XAxis"),
    chartTooltipNode("line"),
    legendNode("line")
  );

  if (projectionCount === 0) {
    components.push(brushNode("line", standardBrushStripControlGroups));
  }

  return components;
}

export function resolveRingComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [design] = ringChartControlGroups;
  const chartId = "ring.chart";

  return [
    {
      id: chartId,
      label: "RingChart",
      kind: "chart",
      treeIcon: "pie-chart",
      controlGroups: design ? [design] : [],
      design: rootPaletteDesign(false),
    },
    ...ringData.map((ring, index) => ({
      id: `ring.layer.${index}`,
      label: ring.label,
      parentId: chartId,
      kind: "series" as StudioComponentKind,
      listMarker: "color-dot" as const,
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [] as StudioControlGroup[],
      design: {
        seriesIndex: index,
        supportsPattern: false,
      },
    })),
    {
      id: "ring.center",
      label: "RingCenter",
      parentId: chartId,
      kind: "text",
      controlGroups: [ringCenterControlGroup],
    },
    legendNode("ring"),
  ];
}

export function resolveRadarComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [layout, shape] = radarChartControlGroups;
  const chartId = "radar.chart";
  const radarSeries = getRadarData(0);

  return [
    {
      id: chartId,
      label: "RadarChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: [...(layout ? [layout] : []), ...(shape ? [shape] : [])],
      design: rootPaletteDesign(false),
    },
    passiveNode("radar", "grid", "RadarGrid"),
    passiveNode("radar", "axis", "RadarAxis"),
    passiveNode("radar", "labels", "RadarLabels"),
    ...radarSeries.map((series, index) => ({
      id: `radar.area.${index}`,
      label: series.label,
      parentId: chartId,
      kind: "series" as StudioComponentKind,
      listMarker: "color-dot" as const,
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [] as StudioControlGroup[],
      design: {
        seriesIndex: index,
        supportsPattern: false,
      },
    })),
    legendNode("radar"),
  ];
}

export function resolveScatterComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [points, interaction] = scatterChartControlGroups;
  const chartId = "scatter.chart";

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "ScatterChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: [],
      design: rootPaletteDesign(false),
    },
    gridNode("scatter"),
    backgroundNode("scatter"),
    referenceAreaNode("scatter"),
    {
      id: "scatter.desktop",
      label: "Scatter · desktop",
      parentId: chartId,
      kind: "series",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, 0),
      controlGroups: [
        seriesYAxisControlGroup(0),
        ...(points ? [points] : []),
        ...(interaction ? [interaction] : []),
      ],
      design: { seriesIndex: 0, supportsPattern: false },
    },
  ];

  if (state.scatterSecondSeries) {
    components.push({
      id: "scatter.mobile",
      label: "Scatter · mobile",
      parentId: chartId,
      kind: "series",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, 1),
      controlGroups: [seriesYAxisControlGroup(1)],
      design: { seriesIndex: 1, supportsPattern: false },
    });
  }

  components.push(
    chartYAxisNode("scatter", "left", "YAxis · left"),
    chartYAxisNode("scatter", "right", "YAxis · right"),
    passiveNode("scatter", "xaxis", "XAxis"),
    chartTooltipNode("scatter"),
    legendNode("scatter")
  );

  return components;
}

export function resolveCandlestickComponents(
  _state: StudioUrlState
): StudioComponentDefinition[] {
  const [design, candles] = candlestickChartControlGroups;
  const chartId = "candlestick.chart";

  return [
    {
      id: chartId,
      label: "CandlestickChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: design ? [design] : [],
      design: { seriesIndex: 0, supportsPattern: true },
    },
    gridNode("candlestick"),
    backgroundNode("candlestick"),
    referenceAreaNode("candlestick"),
    {
      id: "candlestick.candles",
      label: "Candlestick",
      parentId: chartId,
      kind: "series",
      controlGroups: candles ? [candles] : [],
    },
    chartTooltipNode("candlestick"),
    chartYAxisNode("candlestick", "left", "YAxis · left"),
    chartYAxisNode("candlestick", "right", "YAxis · right"),
    passiveNode("candlestick", "xaxis", "XAxis"),
    legendNode("candlestick"),
  ];
}

export function resolveChoroplethComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const [design] = choroplethChartControlGroups;
  const chartId = "choropleth.chart";

  return [
    {
      id: chartId,
      label: "ChoroplethChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: design ? [design] : [],
      design: { seriesIndex: 0, supportsPattern: true },
    },
    ...(state.showGraticule
      ? [
          {
            id: "choropleth.graticule",
            label: "ChoroplethGraticule",
            parentId: chartId,
            kind: "geometry" as StudioComponentKind,
            controlGroups: [] as StudioControlGroup[],
          },
        ]
      : []),
    {
      id: "choropleth.features",
      label: "ChoroplethFeatureComponent",
      parentId: chartId,
      kind: "series",
      controlGroups: [],
    },
    {
      id: "choropleth.tooltip",
      label: "ChoroplethTooltip",
      parentId: chartId,
      kind: "chart",
      controlGroups: [tooltipAppearanceControlGroup],
    },
    legendNode("choropleth"),
  ];
}

export function resolveSankeyComponents(): StudioComponentDefinition[] {
  const [layout] = sankeyChartControlGroups;
  const chartId = "sankey.chart";

  return [
    {
      id: chartId,
      label: "SankeyChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: layout ? [layout] : [],
      design: rootPaletteDesign(false),
    },
    {
      id: "sankey.node",
      label: "SankeyNode",
      parentId: chartId,
      kind: "series",
      controlGroups: [],
    },
    {
      id: "sankey.link",
      label: "SankeyLink",
      parentId: chartId,
      kind: "line",
      controlGroups: [],
    },
    {
      id: "sankey.tooltip",
      label: "SankeyTooltip",
      parentId: chartId,
      kind: "chart",
      controlGroups: [tooltipAppearanceControlGroup],
    },
    legendNode("sankey"),
  ];
}

export function resolveHeatmapComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const chartId = "heatmap.chart";
  const chartControlGroups = heatmapChartControlGroups;

  if (state.heatmapChartState === "loading") {
    return [
      {
        id: chartId,
        label: "HeatmapChart",
        kind: "chart",
        treeIcon: "layers",
        controlGroups: chartControlGroups,
      },
      {
        id: "heatmap.loading-label",
        label: "Label",
        parentId: chartId,
        kind: "chart",
        controlGroups: [
          controlGroup("Label", [
            {
              type: "text",
              key: "heatmapLoadingLabel",
              label: "Text",
            },
          ]),
        ],
      },
      {
        id: "heatmap.loading-cells",
        label: "Cells",
        parentId: chartId,
        kind: "chart",
        controlGroups: [
          controlGroup("Loading", [
            {
              type: "opacity",
              key: "heatmapLoadingOpacity",
              label: "Chart opacity",
              min: 0.1,
              max: 1,
              step: 0.05,
              color: "var(--foreground)",
            },
          ]),
          controlGroup("Animation", [
            {
              type: "opacity",
              key: "heatmapLoadingCellMaxOpacity",
              label: "Cell max",
              min: 0.05,
              max: 1,
              step: 0.05,
              color: "var(--chart-1)",
            },
            {
              type: "number",
              key: "heatmapLoadingCellRandomness",
              label: "Randomness",
              min: 0,
              max: 1,
              step: 0.05,
            },
          ]),
        ],
      },
    ];
  }

  return [
    {
      id: chartId,
      label: "HeatmapChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: chartControlGroups,
    },
    {
      id: "heatmap.cells",
      label: "HeatmapCells",
      parentId: chartId,
      kind: "chart",
      controlGroups: heatmapCellsControlGroups,
    },
    passiveNode("heatmap", "xaxis", "HeatmapXAxis"),
    passiveNode("heatmap", "yaxis", "HeatmapYAxis"),
    {
      id: "heatmap.tooltip",
      label: "HeatmapTooltip",
      parentId: chartId,
      kind: "chart",
      controlGroups: [tooltipAppearanceControlGroup],
    },
    {
      id: "heatmap.legend",
      label: "HeatmapLegend",
      parentId: chartId,
      kind: "chart",
      controlGroups: heatmapLegendControlGroups,
    },
  ];
}

export function getStudioComponents(
  config: StudioChartConfig,
  state: StudioUrlState
): StudioComponentDefinition[] {
  const components = config.resolveComponents
    ? config.resolveComponents(state)
    : groupsToComponents(getStudioControlGroups(config, state), {
        supportsPatterns: config.supportsPatterns,
      });

  return components.filter((component) => !isStudioDataComponent(component));
}

export function findStudioComponent(
  components: StudioComponentDefinition[],
  id: string | null | undefined
): StudioComponentDefinition | undefined {
  if (!id) {
    return undefined;
  }
  return components.find((component) => component.id === id);
}

export function defaultStudioComponentId(
  components: StudioComponentDefinition[]
): string {
  return firstConfigurableStudioComponentId(components);
}

/** Depth for tree indent (0 = root). */
export function studioComponentDepth(
  components: StudioComponentDefinition[],
  id: string
): number {
  const component = findStudioComponent(components, id);
  if (!component?.parentId) {
    return 0;
  }
  return 1 + studioComponentDepth(components, component.parentId);
}

export function flattenStudioComponents(
  components: StudioComponentDefinition[]
): StudioComponentDefinition[] {
  const roots = components.filter(
    (component) =>
      !(
        component.parentId &&
        components.some((item) => item.id === component.parentId)
      )
  );
  const result: StudioComponentDefinition[] = [];

  function walk(list: StudioComponentDefinition[]) {
    for (const component of list) {
      result.push(component);
      walk(components.filter((item) => item.parentId === component.id));
    }
  }

  walk(roots);
  return result.length > 0 ? result : components;
}
