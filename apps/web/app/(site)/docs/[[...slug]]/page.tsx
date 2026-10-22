import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { flattenTree } from "fumadocs-core/server";
import type { TOCItemType } from "fumadocs-core/toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { ComponentProps, ComponentType } from "react";
import { ComponentPreview } from "@/components/docs/component-preview";
import { ComponentShowcase } from "@/components/docs/component-showcase";
import { ComponentsList } from "@/components/docs/components-list";
import { CopyPageButton } from "@/components/docs/copy-page-button";
import { InstallationTabs } from "@/components/docs/installation-tabs";
import { PackageManagerTabs } from "@/components/docs/package-manager-tabs";
import { PageFooter } from "@/components/docs/page-footer";
import { SocialLinks } from "@/components/docs/social-links";
import { StudioEmbedPreview } from "@/components/docs/studio-embed-preview";
import { TableOfContents } from "@/components/docs/toc";
import { Frame, FramePanel } from "@/components/ui/frame";
import { isFileUrl } from "@/lib/site-nav-links";
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
  // Prev/next walk docs pages only — skip sidebar file links like /llms.txt.
  const docPages = flattenTree(source.pageTree.children).filter(
    (node) => !(node.external || isFileUrl(node.url))
  );
  const pageIndex = docPages.findIndex((node) => node.url === page.url);
  const neighbours =
    pageIndex === -1
      ? {}
      : { previous: docPages[pageIndex - 1], next: docPages[pageIndex + 1] };

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

  // Layout adapted from coss ui docs (https://coss.com/ui, MIT): the article
  // sits in a Frame on the tinted docs canvas; prev/next live in the frame foot.
  return (
    <div className="flex items-stretch xl:w-full" data-slot="docs">
      <div className="relative flex w-full min-w-0 flex-1 flex-col lg:my-6">
        <Frame className="max-lg:rounded-none max-lg:bg-transparent max-lg:p-0">
          <FramePanel className="px-4 pt-8 pb-12 max-lg:rounded-none max-lg:border-0 max-lg:shadow-none max-lg:before:hidden sm:px-6 lg:px-10 lg:pt-12 lg:pb-16">
            <article className="mx-auto w-full max-w-3xl">
              <header className="mb-10 flex flex-col gap-2">
                <h1 className="m-0 scroll-m-20 font-bold font-heading text-3xl text-foreground xl:text-4xl">
                  {data.title}
                </h1>
                {data.description && (
                  <p className="m-0 text-balance text-muted-foreground sm:text-lg">
                    {data.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-3">
                  <CopyPageButton
                    content={rawContent}
                    title={data.title}
                    url={page.url}
                  />
                </div>
              </header>
              <div className="docs-prose prose prose-neutral dark:prose-invert max-w-none">
                <MDX
                  components={{
                    ...defaultMdxComponents,
                    ComponentPreview,
                    ComponentShowcase,
                    ComponentsList,
                    InstallationTabs,
                    PackageManagerTabs,
                    SocialLinks,
                    StudioEmbedPreview,
                    table: DocsTable,
                  }}
                />
              </div>
            </article>
          </FramePanel>
          <PageFooter next={neighbours.next} previous={neighbours.previous} />
        </Frame>
      </div>
      <TableOfContents items={data.toc} />
    </div>
  );
}

/** Framed, horizontally scrollable table (border lives on the scroller). */
function DocsTable(props: ComponentProps<"table">) {
  return (
    <div className="docs-table-frame">
      <table {...props} />
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
