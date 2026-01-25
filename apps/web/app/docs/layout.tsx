import { NextProvider } from "fumadocs-core/framework/next";
import type { ReactNode } from "react";
import { DocsLayout } from "@/components/docs/docs-layout";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <NextProvider>
      <DocsLayout
        nav={{
          links: [
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
          ],
          githubUrl: "https://github.com/bklit/bklit-ui",
          discordUrl: "https://discord.com/invite/9yyK8FwPcU",
        }}
        tree={source.pageTree}
      >
        {children}
      </DocsLayout>
    </NextProvider>
  );
}
