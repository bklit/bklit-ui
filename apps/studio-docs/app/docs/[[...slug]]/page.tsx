import {
  FeedbackDemo,
  FieldsDemo,
  MotionBezierDemo,
  MotionControlDemo,
  MotionEasePresetsDemo,
  PatternsDemo,
  PickersDemo,
  PrimitivesDemo,
  SurfacesDemo,
  TabsDemo,
} from "@bklitui/studio/dev/ui-demos";
import { StudioUiPreview } from "@bklitui/studio/dev/ui-preview";
import { findNeighbour } from "fumadocs-core/server";
import type { TOCItemType } from "fumadocs-core/toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { ComponentShowcase } from "@/components/component-showcase";
import { PageFooter } from "@/components/page-footer";
import { source } from "@/lib/source";

interface PageData {
  title: string;
  description?: string;
  body: ComponentType<Record<string, unknown>>;
  toc: TOCItemType[];
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

  return (
    <div className="flex w-full justify-center">
      <article className="w-full max-w-[790px] px-10 pt-24 pb-16">
        <header className="mb-8">
          <h1 className="m-0 font-bold text-3xl text-foreground leading-tight">
            {data.title}
          </h1>
          {data.description ? (
            <p className="mt-2 text-lg text-muted-foreground">
              {data.description}
            </p>
          ) : null}
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDX
            components={{
              ...defaultMdxComponents,
              ComponentShowcase,
              StudioUiPreview,
              SurfacesDemo,
              TabsDemo,
              PrimitivesDemo,
              FieldsDemo,
              MotionBezierDemo,
              MotionEasePresetsDemo,
              MotionControlDemo,
              PatternsDemo,
              PickersDemo,
              FeedbackDemo,
            }}
          />
        </div>
        <PageFooter next={neighbours.next} previous={neighbours.previous} />
      </article>
    </div>
  );
}

export function generateStaticParams() {
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
