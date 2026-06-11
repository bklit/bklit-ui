import type { IconName } from "@bklitui/icons";
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

/** Central icon for a row in the studio components panel (excluding color dots). */
export function resolveStudioComponentTreeIcon(
  component: StudioComponentDefinition,
  chartSlug: ChartSlug
): IconName {
  if (isChartRoot(component)) {
    return getChartTypeIcon(chartSlug);
  }
  if (isLegend(component)) {
    return "IconListBullets";
  }
  if (isGrid(component) || isGraticule(component)) {
    return "IconCanvasGrid";
  }
  if (isYAxis(component)) {
    return "IconLayoutAlignLeft";
  }
  if (isXAxis(component)) {
    return "IconLayoutAlignBottom";
  }
  if (isTooltip(component)) {
    return "IconCursorClick";
  }
  if (isCenterText(component)) {
    return "IconNoteText";
  }
  return "IconLayersTwo";
}
