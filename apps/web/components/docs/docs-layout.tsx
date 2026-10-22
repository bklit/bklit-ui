import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import {
  SiteEdgeLines,
  SiteHeaderRivets,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import type { SiteNavLink } from "@/lib/site-nav-links";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
  children: ReactNode;
  tree: PageTree.Root;
  nav?: {
    links?: SiteNavLink[];
  };
}

/**
 * Docs shell — coss ui docs grid (sidebar on a tinted canvas, article in a
 * framed card, sticky TOC). Adapted from coss ui (https://coss.com/ui, MIT).
 */
export function DocsLayout({ children, tree, nav }: DocsLayoutProps) {
  return (
    <div className="relative min-h-[calc(100svh-var(--site-header-height))] w-full flex-1">
      <SiteEdgeLines />
      <SiteHeaderRivets />
      <div
        className={cn(
          siteContainerClassName,
          "max-lg:px-0 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[14.5rem_minmax(0,1fr)]"
        )}
      >
        <Sidebar links={nav?.links} tree={tree} />
        <main className="min-w-0 lg:col-start-2 lg:row-start-1">
          {children}
        </main>
      </div>
    </div>
  );
}
