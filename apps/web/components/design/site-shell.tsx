import type { ReactNode } from "react";
import { ScrollToTopOnNavigate } from "@/components/docs/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/docs/site-header";
import { siteHeaderNavLinks } from "@/lib/site-nav-links";
import { source } from "@/lib/source";

/**
 * Site frame: fixed header + content column. Used by the `(site)` layout and
 * by the root `not-found.tsx`, which renders outside `(site)` (it handles
 * unmatched URLs and `notFound()` from any route) but should keep the header.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate z-1 flex min-h-screen flex-col overflow-x-clip bg-sidebar">
      <ScrollToTopOnNavigate />
      <SiteHeader
        discordUrl="https://discord.gg/75s4frfE8X"
        docsTree={source.pageTree}
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteHeaderNavLinks]}
      />
      <div className="flex flex-1 flex-col pt-(--site-header-height)">
        {children}
      </div>
    </div>
  );
}
