"use client";

import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const linkStyles = {
  base: "flex w-fit items-center gap-2 rounded-md px-3 py-1.5 font-medium text-xs no-underline",
  active: "bg-accent text-card-foreground",
  inactive: "text-accent-foreground  ",
  heading:
    "ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 text-muted-foreground font-medium",
};

interface NavLink {
  text: string;
  url: string;
  active?: "url" | "nested-url";
}

interface SidebarProps {
  tree: PageTree.Root;
  links?: NavLink[];
}

export function Sidebar({ tree, links = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-14 left-0 hidden h-[calc(100vh-3.5rem)] w-64 overflow-hidden bg-background pl-2 lg:block">
      <div className="h-full overflow-y-auto py-4 pt-9">
        <nav className="px-3">
          {/* Top-level navigation links */}
          {links.length > 0 && (
            <ul className="m-0 mb-4 list-none space-y-0.5 p-0">
              <li className={linkStyles.heading}>Getting Started</li>
              {links.map((link) => {
                // Only exact match for sidebar top-level links
                const isActive = pathname === link.url;
                return (
                  <li key={link.url}>
                    <Link
                      className={cn(
                        linkStyles.base,
                        isActive ? linkStyles.active : linkStyles.inactive
                      )}
                      href={link.url}
                    >
                      {link.text}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
      <li className={cn(linkStyles.heading, "mt-4 pt-3 first:mt-0 first:pt-0")}>
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
          className={cn(
            linkStyles.base,
            isActive ? linkStyles.active : linkStyles.inactive
          )}
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
            className={cn(
              linkStyles.base,
              isIndexActive ? linkStyles.active : linkStyles.inactive
            )}
            href={indexPage.url}
          >
            {node.icon}
            <span>{node.name}</span>
          </Link>
        ) : (
          <button
            className={cn(linkStyles.base, linkStyles.inactive)}
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
