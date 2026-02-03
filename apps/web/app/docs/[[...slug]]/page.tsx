import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findNeighbour } from "fumadocs-core/server";
import type { TOCItemType } from "fumadocs-core/toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  ComponentPreview,
  ComponentShowcase,
} from "@/components/docs/component-showcase";
import { ComponentsList } from "@/components/docs/components-list";
import { CopyPageButton } from "@/components/docs/copy-page-button";
import { InstallationTabs } from "@/components/docs/installation-tabs";
import { PackageManagerTabs } from "@/components/docs/package-manager-tabs";
import { PageFooter } from "@/components/docs/page-footer";
import { SocialLinks } from "@/components/docs/social-links";
import { TableOfContents } from "@/components/docs/toc";
import { source } from "@/lib/source";

// Extended page data types from fumadocs-mdx
interface PageData {
  title: string;
  description?: string;
  body: ComponentType<Record<string, unknown>>;
  toc: TOCItemType[];
  full?: boolean;
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const data = page.data as PageData;
  const MDX = data.body;
  const neighbours = findNeighbour(source.pageTree, page.url);

  // Read raw MDX content for copy functionality
  const slugPath = params.slug?.join("/") || "index";
  const mdxPath = join(process.cwd(), "content/docs", `${slugPath}.mdx`);
  let rawContent = "";
  try {
    rawContent = await readFile(mdxPath, "utf-8");
  } catch {
    // Fallback if file read fails
    rawContent = "";
  }

  return (
    <div className="flex">
      <article className="mx-auto min-w-0 max-w-3xl flex-1 px-6 py-8 pb-16">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 font-bold text-3xl text-foreground leading-tight">
                {data.title}
              </h1>
              {data.description && (
                <p className="mt-2 text-lg text-muted-foreground">
                  {data.description}
                </p>
              )}
            </div>
            <CopyPageButton content={rawContent} url={page.url} />
          </div>
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDX
            components={{
              ...defaultMdxComponents,
              ComponentPreview,
              ComponentShowcase,
              ComponentsList,
              InstallationTabs,
              PackageManagerTabs,
              SocialLinks,
            }}
          />
        </div>
        <PageFooter next={neighbours.next} previous={neighbours.previous} />
      </article>
      <TableOfContents items={data.toc} />
    </div>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
