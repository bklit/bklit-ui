"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { type ReactNode, useState } from "react";
import { DocsChartPreviewShell } from "@/components/docs/docs-chart-preview-shell";
import {
  Card,
  CardContent,
  previewCardClassName,
  previewCardContentClassName,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

interface ComponentShowcaseProps {
  /** The live preview component to render */
  children: ReactNode;
  /** Code string to display (will be syntax highlighted) */
  code?: string;
  /** Language for syntax highlighting */
  lang?: string;
  /** Pre-rendered code block (e.g., from MDX) - use instead of `code` prop */
  codeBlock?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Minimum height of the preview section */
  previewMinHeight?: number;
}

const codePanelContentClassName = cn(
  "relative overflow-hidden transition-all duration-300",
  "data-[state=closed]:max-h-[120px]",
  "[&_figure]:my-0! [&_figure]:rounded-none! [&_figure]:border-0!",
  "[&_pre]:my-0! [&_pre]:rounded-none! [&_pre]:border-0!",
  "[&_[data-rehype-pretty-code-figure]]:mt-0!"
);

/**
 * Preview + collapsible code (shadcn docs pattern). Used for variant sections in MDX.
 * Primary hero preview with Open in v0 / Studio uses {@link ComponentPreview} instead.
 *
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/code-collapsible-wrapper.tsx
 */
export function ComponentShowcase({
  children,
  code,
  lang = "tsx",
  codeBlock,
  className,
  previewMinHeight = 200,
}: ComponentShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasCode = code || codeBlock;

  return (
    <Card
      className={cn(
        "not-prose my-6 flex flex-col overflow-visible",
        previewCardClassName,
        className
      )}
    >
      <CardContent
        className={cn(previewCardContentClassName, "shrink-0")}
        style={{ minHeight: previewMinHeight }}
      >
        <DocsChartPreviewShell>
          <div className="flex w-full items-center justify-center">
            {children}
          </div>
        </DocsChartPreviewShell>
      </CardContent>

      {hasCode ? (
        <Collapsible
          className="group/collapsible relative border-border border-t"
          onOpenChange={setIsOpen}
          open={isOpen}
        >
          <CollapsibleContent className={codePanelContentClassName} keepMounted>
            {codeBlock || (
              <DynamicCodeBlock
                code={code || ""}
                lang={lang}
                options={{ themes: codeThemes }}
              />
            )}
          </CollapsibleContent>

          <CollapsibleTrigger
            className={cn(
              "absolute inset-x-0 -bottom-px flex h-16 items-center justify-center",
              "bg-linear-to-t from-card via-card/80 to-transparent",
              "font-medium text-muted-foreground text-sm",
              "cursor-pointer rounded-b-xl",
              "group-data-[state=open]/collapsible:hidden"
            )}
          >
            View Code
          </CollapsibleTrigger>

          <CollapsibleTrigger
            className={cn(
              "absolute right-3 bottom-3 z-10",
              "rounded-md px-2.5 py-1 font-medium text-xs",
              "text-muted-foreground hover:text-foreground",
              "bg-muted/80 hover:bg-muted",
              "cursor-pointer transition-colors",
              "group-data-[state=closed]/collapsible:hidden"
            )}
          >
            Collapse
          </CollapsibleTrigger>
        </Collapsible>
      ) : null}
    </Card>
  );
}
