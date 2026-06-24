import type { ReactNode } from "react";
import { PageCanvasShell } from "@/components/design/page-canvas-shell";
import { SiteFooter } from "@/components/docs/site-footer";
import { SiteHeader } from "@/components/docs/site-header";
import { siteNavLinks } from "@/lib/site-nav-links";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        discordUrl="https://discord.gg/75s4frfE8X"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteNavLinks]}
      />
      <div className="flex-1 pt-14">
        <PageCanvasShell>{children}</PageCanvasShell>
      </div>
      <SiteFooter />
    </div>
  );
}
