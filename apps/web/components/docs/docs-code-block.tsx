"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { DocsHighlightedCodeBlock } from "@/components/docs/docs-highlighted-code-block";
import { formatDocsCode } from "@/lib/format-showcase-code";
import { cn } from "@/lib/utils";

/**
 * Syntax-highlighted code block styled like docs Usage MDX fences and chart gallery sheets.
 */
export function DocsCodeBlock({
  code,
  lang = "tsx",
  className,
  showCopy = true,
}: {
  code: string;
  lang?: string;
  className?: string;
  showCopy?: boolean;
}) {
  const formattedCode = useMemo(() => formatDocsCode(code), [code]);

  return (
    <div
      className={cn(
        "showcase-code-block relative overflow-hidden [&_figure]:my-0! [&_pre]:my-0!",
        className
      )}
    >
      <DocsHighlightedCodeBlock
        allowCopy={false}
        code={code}
        lang={lang}
        showLineNumbers
      />
      {showCopy ? (
        <CopyButton
          className="absolute top-2 right-2 z-10"
          text={formattedCode}
        />
      ) : null}
    </div>
  );
}
