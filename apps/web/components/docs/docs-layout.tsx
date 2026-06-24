import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

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
  };
}

export function DocsLayout({ children, tree, nav }: DocsLayoutProps) {
  return (
    <div className="min-h-full w-full">
      <Sidebar links={nav?.links} tree={tree} />
      <main className="w-full lg:pl-80 xl:pr-[300px]">{children}</main>
    </div>
  );
}
