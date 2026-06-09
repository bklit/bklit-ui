"use client";

import { type ReactNode, useState } from "react";
import { DocsChartPreviewShell } from "@/components/docs/docs-chart-preview-shell";
import { ShowcaseCodeBlock } from "@/components/docs/showcase-code-block";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  previewCardClassName,
  previewCardContentClassName,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** ~3 lines at showcase line-height when the panel is collapsed. */
const collapsedCodeMaxHeightClassName = "max-h-[5.75rem]";

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
  /** Keep chart animations live (skip static docs preview shell). */
  liveChartPreview?: boolean;
}

const codePanelContentClassName = cn(
  "relative overflow-hidden transition-[max-height] duration-300",
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
  liveChartPreview = false,
}: ComponentShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasCode = code || codeBlock;
  const preview = (
    <div className="flex w-full items-stretch justify-stretch">{children}</div>
  );

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
        {liveChartPreview ? (
          preview
        ) : (
          <DocsChartPreviewShell>{preview}</DocsChartPreviewShell>
        )}
      </CardContent>

      {hasCode ? (
        <div className="relative border-border border-t p-3">
          <div
            className={cn(
              codePanelContentClassName,
              isOpen ? "" : collapsedCodeMaxHeightClassName
            )}
          >
            {codeBlock || <ShowcaseCodeBlock code={code || ""} lang={lang} />}
          </div>

          {isOpen ? null : (
            <>
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 z-10",
                  "bg-linear-to-t from-card via-card/80 to-transparent"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 z-20 flex items-center justify-center"
                )}
              >
                <Button onClick={() => setIsOpen(true)} variant="secondary">
                  View Code
                </Button>
              </div>
            </>
          )}

          {isOpen ? (
            <button
              className={cn(
                "absolute right-3 bottom-3 z-10",
                "rounded-md px-2.5 py-1 font-medium text-xs",
                "text-muted-foreground hover:text-foreground",
                "bg-muted/80 hover:bg-muted",
                "cursor-pointer transition-colors"
              )}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Collapse
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
