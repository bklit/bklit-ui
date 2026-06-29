import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioComponentDefinition } from "@/lib/types";

const HIDDEN_SEP = "|";

export function parseHiddenStudioComponents(raw: string): Set<string> {
  if (!raw.trim()) {
    return new Set();
  }
  return new Set(
    raw
      .split(HIDDEN_SEP)
      .map((part) => part.trim())
      .filter(Boolean)
  );
}

export function serializeHiddenStudioComponents(ids: Iterable<string>): string {
  return [...ids].filter(Boolean).join(HIDDEN_SEP);
}

/** Y axes and reference area hidden until toggled in the components tree. */
export function chartDefaultHiddenYAxes(chartPrefix: string): string {
  return serializeHiddenStudioComponents([
    `${chartPrefix}.yaxis.left`,
    `${chartPrefix}.yaxis.right`,
    `${chartPrefix}.reference-area`,
  ]);
}

/** Default hidden layers for a cartesian chart (axes, reference area, legend, brush). */
export function chartDefaultHiddenComponents(
  chartPrefix: string,
  options: { showLegend?: boolean; showBrush?: boolean } = {}
): string {
  const hidden = new Set(
    parseHiddenStudioComponents(chartDefaultHiddenYAxes(chartPrefix))
  );
  if (options.showLegend === false) {
    hidden.add(`${chartPrefix}.legend`);
  }
  if (options.showBrush === false) {
    hidden.add(`${chartPrefix}.brush`);
  }
  return serializeHiddenStudioComponents(hidden);
}

/** @deprecated Use {@link chartDefaultHiddenYAxes} with `"line"`. */
export const LINE_CHART_DEFAULT_HIDDEN_Y_AXES = chartDefaultHiddenYAxes("line");

export function isStudioComponentVisible(
  state: StudioUrlState,
  componentId: string
): boolean {
  return !parseHiddenStudioComponents(state.hiddenComponents).has(componentId);
}

export function toggleStudioComponentVisibility(
  state: StudioUrlState,
  componentId: string
): string {
  const hidden = parseHiddenStudioComponents(state.hiddenComponents);
  if (hidden.has(componentId)) {
    hidden.delete(componentId);
  } else {
    hidden.add(componentId);
  }
  return serializeHiddenStudioComponents(hidden);
}

export function isStudioComponentConfigurable(
  component: StudioComponentDefinition
): boolean {
  const hasControls = component.controlGroups.some(
    (group) => group.controls.length > 0
  );
  return hasControls || Boolean(component.design);
}

export function firstConfigurableStudioComponentId(
  components: StudioComponentDefinition[]
): string {
  const configurable = components.find(isStudioComponentConfigurable);
  return configurable?.id ?? components[0]?.id ?? "chart";
}
