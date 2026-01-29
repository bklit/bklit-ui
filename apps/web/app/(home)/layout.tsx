import type { ReactNode } from "react";
import { SiteFooter } from "@/components/docs/site-footer";
import { SiteHeader } from "@/components/docs/site-header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        discordUrl="https://discord.com/invite/9yyK8FwPcU"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[
          {
            text: "Introduction",
            url: "/docs",
          },
          {
            text: "Components",
            url: "/docs/components",
          },
        ]}
      />
      <div className="flex-1 pt-14">{children}</div>
      <SiteFooter />
    </div>
  );
}
