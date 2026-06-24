import type { ReactNode } from "react";
import { PageCanvasShell } from "@/components/design/page-canvas-shell";
import { ScrollToTopOnNavigate } from "@/components/docs/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/docs/site-header";
import { siteNavLinks } from "@/lib/site-nav-links";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTopOnNavigate />
      <SiteHeader
        discordUrl="https://discord.gg/75s4frfE8X"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteNavLinks]}
      />
      <div className="flex-1 pt-(--site-header-height)">
        <PageCanvasShell>{children}</PageCanvasShell>
      </div>
    </div>
  );
}
