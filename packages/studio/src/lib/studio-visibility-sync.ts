import type { ChartSlug } from "@/chart-slugs";
import {
  parseHiddenStudioComponents,
  serializeHiddenStudioComponents,
} from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getProjectionCount,
  isLineChartBrushAvailable,
} from "@/lib/studio-projection-props";

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

function syncLegendHidden(
  hidden: Set<string>,
  legendId: string,
  showLegend: boolean
): boolean {
  const shouldHide = !showLegend;
  if (shouldHide && !hidden.has(legendId)) {
    hidden.add(legendId);
    return true;
  }
  if (!shouldHide && hidden.has(legendId)) {
    hidden.delete(legendId);
    return true;
  }
  return false;
}

function syncBrushHidden(
  hidden: Set<string>,
  brushId: string,
  state: StudioUrlState
): boolean {
  const projectionsBlockBrush =
    state.chart === "line-chart" && !isLineChartBrushAvailable(state);
  const shouldHide = !state.showBrush || projectionsBlockBrush;
  if (shouldHide && !hidden.has(brushId)) {
    hidden.add(brushId);
    return true;
  }
  if (!shouldHide && hidden.has(brushId)) {
    hidden.delete(brushId);
    return true;
  }
  return false;
}

function disableBrushForProjections(
  merged: Partial<StudioUrlState>,
  prev: StudioUrlState
): Partial<StudioUrlState> {
  if (
    prev.chart !== "line-chart" ||
    getProjectionCount({ ...prev, ...merged }) === 0
  ) {
    return merged;
  }

  const brushId = brushComponentIdForChart(prev.chart);
  if (!brushId) {
    return { ...merged, showBrush: false };
  }

  const hidden = parseHiddenStudioComponents(
    (merged.hiddenComponents as string | undefined) ?? prev.hiddenComponents
  );
  setComponentHidden(hidden, brushId, true);
  return {
    ...merged,
    showBrush: false,
    hiddenComponents: serializeHiddenStudioComponents(hidden),
  };
}

/** Align legend/brush eye toggles with Show switches (both directions). */
export function reconcileOverlayVisibility(
  state: StudioUrlState
): Partial<StudioUrlState> {
  const legendId = legendComponentIdForChart(state.chart);
  const brushId = brushComponentIdForChart(state.chart);
  if (!(legendId || brushId)) {
    return {};
  }

  const hidden = parseHiddenStudioComponents(state.hiddenComponents);
  let changed = false;

  if (legendId) {
    changed = syncLegendHidden(hidden, legendId, state.showLegend) || changed;
  }

  if (brushId) {
    changed = syncBrushHidden(hidden, brushId, state) || changed;
  }

  const updates: Partial<StudioUrlState> = {};
  if (
    state.chart === "line-chart" &&
    getProjectionCount(state) > 0 &&
    state.showBrush
  ) {
    updates.showBrush = false;
  }

  if (!changed && Object.keys(updates).length === 0) {
    return {};
  }

  return {
    ...updates,
    hiddenComponents: serializeHiddenStudioComponents(hidden),
  };
}

function applyShowLegendUpdate(
  prev: StudioUrlState,
  merged: Partial<StudioUrlState>,
  showLegend: boolean
) {
  const legendId = legendComponentIdForChart(prev.chart);
  if (!legendId) {
    return;
  }
  const hidden = parseHiddenStudioComponents(prev.hiddenComponents);
  setComponentHidden(hidden, legendId, !showLegend);
  merged.hiddenComponents = serializeHiddenStudioComponents(hidden);
}

function applyShowBrushUpdate(
  prev: StudioUrlState,
  merged: Partial<StudioUrlState>,
  showBrush: boolean
) {
  const brushId = brushComponentIdForChart(prev.chart);
  if (!brushId) {
    return;
  }
  const enableBrush =
    showBrush &&
    (prev.chart !== "line-chart" ||
      isLineChartBrushAvailable({ ...prev, ...merged }));
  if (!enableBrush) {
    merged.showBrush = false;
  }
  const hidden = parseHiddenStudioComponents(
    (merged.hiddenComponents as string | undefined) ?? prev.hiddenComponents
  );
  setComponentHidden(hidden, brushId, !enableBrush);
  merged.hiddenComponents = serializeHiddenStudioComponents(hidden);
}

/** Keep legend/brush eye toggles and Show switches on the same visibility state. */
export function expandStudioParamUpdate(
  prev: StudioUrlState,
  update: Partial<StudioUrlState>
): Partial<StudioUrlState> {
  const merged = { ...update };

  if ("showLegend" in update && update.showLegend !== undefined) {
    applyShowLegendUpdate(prev, merged, update.showLegend);
  }

  if ("showBrush" in update && update.showBrush !== undefined) {
    applyShowBrushUpdate(prev, merged, update.showBrush);
  }

  if ("projectionCount" in update && update.projectionCount !== undefined) {
    const nextCount = getProjectionCount({ ...prev, ...merged });
    if (prev.chart === "line-chart" && nextCount > 0) {
      Object.assign(merged, disableBrushForProjections(merged, prev));
    }
  }

  if ("hiddenComponents" in update && update.hiddenComponents !== undefined) {
    const prevHidden = parseHiddenStudioComponents(prev.hiddenComponents);
    const nextHidden = parseHiddenStudioComponents(update.hiddenComponents);
    syncFlagFromHiddenChange(merged, prevHidden, nextHidden);
  }

  if (
    prev.chart === "line-chart" &&
    getProjectionCount({ ...prev, ...merged }) > 0 &&
    merged.showBrush === true
  ) {
    Object.assign(merged, disableBrushForProjections(merged, prev));
  }

  if (update.gaugeLinear === true && !("uniformWidth" in update)) {
    merged.uniformWidth = true;
  }

  return merged;
}
