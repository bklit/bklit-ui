"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useMemo } from "react";
import { codeThemes } from "@/lib/code-theme";
import { formatDocsCode } from "@/lib/format-showcase-code";
import { cn } from "@/lib/utils";

export function DocsHighlightedCodeBlock({
  code,
  lang = "tsx",
  className,
  showLineNumbers = true,
  allowCopy = false,
  viewportClassName,
}: {
  code: string;
  lang?: string;
  className?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  /** Overrides the fumadocs viewport (the element that scrolls). */
  viewportClassName?: string;
}) {
  const formattedCode = useMemo(() => formatDocsCode(code), [code]);

  return (
    <div className={cn("showcase-code-block", className)}>
      <DynamicCodeBlock
        code={formattedCode}
        codeblock={{
          allowCopy,
          ...(showLineNumbers ? { "data-line-numbers": true } : {}),
          className:
            "my-0 rounded-none border-0 bg-transparent shadow-none text-sm",
          viewportProps: {
            className: cn(
              "max-h-none overflow-visible py-0",
              viewportClassName
            ),
          },
        }}
        lang={lang}
        options={{ themes: codeThemes }}
      />
    </div>
  );
}
