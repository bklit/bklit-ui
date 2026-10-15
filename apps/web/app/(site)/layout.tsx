import type { ReactNode } from "react";
import { ScrollToTopOnNavigate } from "@/components/docs/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/docs/site-header";
import { siteHeaderNavLinks } from "@/lib/site-nav-links";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate z-1 flex min-h-screen flex-col overflow-x-clip bg-sidebar">
      <ScrollToTopOnNavigate />
      <SiteHeader
        discordUrl="https://discord.gg/75s4frfE8X"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteHeaderNavLinks]}
      />
      <div className="flex flex-1 flex-col pt-(--site-header-height)">
        {children}
      </div>
    </div>
  );
}
