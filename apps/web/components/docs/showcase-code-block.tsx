"use client";

import { DocsHighlightedCodeBlock } from "@/components/docs/docs-highlighted-code-block";
import { cn } from "@/lib/utils";

export function ShowcaseCodeBlock({
  code,
  lang = "tsx",
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  return (
    <DocsHighlightedCodeBlock
      className={cn(className)}
      code={code}
      lang={lang}
    />
  );
}
