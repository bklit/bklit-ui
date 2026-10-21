"use client";

import { type ReactNode, useState } from "react";
import { DocsChartPreviewShell } from "@/components/docs/docs-chart-preview-shell";
import { ShowcaseCodeBlock } from "@/components/docs/showcase-code-block";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import { cn } from "@/lib/utils";

/** ~5 lines at showcase line-height when the panel is collapsed. */
const collapsedCodeMaxHeightClassName = "max-h-[8.5rem]";

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
  /** Absolutely positioned controls painted over the preview panel. */
  previewOverlay?: ReactNode;
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
  previewOverlay,
}: ComponentShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasCode = code || codeBlock;
  const preview = (
    <div className="flex w-full items-stretch justify-stretch">{children}</div>
  );

  // coss-style Frame: preview panel on top, code panel below (adapted from
  // coss ui component-preview + code-collapsible-wrapper, https://coss.com/ui, MIT).
  return (
    <Frame className={cn("not-prose my-6", className)}>
      <FramePanel
        className="flex w-full shrink-0 items-center justify-center p-6 sm:p-8"
        style={{ minHeight: previewMinHeight }}
      >
        {liveChartPreview ? (
          preview
        ) : (
          <DocsChartPreviewShell>{preview}</DocsChartPreviewShell>
        )}
        {previewOverlay}
      </FramePanel>

      {hasCode ? (
        <FramePanel className="overflow-hidden bg-code p-0">
          <div
            className={cn(
              codePanelContentClassName,
              "py-1",
              isOpen ? "" : collapsedCodeMaxHeightClassName
            )}
          >
            {codeBlock || <ShowcaseCodeBlock code={code || ""} lang={lang} />}
          </div>

          {isOpen ? (
            <div className="flex justify-center border-border/64 border-t p-1.5">
              <Button
                className="text-muted-foreground"
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
              >
                Collapse
              </Button>
            </div>
          ) : (
            <button
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 flex h-20 cursor-pointer items-end justify-center rounded-b-xl pb-3",
                "bg-linear-to-b from-transparent via-code/80 to-code",
                "font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              )}
              onClick={() => setIsOpen(true)}
              type="button"
            >
              View code
            </button>
          )}
        </FramePanel>
      ) : null}
    </Frame>
  );
}
