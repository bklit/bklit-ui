import {
  clampStudioSeriesCount,
  funnelData,
  getRadarData,
  pieData,
  ringData,
  STUDIO_SERIES_KEYS,
} from "@/lib/demo-data";
import { isProfitLossLineMode } from "@/lib/line-chart-mode";
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
  StudioControlGroup,
} from "@/lib/types";
import { getStudioControlGroups } from "./control-groups";
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
  liveLineChartControlGroups,
  pieCenterControlGroup,
  pieChartControlGroups,
  radarChartControlGroups,
  ringCenterControlGroup,
  ringChartControlGroups,
  sankeyChartControlGroups,
  scatterChartControlGroups,
  standardChartTooltipControlGroups,
  standardLegendControlGroups,
  tooltipAppearanceControlGroup,
} from "./registry-control-groups";
import { controlGroup } from "./sidebar-control-templates";
import { firstConfigurableStudioComponentId } from "./studio-component-visibility";

const DESIGN_SERIES_LABEL_PREFIX = /^Series \d+ · /;

function rootPaletteDesign(
  supportsPattern = false
): StudioComponentDefinition["design"] {
  return { seriesIndex: 0, showPalette: true, supportsPattern };
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
              showPalette: true,
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
      design: { seriesIndex: 0, supportsPattern: true, showPalette: false },
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
  const dataGroupConfig = groups.find((group) => group.title === "Data");
  return dataGroupConfig ? [dataGroupConfig] : [];
}

export function resolveAreaComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const [, design] = areaChartControlGroups;
  const chartId = "area.chart";

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "AreaChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: [],
      design: rootPaletteDesign(true),
    },
    passiveNode("area", "grid", "Grid"),
  ];

  for (let index = 0; index < seriesCount; index += 1) {
    const controlGroups: StudioControlGroup[] = [];
    if (index === 0 && design) {
      controlGroups.push(design);
    }
    controlGroups.push(
      seriesYAxisControlGroup(index),
      ...areaSeriesLineControlGroups
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
        showPalette: index === 0,
      },
    });
  }

  components.push(
    chartYAxisNode("area", "left", "YAxis · left"),
    chartYAxisNode("area", "right", "YAxis · right"),
    passiveNode("area", "xaxis", "XAxis"),
    chartTooltipNode("area"),
    legendNode("area")
  );

  return components;
}

export function resolveBarComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const [seriesLayout, design] = barChartControlGroups;
  const chartId = "bar.chart";

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "BarChart",
      kind: "chart",
      treeIcon: "layers",
      controlGroups: seriesLayout ? [seriesLayout] : [],
      design: rootPaletteDesign(true),
    },
    passiveNode("bar", "grid", "Grid"),
  ];

  const horizontal = state.barOrientation === "horizontal";

  for (let index = 0; index < seriesCount; index += 1) {
    const controlGroups: StudioControlGroup[] = [];
    if (index === 0 && design) {
      controlGroups.push(design);
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
        showPalette: index === 0,
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
        ...composedOverlayLineControlGroups
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
        showPalette: index === 0,
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
      design: { seriesIndex: 0, supportsPattern: true, showPalette: true },
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
        showPalette: false,
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
      design: { seriesIndex: 0, supportsPattern: false, showPalette: true },
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
        showPalette: false,
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
    passiveNode("live-line", "grid", "Grid"),
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
  const seriesStyle = groups.find((group) => group.title === "Series style");
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
      controlGroups: seriesStyle ? [seriesStyle] : [],
      design: rootPaletteDesign(false),
    },
    {
      id: "line.grid",
      label: "Grid",
      parentId: chartId,
      kind: "chart",
      controlGroups: zeroLine ? [zeroLine] : [],
    },
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

export function resolveLineComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  if (isProfitLossLineMode(state)) {
    return resolveProfitLossLineComponents();
  }

  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const groups = getLineChartControlGroups({ lineChartMode: "standard" });
  const lineControls = groups.find((group) => group.title === "Line");
  const markers = groups.find((group) => group.title === "Markers");
  const dashTail = groups.find((group) => group.title === "Dash tail");
  const seriesStyle = groups.find((group) => group.title === "Series style");
  const chartId = "line.chart";

  const components: StudioComponentDefinition[] = [
    {
      id: chartId,
      label: "LineChart",
      kind: "chart",
      treeIcon: "line-chart",
      controlGroups: seriesStyle ? [seriesStyle] : [],
      design: rootPaletteDesign(false),
    },
    passiveNode("line", "grid", "Grid"),
  ];

  for (let index = 0; index < seriesCount; index += 1) {
    components.push({
      id: `line.series.${index}`,
      label: `Line · ${STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`}`,
      parentId: chartId,
      kind: "line",
      listMarker: "color-dot",
      swatchColor: getEffectiveSeriesColor(state, index),
      controlGroups: [
        seriesYAxisControlGroup(index),
        ...(lineControls ? [lineControls] : []),
        ...(markers ? [markers] : []),
        ...(dashTail ? [dashTail] : []),
      ],
      design: {
        seriesIndex: index,
        supportsPattern: false,
        showPalette: index === 0,
      },
    });
  }

  components.push(
    chartYAxisNode("line", "left", "YAxis · left"),
    chartYAxisNode("line", "right", "YAxis · right"),
    passiveNode("line", "xaxis", "XAxis"),
    chartTooltipNode("line"),
    legendNode("line")
  );

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
        showPalette: false,
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
        showPalette: false,
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
    passiveNode("scatter", "grid", "Grid"),
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
      design: { seriesIndex: 0, supportsPattern: false, showPalette: true },
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
      design: { seriesIndex: 1, supportsPattern: false, showPalette: false },
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
      design: { seriesIndex: 0, supportsPattern: true, showPalette: true },
    },
    {
      id: "candlestick.candles",
      label: "Candlestick",
      parentId: chartId,
      kind: "series",
      controlGroups: candles ? [candles] : [],
    },
    chartTooltipNode("candlestick"),
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
      design: { seriesIndex: 0, supportsPattern: true, showPalette: true },
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
