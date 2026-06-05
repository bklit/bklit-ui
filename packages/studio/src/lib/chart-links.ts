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
  let href: string;
  if (slug === "profit-loss-line") {
    href = "/studio?chart=line-chart&lineChartMode=profitLoss";
  } else {
    href = `/studio?chart=${slug}`;
  }

  if (searchParams) {
    const extra = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value != null && value !== "") {
        extra.set(key, value);
      }
    }
    const qs = extra.toString();
    if (qs) {
      href += `&${qs}`;
    }
  }

  return href;
}

/** @see https://ui.shadcn.com/docs/registry/open-in-v0 */
export function openInV0Href(registryJsonUrl: string) {
  return `https://v0.dev/chat/api/open?url=${encodeURIComponent(registryJsonUrl)}`;
}

/** @see https://ui.shadcn.com/docs/registry/open-in-v0 */
export function studioOpenInV0Href(slug: ChartSlug) {
  return openInV0Href(registryV0ExampleJsonUrl(slug));
}
