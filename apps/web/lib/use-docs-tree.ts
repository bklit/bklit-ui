"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { useEffect, useState } from "react";

/** Prerendered by `app/docs-tree.json/route.ts`. */
const DOCS_TREE_URL = "/docs-tree.json";

let docsTreePromise: Promise<PageTree.Root | null> | null = null;
let docsTree: PageTree.Root | null = null;

/** Starts (or reuses) the one fetch of the docs page tree. */
export function loadDocsTree(): Promise<PageTree.Root | null> {
  if (!docsTreePromise) {
    docsTreePromise = fetch(DOCS_TREE_URL)
      .then((response) => (response.ok ? response.json() : null))
      .then((tree: PageTree.Root | null) => {
        docsTree = tree;
        return tree;
      })
      .catch(() => {
        // Allow a retry on the next open.
        docsTreePromise = null;
        return null;
      });
  }
  return docsTreePromise;
}

/** Docs page tree, fetched the first time `enabled` is true. */
export function useDocsTree(enabled: boolean): PageTree.Root | null {
  const [tree, setTree] = useState<PageTree.Root | null>(docsTree);

  useEffect(() => {
    if (!enabled || tree) {
      return;
    }
    let cancelled = false;
    loadDocsTree().then((loaded) => {
      if (!cancelled) {
        setTree(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, tree]);

  return tree;
}
