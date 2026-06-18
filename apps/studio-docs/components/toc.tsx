"use client";

import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
  type TOCItemType,
} from "fumadocs-core/toc";
import Link from "next/link";
import { useRef } from "react";

export function TableOfContents({ items }: { items: TOCItemType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="fixed top-14 right-0 hidden h-[calc(100vh-3.5rem)] w-[300px] overflow-hidden px-10 py-6 xl:block">
      <div className="flex h-full flex-col">
        {items.length > 0 ? (
          <>
            <p className="mb-3 font-semibold text-foreground text-sm">
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
          </>
        ) : null}
        <div className="group relative mt-6 flex flex-col gap-2 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="text-balance font-semibold text-foreground leading-tight group-hover:underline">
            Open the editor
          </div>
          <div className="text-muted-foreground text-xs">
            Try these controls live in Studio at localhost:3000.
          </div>
          <Link
            className="mt-2 w-fit rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs no-underline transition-opacity hover:opacity-90"
            href="http://localhost:3000/studio"
            rel="noreferrer"
            target="_blank"
          >
            Open Studio
          </Link>
        </div>
      </div>
    </aside>
  );
}
