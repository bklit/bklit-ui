"use client";

import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
  type TOCItemType,
} from "fumadocs-core/toc";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  items: TOCItemType[];
}

function SidebarCTA() {
  return (
    <Frame className="group relative mt-6 shrink-0">
      <FramePanel className="flex flex-col gap-1.5 p-4">
        <div className="text-balance font-medium text-foreground text-sm leading-tight">
          Join the community
        </div>
        <div className="text-muted-foreground text-xs leading-relaxed">
          Get help, share feedback, and connect with other developers.
        </div>
        <Button className="mt-2 w-fit" size="xs" variant="outline">
          Join Discord
        </Button>
      </FramePanel>
      <a
        className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="https://discord.gg/75s4frfE8X"
        onClick={() => {
          trackEvent("discord_click", {
            location: "docs_toc",
            url: getAnalyticsUrl(),
          });
        }}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">Join Discord</span>
      </a>
    </Frame>
  );
}

const depthPaddingClassName: Record<number, string> = {
  3: "ps-3.5",
  4: "ps-5.5",
  5: "ps-7.5",
  6: "ps-9.5",
};

/** TOC rail styling adapted from coss ui docs-toc (https://coss.com/ui, MIT). */
export function TableOfContents({ items }: TableOfContentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="sticky top-(--site-header-height) z-30 ms-auto hidden h-[calc(100svh-var(--site-header-height))] w-60 shrink-0 flex-col overflow-hidden xl:flex">
      <div className="flex h-full min-h-0 flex-col ps-6 pt-6 pb-6">
        {items.length > 0 && (
          <>
            <p className="m-0 flex h-7 shrink-0 items-center font-medium text-foreground text-xs">
              On this page
            </p>
            <AnchorProvider toc={items}>
              <div
                className="no-scrollbar min-h-0 flex-1 overflow-y-auto pt-1"
                ref={containerRef}
              >
                <ScrollProvider containerRef={containerRef}>
                  <ul className="relative m-0 ms-3.5 flex list-none flex-col gap-0.5 p-0 before:absolute before:inset-y-0 before:-left-3.25 before:w-px before:bg-border">
                    {items.map((item) => (
                      <li key={item.url}>
                        <TOCItem
                          className={cn(
                            "relative block py-1 text-[0.8125rem] text-sidebar-foreground leading-4.5 no-underline transition-colors before:absolute before:inset-y-px before:-left-3.25 before:w-px before:rounded-full hover:text-foreground data-[active=true]:text-foreground data-[active=true]:before:w-0.5 data-[active=true]:before:bg-primary",
                            depthPaddingClassName[item.depth]
                          )}
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
        )}
        <SidebarCTA />
      </div>
    </aside>
  );
}
