import { defaultStudioState, type StudioUrlState } from "./studio-parsers";
import { encodeStudioUrlState, STUDIO_URL_PARAM } from "./studio-url-codec";
import type { ChartSlug } from "./types";

export const REGISTRY_ORIGIN = "https://ui.bklit.com";

/** Public shadcn namespace for `npx shadcn add @bklit/<name>`. */
export const BKLIT_REGISTRY_NAMESPACE = "@bklit";

export function registryJsonUrlForName(name: string) {
  return `${REGISTRY_ORIGIN}/r/${name}.json`;
}

/** Registry item used by Open in v0 (composable demo page, not raw source files). */
export function registryV0ExampleName(name: string) {
  return `${name}-example`;
}

export function registryV0ExampleJsonUrl(name: string) {
  return registryJsonUrlForName(registryV0ExampleName(name));
}

export function shadcnAddItem(name: string) {
  return `${BKLIT_REGISTRY_NAMESPACE}/${name}`;
}

export function studioRegistryJsonUrl(slug: ChartSlug) {
  return registryJsonUrlForName(slug);
}

export function studioChartDocsHref(slug: ChartSlug) {
  return `/docs/components/${slug}`;
}

export function studioChartHref(
  slug: ChartSlug,
  searchParams?: Record<string, string | undefined>
) {
  const state = defaultStudioState({
    chart: slug === "profit-loss-line" ? "line-chart" : slug,
    ...(slug === "profit-loss-line" ? { lineChartMode: "profitLoss" } : {}),
  });

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value != null && value !== "") {
        (state as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  const encoded = encodeURIComponent(encodeStudioUrlState(state));
  return `/studio?${STUDIO_URL_PARAM}=${encoded}`;
}

/** Compressed studio href from a full state object. */
export function studioStateHref(state: StudioUrlState): string {
  const encoded = encodeURIComponent(encodeStudioUrlState(state));
  return `/studio?${STUDIO_URL_PARAM}=${encoded}`;
}

/** @see https://ui.shadcn.com/docs/registry/open-in-v0 */
export function openInV0Href(registryJsonUrl: string) {
  return `https://v0.dev/chat/api/open?url=${encodeURIComponent(registryJsonUrl)}`;
}

/** @see https://ui.shadcn.com/docs/registry/open-in-v0 */
export function studioOpenInV0Href(slug: ChartSlug) {
  return openInV0Href(registryV0ExampleJsonUrl(slug));
}
