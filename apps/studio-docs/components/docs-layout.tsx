import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { SiteHeader } from "@/components/site-header";

export function DocsLayout({
  children,
  tree,
}: {
  children: ReactNode;
  tree: PageTree.Root;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="w-full pt-14">
        <Sidebar tree={tree} />
        <main className="w-full lg:pl-80 xl:pr-[300px]">{children}</main>
      </div>
    </div>
  );
}
