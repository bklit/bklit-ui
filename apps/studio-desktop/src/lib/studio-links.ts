import type { ChartSlug } from "@bklitui/studio";
import { REGISTRY_ORIGIN } from "@bklitui/studio";

export function studioChartDocsAbsoluteHref(slug: ChartSlug) {
  return `${REGISTRY_ORIGIN}/docs/components/${slug}`;
}
