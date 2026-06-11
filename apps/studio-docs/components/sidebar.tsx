"use client";

import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const linkStyles = {
  base: "flex w-fit items-center gap-2 rounded-md px-3 py-1.5 font-medium text-xs no-underline",
  active: "bg-accent text-card-foreground",
  inactive: "text-accent-foreground",
  heading:
    "flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-muted-foreground text-xs",
};

function SidebarNodes({ nodes }: { nodes: PageTree.Node[] }) {
  const pathname = usePathname();

  return (
    <ul className="m-0 list-none space-y-0.5 p-0">
      {nodes.map((node, index) => {
        if (node.type === "separator") {
          return (
            <li
              className={cn(linkStyles.heading, "mt-4")}
              key={`sep-${String(index)}`}
            >
              {node.name}
            </li>
          );
        }

        if (node.type === "folder") {
          return (
            <li key={node.$id ?? `folder-${String(index)}`}>
              <div className={cn(linkStyles.heading, "mt-3")}>{node.name}</div>
              {node.children.length > 0 ? (
                <SidebarNodes nodes={node.children} />
              ) : null}
            </li>
          );
        }

        const isActive = pathname === node.url;
        return (
          <li key={node.url}>
            <Link
              className={cn(
                linkStyles.base,
                isActive ? linkStyles.active : linkStyles.inactive
              )}
              href={node.url}
            >
              {node.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ tree }: { tree: PageTree.Root }) {
  return (
    <aside className="fixed top-14 left-0 hidden h-[calc(100vh-3.5rem)] w-80 overflow-y-auto border-border border-r bg-background lg:block">
      <nav className="p-8">
        <SidebarNodes nodes={tree.children} />
      </nav>
    </aside>
  );
}
