import { NextProvider } from "fumadocs-core/framework/next";
import type { ReactNode } from "react";
import { PageCanvasShell } from "@/components/design/page-canvas-shell";
import { DocsLayout } from "@/components/docs/docs-layout";
import { siteNavLinks } from "@/lib/site-nav-links";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <NextProvider>
      <PageCanvasShell>
        <DocsLayout
          nav={{
            links: [...siteNavLinks],
            githubUrl: "https://github.com/bklit/bklit-ui",
            discordUrl: "https://discord.gg/75s4frfE8X",
          }}
          tree={source.pageTree}
        >
          {children}
        </DocsLayout>
      </PageCanvasShell>
    </NextProvider>
  );
}
