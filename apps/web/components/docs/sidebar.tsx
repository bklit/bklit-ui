"use client";

import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  tree: PageTree.Root;
}

export function Sidebar({ tree }: SidebarProps) {
  return (
    <aside className="fixed top-14 left-0 hidden h-[calc(100vh-3.5rem)] w-64 overflow-hidden border-border border-r bg-background lg:block">
      <div className="h-full overflow-y-auto py-4">
        <nav className="px-3">
          <SidebarNodes nodes={tree.children} />
        </nav>
      </div>
    </aside>
  );
}

function SidebarNodes({ nodes }: { nodes: PageTree.Node[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {nodes.map((node, index) => (
        <SidebarNode key={node.$id ?? index} node={node} />
      ))}
    </ul>
  );
}

function SidebarNode({ node }: { node: PageTree.Node }) {
  const pathname = usePathname();

  if (node.type === "separator") {
    return (
      <li className="mt-4 flex items-center gap-2 px-3 pt-3 pb-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide first:mt-0 first:pt-0">
        {node.icon}
        <span>{node.name}</span>
      </li>
    );
  }

  if (node.type === "folder") {
    return <SidebarFolder node={node} pathname={pathname} />;
  }

  if (node.type === "page") {
    const isActive = pathname === node.url;
    return (
      <li>
        <Link
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline transition-colors ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          href={node.url}
        >
          {node.icon}
          <span>{node.name}</span>
        </Link>
      </li>
    );
  }

  return null;
}

function SidebarFolder({
  node,
  pathname,
}: {
  node: PageTree.Folder;
  pathname: string;
}) {
  const isChildActive = hasActiveChild(node, pathname);
  const [isOpen, setIsOpen] = useState(node.defaultOpen ?? isChildActive);

  const indexPage = node.index;
  const isIndexActive = indexPage?.url === pathname;

  return (
    <li className="list-none">
      <div className="flex items-center">
        {indexPage ? (
          <Link
            className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline transition-colors ${
              isIndexActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            href={indexPage.url}
          >
            {node.icon}
            <span>{node.name}</span>
          </Link>
        ) : (
          <button
            className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-left text-muted-foreground text-sm transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            {node.icon}
            <span>{node.name}</span>
          </button>
        )}
        {node.children.length > 0 && (
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && node.children.length > 0 && (
        <div className="ml-3 border-border border-l pl-3">
          <SidebarNodes nodes={node.children} />
        </div>
      )}
    </li>
  );
}

function hasActiveChild(folder: PageTree.Folder, pathname: string): boolean {
  for (const child of folder.children) {
    if (child.type === "page" && child.url === pathname) {
      return true;
    }
    if (child.type === "folder" && hasActiveChild(child, pathname)) {
      return true;
    }
  }
  if (folder.index?.url === pathname) {
    return true;
  }
  return false;
}
