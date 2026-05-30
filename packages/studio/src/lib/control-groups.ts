import type { StudioUrlState } from "./studio-parsers";
import type { StudioChartConfig, StudioControlGroup } from "./types";

export function getStudioControlGroups(
  config: StudioChartConfig,
  state?: StudioUrlState
): StudioControlGroup[] {
  if (config.resolveControlGroups && state) {
    return config.resolveControlGroups(state);
  }
  if (config.controlGroups?.length) {
    return config.controlGroups;
  }
  return [{ title: "Settings", controls: config.controls }];
}
