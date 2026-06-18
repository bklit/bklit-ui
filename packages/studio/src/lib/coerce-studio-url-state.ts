import { defaultStudioState, type StudioUrlState } from "./studio-parsers";
import { STUDIO_STATE_KEY_ORDER } from "./studio-url-key-orders";
import { loadStudioSearchParams } from "./studio-url-loader";

function serializeParamValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

/**
 * Re-parse delta-decoded state through the nuqs parsers so every field has its
 * declared primitive type (string fields are always strings, number fields are
 * always numbers). This is the crash guard: chart code calls `.trim()` on string
 * props, which throws if a stale/mismapped URL left a number there.
 */
export function coerceStudioUrlState(state: StudioUrlState): StudioUrlState {
  const defaults = defaultStudioState();
  const params = new URLSearchParams();

  for (const key of STUDIO_STATE_KEY_ORDER) {
    const value = state[key];
    if (value === null || value === undefined || value === defaults[key]) {
      continue;
    }
    params.set(key, serializeParamValue(value));
  }

  return loadStudioSearchParams(params) as StudioUrlState;
}
