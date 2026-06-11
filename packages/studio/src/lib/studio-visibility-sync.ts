import type { ChartSlug } from "@/chart-slugs";
import {
  parseHiddenStudioComponents,
  serializeHiddenStudioComponents,
} from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";

function legendComponentIdForChart(chart: ChartSlug): string | null {
  switch (chart) {
    case "line-chart":
      return "line.legend";
    case "area-chart":
      return "area.legend";
    case "bar-chart":
      return "bar.legend";
    case "composed-chart":
      return "composed.legend";
    case "scatter-chart":
      return "scatter.legend";
    case "candlestick-chart":
      return "candlestick.legend";
    case "live-line-chart":
      return "live-line.legend";
    case "pie-chart":
      return "pie.legend";
    case "ring-chart":
      return "ring.legend";
    case "radar-chart":
      return "radar.legend";
    case "funnel-chart":
      return "funnel.legend";
    case "gauge-chart":
      return "gauge.legend";
    case "choropleth-chart":
      return "choropleth.legend";
    case "sankey-chart":
      return "sankey.legend";
    case "heatmap-chart":
      return "heatmap.legend";
    default:
      return null;
  }
}

function brushComponentIdForChart(chart: ChartSlug): string | null {
  switch (chart) {
    case "line-chart":
      return "line.brush";
    case "area-chart":
      return "area.brush";
    default:
      return null;
  }
}

function setComponentHidden(
  hidden: Set<string>,
  componentId: string,
  hide: boolean
) {
  if (hide) {
    hidden.add(componentId);
  } else {
    hidden.delete(componentId);
  }
}

function syncFlagFromHiddenChange(
  updates: Partial<StudioUrlState>,
  prevHidden: Set<string>,
  nextHidden: Set<string>
) {
  for (const componentId of new Set([...prevHidden, ...nextHidden])) {
    if (componentId.endsWith(".legend")) {
      const wasHidden = prevHidden.has(componentId);
      const isHidden = nextHidden.has(componentId);
      if (wasHidden !== isHidden) {
        updates.showLegend = !isHidden;
      }
      continue;
    }
    if (componentId.endsWith(".brush")) {
      const wasHidden = prevHidden.has(componentId);
      const isHidden = nextHidden.has(componentId);
      if (wasHidden !== isHidden) {
        updates.showBrush = !isHidden;
      }
    }
  }
}

/** Keep legend/brush eye toggles and Show switches on the same visibility state. */
export function expandStudioParamUpdate(
  prev: StudioUrlState,
  update: Partial<StudioUrlState>
): Partial<StudioUrlState> {
  const merged = { ...update };

  if ("showLegend" in update && update.showLegend !== undefined) {
    const legendId = legendComponentIdForChart(prev.chart);
    if (legendId) {
      const hidden = parseHiddenStudioComponents(prev.hiddenComponents);
      setComponentHidden(hidden, legendId, !update.showLegend);
      merged.hiddenComponents = serializeHiddenStudioComponents(hidden);
    }
  }

  if ("showBrush" in update && update.showBrush !== undefined) {
    const brushId = brushComponentIdForChart(prev.chart);
    if (brushId) {
      const hidden = parseHiddenStudioComponents(
        (merged.hiddenComponents as string | undefined) ?? prev.hiddenComponents
      );
      setComponentHidden(hidden, brushId, !update.showBrush);
      merged.hiddenComponents = serializeHiddenStudioComponents(hidden);
    }
  }

  if ("hiddenComponents" in update && update.hiddenComponents !== undefined) {
    const prevHidden = parseHiddenStudioComponents(prev.hiddenComponents);
    const nextHidden = parseHiddenStudioComponents(update.hiddenComponents);
    syncFlagFromHiddenChange(merged, prevHidden, nextHidden);
  }

  return merged;
}
