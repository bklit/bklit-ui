"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

export function BlockCodeBlock({
  code,
  lang = "tsx",
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "block-code-block min-h-0 [&_figure]:my-0! [&_figure]:min-h-0 [&_pre]:my-0!",
        className
      )}
    >
      <DynamicCodeBlock
        code={code}
        codeblock={{
          allowCopy: false,
          "data-line-numbers": true,
          className:
            "my-0 rounded-none border-0 bg-transparent py-4 text-sm shadow-none text-base",
        }}
        lang={lang}
        options={{ themes: codeThemes }}
      />
    </div>
  );
}
