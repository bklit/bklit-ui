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
        "block-code-block overflow-hidden [&_figure]:my-0! [&_pre]:my-0!",
        className
      )}
    >
      <DynamicCodeBlock
        code={code}
        codeblock={{
          allowCopy: false,
          "data-line-numbers": true,
          className:
            "my-0 rounded-none border-0 bg-transparent shadow-none text-base",
          viewportProps: {
            className: "max-h-none py-4 text-sm",
          },
        }}
        lang={lang}
        options={{ themes: codeThemes }}
      />
    </div>
  );
}
