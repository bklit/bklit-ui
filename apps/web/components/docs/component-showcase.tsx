"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { type ReactNode, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

/**
 * A component showcase that displays a preview above an expandable code section.
 * Matches the shadcn/ui documentation pattern.
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
    <div
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-fd-border",
        className
      )}
    >
      {/* Preview Section */}
      <div
        className="flex items-center justify-center bg-fd-muted/30 p-8"
        style={{ minHeight: previewMinHeight }}
      >
        {children}
      </div>

      {/* Code Section */}
      {hasCode && (
        <Collapsible
          className="group/collapsible relative"
          onOpenChange={setIsOpen}
          open={isOpen}
        >
          {/* Code content with forceMount for smooth transitions */}
          <CollapsibleContent
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              "data-[state=closed]:max-h-[120px]",
              // Style adjustments for embedded code blocks from fumadocs
              "[&_figure]:!my-0 [&_figure]:!rounded-none [&_figure]:!border-0",
              "[&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0",
              "[&_[data-rehype-pretty-code-figure]]:!mt-0"
            )}
            forceMount
          >
            {codeBlock || <DynamicCodeBlock code={code || ""} lang={lang} />}
          </CollapsibleContent>

          {/* Bottom gradient with View Code - only visible when collapsed */}
          <CollapsibleTrigger
            className={cn(
              "absolute inset-x-0 -bottom-px flex h-16 items-center justify-center",
              "bg-gradient-to-t from-fd-secondary via-fd-secondary/80 to-transparent",
              "font-medium text-fd-muted-foreground text-sm",
              "cursor-pointer rounded-b-xl",
              "group-data-[state=open]/collapsible:hidden"
            )}
          >
            View Code
          </CollapsibleTrigger>

          {/* Collapse button at bottom left - only visible when expanded */}
          <CollapsibleTrigger
            className={cn(
              "absolute right-3 bottom-3 z-10",
              "rounded-md px-2.5 py-1 font-medium text-xs",
              "text-fd-muted-foreground hover:text-fd-foreground",
              "bg-fd-muted/80 hover:bg-fd-muted",
              "cursor-pointer transition-colors",
              "group-data-[state=closed]/collapsible:hidden"
            )}
          >
            Collapse
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
}

/**
 * A simple preview container without expandable code.
 * Use this for demos that don't need to show source code.
 */
export function ComponentPreview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "not-prose my-6 flex min-h-[200px] items-center justify-center rounded-xl border border-fd-border bg-fd-muted/30 p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
