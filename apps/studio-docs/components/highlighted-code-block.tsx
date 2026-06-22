"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useMemo } from "react";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

export function HighlightedCodeBlock({
  code,
  lang = "css",
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const formattedCode = useMemo(() => code.trimEnd(), [code]);

  return (
    <div className={cn("catalog-code-block", className)}>
      <DynamicCodeBlock
        code={formattedCode}
        codeblock={{
          allowCopy: false,
          className:
            "my-0 rounded-none border-0 bg-transparent shadow-none text-xs",
          viewportProps: {
            className: "max-h-none overflow-visible py-0",
          },
        }}
        lang={lang}
        options={{ themes: codeThemes }}
      />
    </div>
  );
}
