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
