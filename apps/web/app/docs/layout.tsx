import { NextProvider } from "fumadocs-core/framework/next";
import type { ReactNode } from "react";
import { DocsLayout } from "@/components/docs/docs-layout";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <NextProvider>
      <DocsLayout
        nav={{
          title: (
            <span className="font-semibold">
              bklit<span className="text-primary">-ui</span>
            </span>
          ),
          links: [
            {
              text: "Get Started",
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
        }}
        tree={source.pageTree}
      >
        {children}
      </DocsLayout>
    </NextProvider>
  );
}
