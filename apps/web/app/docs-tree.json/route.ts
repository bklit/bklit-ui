import { source } from "@/lib/source";

/**
 * Docs page tree for the site header's mobile menu, prerendered at build time.
 *
 * The header used to receive `source.pageTree` as a prop from the `(site)`
 * layout. Importing `@/lib/source` there put every docs MDX module in the
 * layout's module graph, so every client component the docs import (all the
 * demos, sankey, brush, Studio URL codecs…) shipped on every page, homepage
 * included. A route handler keeps that graph out of the pages; the menu
 * fetches this file the first time it opens.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(source.pageTree);
}
