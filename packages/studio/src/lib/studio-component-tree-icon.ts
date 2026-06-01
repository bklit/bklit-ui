import {
  AlignBottomIcon,
  AlignLeftIcon,
  CursorPointer02Icon,
  GridIcon,
  LayerIcon,
  LeftToRightListDashIcon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { getChartTypeIcon } from "@/components/chart-type-icons";
import type { ChartSlug, StudioComponentDefinition } from "@/lib/types";

function isChartRoot(component: StudioComponentDefinition): boolean {
  return !component.parentId && component.id.endsWith(".chart");
}

function isLegend(component: StudioComponentDefinition): boolean {
  return component.label.includes("Legend") || component.id.endsWith(".legend");
}

function isGrid(component: StudioComponentDefinition): boolean {
  return (
    component.label === "Grid" ||
    component.label === "RadarGrid" ||
    component.id.endsWith(".grid")
  );
}

function isGraticule(component: StudioComponentDefinition): boolean {
  return (
    component.label.includes("Graticule") || component.id.includes("graticule")
  );
}

function isYAxis(component: StudioComponentDefinition): boolean {
  return component.label.includes("YAxis");
}

function isXAxis(component: StudioComponentDefinition): boolean {
  return component.label.includes("XAxis");
}

function isTooltip(component: StudioComponentDefinition): boolean {
  return (
    component.label.includes("Tooltip") || component.id.endsWith(".tooltip")
  );
}

function isCenterText(component: StudioComponentDefinition): boolean {
  return (
    component.label === "PieCenter" || component.label === "PieCenterShell"
  );
}

/** Hugeicons marker for a row in the studio components panel (excluding color dots). */
export function resolveStudioComponentTreeIcon(
  component: StudioComponentDefinition,
  chartSlug: ChartSlug
): IconSvgElement {
  if (isChartRoot(component)) {
    return getChartTypeIcon(chartSlug);
  }
  if (isLegend(component)) {
    return LeftToRightListDashIcon;
  }
  if (isGrid(component) || isGraticule(component)) {
    return GridIcon;
  }
  if (isYAxis(component)) {
    return AlignLeftIcon;
  }
  if (isXAxis(component)) {
    return AlignBottomIcon;
  }
  if (isTooltip(component)) {
    return CursorPointer02Icon;
  }
  if (isCenterText(component)) {
    return TextIcon;
  }
  return LayerIcon;
}
