import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { flattenTree } from "fumadocs-core/server";
import type { TOCItemType } from "fumadocs-core/toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentProps, ComponentType } from "react";
import { isChartSlug } from "@/components/charts/chart-slugs";
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
import { JsonLd } from "@/components/seo/json-ld";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  breadcrumbJsonLd,
  chartOgImages,
  pageMetadata,
  SITE_NAME,
} from "@/lib/seo";
import { isFileUrl } from "@/lib/site-nav-links";
import { SITE_URL } from "@/lib/site-url";
import { source } from "@/lib/source";

// Extended page data types from fumadocs-mdx
interface PageData {
  title: string;
  description?: string;
  body: ComponentType<Record<string, unknown>>;
  toc: TOCItemType[];
  full?: boolean;
  lastModified?: Date;
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

  const slugs = params.slug ?? [];
  const pageUrl = `${SITE_URL}${page.url}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: data.title,
      description: data.description,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      ...(data.lastModified
        ? { dateModified: new Date(data.lastModified).toISOString() }
        : {}),
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbJsonLd(docsBreadcrumbs(slugs, data.title)),
  ];

  // Layout adapted from coss ui docs (https://coss.com/ui, MIT): the article
  // sits in a Frame on the tinted docs canvas; prev/next live in the frame foot.
  return (
    <div className="flex items-stretch xl:w-full" data-slot="docs">
      <JsonLd data={jsonLd} />
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

function docsTitle(slugs: string[], title: string): string {
  const [section, name] = slugs;
  if (section === "components") {
    if (!name) {
      return "React Chart Components";
    }
    return isChartSlug(name) ? `${title} – React Chart Component` : title;
  }
  if (section === "utility") {
    return `${title} – Chart Utility`;
  }
  if (slugs.length === 0) {
    return "Documentation";
  }
  return title;
}

function docsOgImages(slugs: string[], alt: string) {
  const [section, name] = slugs;
  if (section === "components" && name && isChartSlug(name)) {
    return chartOgImages(name, alt);
  }
  return undefined;
}

/** Docs › (section index) › page, skipping segments without their own page. */
function docsBreadcrumbs(slugs: string[], title: string) {
  const items = [{ name: "Docs", path: "/docs" }];
  for (let i = 1; i < slugs.length; i++) {
    const parent = source.getPage(slugs.slice(0, i));
    if (parent) {
      items.push({ name: (parent.data as PageData).title, path: parent.url });
    }
  }
  if (slugs.length > 0) {
    items.push({ name: title, path: `/docs/${slugs.join("/")}` });
  }
  return items;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const data = page.data as PageData;
  const slugs = params.slug ?? [];
  const title = docsTitle(slugs, data.title);
  const description =
    data.description ?? `${data.title} — Bklit UI documentation.`;

  return pageMetadata({
    title,
    description,
    path: page.url,
    ogType: "article",
    images: docsOgImages(slugs, `${title} | ${SITE_NAME}`),
  });
}
