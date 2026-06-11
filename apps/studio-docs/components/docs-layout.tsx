import type * as PageTree from "fumadocs-core/page-tree";
import Link from "next/link";
import type { ReactNode } from "react";
import { DocsToolbar } from "@/components/docs-toolbar";
import { Sidebar } from "@/components/sidebar";

export function DocsLayout({
  children,
  tree,
}: {
  children: ReactNode;
  tree: PageTree.Root;
}) {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-border border-b bg-background/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link className="font-semibold text-sm tracking-tight" href="/docs">
            Studio UI
          </Link>
          <span className="text-muted-foreground text-xs">local docs</span>
        </div>
        <DocsToolbar />
      </header>
      <div className="w-full pt-14">
        <Sidebar tree={tree} />
        <main className="w-full lg:pl-80 xl:pr-[280px]">{children}</main>
      </div>
    </div>
  );
}
