import type { TOCItemType } from "fumadocs-core/toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { ComponentPreview } from "@/components/component-preview";
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

  return (
    <div className="flex">
      <article className="mx-auto min-w-0 max-w-3xl flex-1 px-6 py-8 pb-16">
        <header className="mb-8">
          <h1 className="m-0 font-bold text-3xl text-foreground leading-tight">
            {data.title}
          </h1>
          {data.description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {data.description}
            </p>
          )}
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDX
            components={{
              ...defaultMdxComponents,
              ComponentPreview,
            }}
          />
        </div>
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
