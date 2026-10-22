"use client";

import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DocsScrollArea } from "@/components/docs/docs-scroll-area";
import { NavBadge } from "@/components/nav-badge";
import { getNavBadge } from "@/lib/nav-badges";
import { isFileUrl, type SiteNavLink } from "@/lib/site-nav-links";
import { cn } from "@/lib/utils";

/** coss ui docs sidebar styling (https://coss.com/ui, MIT). */
const linkStyles = {
  base: "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg ps-3.5 pe-2 text-sm no-underline outline-hidden ring-sidebar-ring transition-colors focus-visible:ring-2 focus-visible:ring-inset [&>svg]:size-4 [&>svg]:shrink-0 [&>span]:truncate",
  active: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
  inactive: "text-sidebar-foreground hover:text-sidebar-accent-foreground",
  heading:
    "flex h-7 shrink-0 items-center gap-2 font-medium text-sidebar-accent-foreground text-xs [&>svg]:size-4 [&>svg]:shrink-0",
};

interface SidebarProps {
  tree: PageTree.Root;
  links?: SiteNavLink[];
}

export function Sidebar({ tree, links = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-(--site-header-height) z-30 hidden h-[calc(100svh-var(--site-header-height))] w-[13.5rem] min-w-0 max-w-full overflow-hidden [--docs-scroll-fade:var(--sidebar)] lg:col-start-1 lg:row-start-1 lg:block xl:w-[14.5rem]">
      <DocsScrollArea className="h-full">
        <nav className="pe-4 pt-8 pb-10">
          {/* Top-level navigation links */}
          {links.length > 0 && (
            <ul className="m-0 mb-6 flex list-none flex-col gap-0.5 p-0">
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
                      <span>{link.text}</span>
                      <NavBadge kind={getNavBadge(link.url)} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <SidebarNodes nodes={tree.children} />
        </nav>
      </DocsScrollArea>
    </aside>
  );
}

function SidebarNodes({ nodes }: { nodes: PageTree.Node[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
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
      <li className={cn(linkStyles.heading, "mt-6 mb-1 first:mt-0")}>
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
          external={node.external || isFileUrl(node.url)}
          href={node.url}
        >
          {node.icon}
          <span>{node.name}</span>
          <NavBadge kind={getNavBadge(node.url)} />
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
      <div className="flex items-center gap-0.5">
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
            <NavBadge kind={getNavBadge(indexPage.url)} />
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
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-sidebar-foreground outline-hidden ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-inset"
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
        <div className="relative ms-3.5 mt-0.5 ps-2 before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-sidebar-border">
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
