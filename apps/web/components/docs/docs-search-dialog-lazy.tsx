"use client";

import dynamic from "next/dynamic";

/**
 * Search dialog code (fumadocs dialog, Orama client, tags) loads on first
 * open instead of with every page. Pair with `preload: false` on the
 * RootProvider search options so fumadocs doesn't mount it while closed.
 */
export const DocsSearchDialogLazy = dynamic(
  () =>
    import("@/components/docs/docs-search-dialog").then(
      (mod) => mod.DocsSearchDialog
    ),
  { ssr: false }
);
