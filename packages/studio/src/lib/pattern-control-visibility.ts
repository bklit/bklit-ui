import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControl, StudioControlVisibilityRule } from "@/lib/types";

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
  rule: StudioControlVisibilityRule
): boolean {
  const value = state[rule.key];
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
  return rules.every((entry) => matchesRule(state, entry));
}
