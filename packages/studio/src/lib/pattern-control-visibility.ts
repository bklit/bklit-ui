import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getProjectionScopedControlValue,
  isPerProjectionControlKey,
} from "@/lib/studio-projection-props";
import {
  getSeriesScopedControlValue,
  isPerSeriesLineControlKey,
} from "@/lib/studio-series-line-props";
import type { StudioControl, StudioControlVisibilityRule } from "@/lib/types";

interface ControlScope {
  projectionIndex?: number;
  seriesIndex?: number;
}

function resolveVisibilityStateValue(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  { projectionIndex, seriesIndex }: ControlScope
): unknown {
  if (projectionIndex !== undefined && isPerProjectionControlKey(key)) {
    return getProjectionScopedControlValue(state, key, projectionIndex);
  }
  if (seriesIndex !== undefined && isPerSeriesLineControlKey(key)) {
    return getSeriesScopedControlValue(state, key, seriesIndex);
  }
  return state[key];
}

function matchesValue(
  value: unknown,
  expected: string | readonly string[] | undefined
): boolean {
  if (expected === undefined) {
    return true;
  }
  const values = Array.isArray(expected) ? expected : [expected];
  return values.some(
    (entry) => entry === value || String(entry) === String(value)
  );
}

function matchesRule(
  state: StudioUrlState,
  rule: StudioControlVisibilityRule,
  scope: ControlScope
): boolean {
  const value = resolveVisibilityStateValue(state, rule.key, scope);
  if (rule.truthy === true && !value) {
    return false;
  }
  if (rule.truthy === false && value) {
    return false;
  }
  if (rule.equals !== undefined && !matchesValue(value, rule.equals)) {
    return false;
  }
  if (rule.not !== undefined && matchesValue(value, rule.not)) {
    return false;
  }
  return true;
}

export function isStudioControlVisible(
  control: StudioControl,
  state: StudioUrlState
): boolean {
  const rule = control.visibleWhen;
  if (!rule) {
    return true;
  }

  const rules = Array.isArray(rule) ? rule : [rule];
  const scope: ControlScope = {
    projectionIndex:
      "projectionIndex" in control ? control.projectionIndex : undefined,
    seriesIndex: "seriesIndex" in control ? control.seriesIndex : undefined,
  };
  return rules.every((entry) => matchesRule(state, entry, scope));
}
