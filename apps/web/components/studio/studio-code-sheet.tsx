"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { codeThemes } from "@/lib/code-theme";
import { generateStudioCode } from "@/lib/studio/codegen";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";
import { CopyButton } from "./copy-button";

export function StudioCodeSheet({ state }: { state: StudioUrlState }) {
  const { code, data, title } = generateStudioCode(state.chart, state);
  const fullCode = data ? `${data}\n\n${code}` : code;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="h-10 px-4 text-sm" type="button" variant="outline">
          Get code
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2 pr-8">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Copy this snippet — props match your current studio settings.
              </SheetDescription>
            </div>
            <CopyButton text={fullCode} />
          </div>
        </SheetHeader>
        <div className="space-y-4 px-6 pb-6">
          <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
            <DynamicCodeBlock
              code={code}
              lang="tsx"
              options={{ themes: codeThemes }}
            />
          </div>
          {data ? (
            <>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Data
              </p>
              <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
                <DynamicCodeBlock
                  code={data}
                  lang="tsx"
                  options={{ themes: codeThemes }}
                />
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
