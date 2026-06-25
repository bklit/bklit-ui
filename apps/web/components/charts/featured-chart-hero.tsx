"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import type { ReactNode } from "react";
import { BlockPanel } from "@/components/blocks/block-panel";
import {
  ChartExamplePreviewFrame,
  type ChartExamplePreviewLayout,
  getChartExampleContentPaddingClassName,
} from "@/components/charts/chart-example-preview";
import { CopyButton } from "@/components/copy-button";
import { DesignSectionRulers } from "@/components/design/design-section-rulers";
import { GridCornerDots } from "@/components/design/line-grid";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

export function FeaturedChartHero({
  title,
  description,
  code,
  data,
  footer = "Trending up by 5.2% this month",
  previewLayout = "cartesian",
  children,
}: {
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  previewLayout?: ChartExamplePreviewLayout;
  children: ReactNode;
}) {
  const fullCode = data ? `${data}\n\n${code}` : code;
  const contentPaddingClassName =
    getChartExampleContentPaddingClassName(previewLayout);

  return (
    <div className="relative w-full overflow-visible border-border border-t border-l">
      <BlockPanel>
        <div className="flex flex-col gap-0 p-6">
          <div className="flex items-start justify-between gap-4 pb-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 className="font-semibold text-base">{title}</h2>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <CopyButton text={fullCode} />
              <Sheet>
                <SheetTrigger className="shrink-0 rounded-md border px-2.5 py-1 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground">
                  View Code
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-6 pb-6">
                    <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
                      <DynamicCodeBlock
                        code={code}
                        lang="tsx"
                        options={{ themes: codeThemes }}
                      />
                    </div>
                    {data ? (
                      <>
                        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                          Data
                        </p>
                        <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
                          <DynamicCodeBlock
                            code={data}
                            lang="tsx"
                            options={{ themes: codeThemes }}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className={cn("overflow-visible", contentPaddingClassName)}>
            <ChartExamplePreviewFrame layout={previewLayout} previewRole="hero">
              {children}
            </ChartExamplePreviewFrame>
          </div>

          <p className="pt-4 text-muted-foreground text-xs">{footer}</p>
        </div>
      </BlockPanel>
      <GridCornerDots className="z-3" columns={1} rows={1} />
      <DesignSectionRulers />
    </div>
  );
}
