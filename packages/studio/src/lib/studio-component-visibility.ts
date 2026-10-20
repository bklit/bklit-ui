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

/**
 * Y axes and reference area hidden until toggled in the components tree.
 * Trend line is also hidden by default, via opt-in tokens (see below).
 */
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

/**
 * Opt-in layers stay hidden unless `hiddenComponents` holds a `+<id>` token.
 * Used for layers added after share URLs existed (trend line) so older URLs
 * with an explicit `hiddenComponents` list keep rendering unchanged.
 */
const OPT_IN_COMPONENT_SUFFIXES = [".trend-line"] as const;
const SHOWN_TOKEN_PREFIX = "+";

function isOptInStudioComponent(componentId: string): boolean {
  return OPT_IN_COMPONENT_SUFFIXES.some((suffix) =>
    componentId.endsWith(suffix)
  );
}

function isHiddenInSet(hidden: Set<string>, componentId: string): boolean {
  if (isOptInStudioComponent(componentId)) {
    return !hidden.has(`${SHOWN_TOKEN_PREFIX}${componentId}`);
  }
  return hidden.has(componentId);
}

/** Mutates `hidden` so `componentId` is hidden (or shown); handles opt-in layers. */
export function setStudioComponentHidden(
  hidden: Set<string>,
  componentId: string,
  hide: boolean
): void {
  const token = isOptInStudioComponent(componentId)
    ? `${SHOWN_TOKEN_PREFIX}${componentId}`
    : componentId;
  const addToken = isOptInStudioComponent(componentId) ? !hide : hide;
  if (addToken) {
    hidden.add(token);
  } else {
    hidden.delete(token);
  }
}

export function isStudioComponentVisible(
  state: StudioUrlState,
  componentId: string
): boolean {
  return !isHiddenInSet(
    parseHiddenStudioComponents(state.hiddenComponents),
    componentId
  );
}

export function toggleStudioComponentVisibility(
  state: StudioUrlState,
  componentId: string
): string {
  const hidden = parseHiddenStudioComponents(state.hiddenComponents);
  setStudioComponentHidden(
    hidden,
    componentId,
    !isHiddenInSet(hidden, componentId)
  );
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
