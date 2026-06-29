import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  getProjectionScopedControlValue,
  isPerProjectionControlKey,
} from "@/lib/studio-projection-props";
import type { StudioControl, StudioControlVisibilityRule } from "@/lib/types";

function resolveVisibilityStateValue(
  state: StudioUrlState,
  key: keyof StudioUrlState,
  projectionIndex?: number
): unknown {
  if (projectionIndex !== undefined && isPerProjectionControlKey(key)) {
    return getProjectionScopedControlValue(state, key, projectionIndex);
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
  projectionIndex?: number
): boolean {
  const value = resolveVisibilityStateValue(state, rule.key, projectionIndex);
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
  const projectionIndex =
    "projectionIndex" in control ? control.projectionIndex : undefined;
  return rules.every((entry) => matchesRule(state, entry, projectionIndex));
}
