import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { SiteHeader } from "./site-header";

interface NavLink {
  text: string;
  url: string;
  active?: "url" | "nested-url";
}

interface DocsLayoutProps {
  children: ReactNode;
  tree: PageTree.Root;
  nav?: {
    links?: NavLink[];
    githubUrl?: string;
    discordUrl?: string;
  };
}

export function DocsLayout({ children, tree, nav }: DocsLayoutProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader
        discordUrl={nav?.discordUrl}
        githubUrl={nav?.githubUrl}
        links={nav?.links}
      />
      <div className="mx-auto max-w-7xl pt-14">
        <Sidebar links={nav?.links} tree={tree} />
        <main className="lg:ml-64 xl:mr-56">{children}</main>
      </div>
    </div>
  );
}
