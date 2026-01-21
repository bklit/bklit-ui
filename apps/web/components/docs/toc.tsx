"use client";

import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
  type TOCItemType,
} from "fumadocs-core/toc";
import { useRef } from "react";

interface TableOfContentsProps {
  items: TOCItemType[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="fixed top-14 right-0 hidden h-[calc(100vh-3.5rem)] w-56 overflow-hidden py-6 pr-4 xl:block">
      <div className="flex h-full flex-col">
        <p className="mb-3 pl-2 font-semibold text-foreground text-sm">
          On this page
        </p>
        <AnchorProvider toc={items}>
          <div className="flex-1 overflow-y-auto" ref={containerRef}>
            <ScrollProvider containerRef={containerRef}>
              <ul className="m-0 list-none p-0">
                {items.map((item) => (
                  <li
                    key={item.url}
                    style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}
                  >
                    <TOCItem
                      className="block border-transparent border-l-2 px-2 py-1.5 text-[13px] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-primary"
                      href={item.url}
                    >
                      {item.title}
                    </TOCItem>
                  </li>
                ))}
              </ul>
            </ScrollProvider>
          </div>
        </AnchorProvider>
      </div>
    </aside>
  );
}
