import type { ReactNode } from "react";
import { SiteHeader } from "@/components/docs/site-header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader
        discordUrl="https://discord.com/invite/9yyK8FwPcU"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[
          {
            text: "Docs",
            url: "/docs",
            active: "nested-url",
          },
          {
            text: "Components",
            url: "/docs/components",
            active: "nested-url",
          },
        ]}
      />
      <div className="pt-14">{children}</div>
    </div>
  );
}
