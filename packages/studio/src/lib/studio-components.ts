import { clampStudioSeriesCount, STUDIO_SERIES_KEYS } from "@/lib/demo-data";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getDesignSeriesLabel } from "@/lib/studio-series-design";
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
  composedOverlayLineControlGroups,
  gaugeControlGroups,
} from "./registry-control-groups";
import { controlGroup } from "./sidebar-control-templates";

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
      id: "gauge.arc-fill",
      label: "Arc fill",
      kind: "series",
      controlGroups: design ? [design] : [],
      design: { seriesIndex: 0, supportsPattern: true, showPalette: true },
    },
    {
      id: "gauge.center",
      label: "Center",
      kind: "text",
      controlGroups: center ? [center] : [],
    },
    {
      id: "gauge.notches",
      label: "Notches",
      kind: "geometry",
      controlGroups: notches ? [notches] : [],
    },
    {
      id: "gauge.arc",
      label: "Arc",
      kind: "geometry",
      controlGroups: arc ? [arc] : [],
    },
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

  const components: StudioComponentDefinition[] = [];

  for (let index = 0; index < seriesCount; index += 1) {
    const controlGroups: StudioControlGroup[] = [];
    if (index === 0 && design) {
      controlGroups.push(design);
    }
    controlGroups.push(...areaSeriesLineControlGroups);

    components.push({
      id: `series.${index}`,
      label: getDesignSeriesLabel(index),
      kind: "series",
      controlGroups,
      design: {
        seriesIndex: index,
        supportsPattern: true,
        showPalette: index === 0,
      },
    });
  }

  return components;
}

export function resolveBarComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const seriesCount = clampStudioSeriesCount(state.dataSeries);
  const [seriesLayout, design] = barChartControlGroups;

  const components: StudioComponentDefinition[] = [
    {
      id: "chart.series-layout",
      label: "Series layout",
      kind: "chart",
      controlGroups: seriesLayout ? [seriesLayout] : [],
    },
  ];

  for (let index = 0; index < seriesCount; index += 1) {
    components.push({
      id: `series.${index}`,
      label:
        seriesCount > 1
          ? getDesignSeriesLabel(index)
          : (STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`),
      kind: "series",
      controlGroups: index === 0 && design ? [design] : [],
      design: {
        seriesIndex: index,
        supportsPattern: true,
        showPalette: index === 0,
      },
    });
  }

  return components;
}

export function resolveComposedComponents(
  state: StudioUrlState
): StudioComponentDefinition[] {
  const seriesCount = clampStudioSeriesCount(state.dataSeries);

  const components: StudioComponentDefinition[] = [];

  for (let index = 0; index < seriesCount; index += 1) {
    const isBarSeries = index === 0;
    const controlGroups: StudioControlGroup[] = [];

    if (isBarSeries) {
      controlGroups.push(
        controlGroup("Bar", [
          {
            type: "number",
            key: "composedBarRadius",
            label: "Radius",
            min: 0,
            max: 12,
            unit: "px",
          },
        ])
      );
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
      controlGroups.push(...composedOverlayLineControlGroups);
    }

    components.push({
      id: `series.${index}`,
      label: getDesignSeriesLabel(index),
      kind: "series",
      controlGroups,
      design: {
        seriesIndex: index,
        supportsPattern: true,
        showPalette: index === 0,
      },
    });
  }

  return components;
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
  return components[0]?.id ?? "chart";
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
