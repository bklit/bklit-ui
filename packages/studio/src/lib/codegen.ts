import { getStudioConfig } from "./registry";
import type { StudioUrlState } from "./studio-parsers";
import type { ChartSlug } from "./types";

export function generateStudioCode(
  slug: ChartSlug,
  state: StudioUrlState
): { code: string; data?: string; title: string } {
  const config = getStudioConfig(slug);
  const { code, data } = config.generateCode(state);
  return {
    code,
    data,
    title: config.label,
  };
}
