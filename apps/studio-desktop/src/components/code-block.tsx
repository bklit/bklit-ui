"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { codeThemes } from "../lib/code-theme";
import { CopyButton } from "./copy-button";

export function CodeBlock({
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
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code, {
      lang,
      themes: codeThemes,
    }).then((nextHtml) => {
      if (!cancelled) {
        setHtml(nextHtml);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {html ? (
        <div
          className="overflow-x-auto text-sm [&_pre]:m-0! [&_pre]:rounded-lg [&_pre]:p-4"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{code}</code>
        </pre>
      )}
      {showCopy ? (
        <CopyButton className="absolute top-2 right-2 z-10" text={code} />
      ) : null}
    </div>
  );
}
