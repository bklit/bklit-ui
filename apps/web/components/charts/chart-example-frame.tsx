"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-lg border [&_figure]:my-0! [&_pre]:my-0!">
      <DynamicCodeBlock
        code={code}
        lang="tsx"
        options={{ themes: codeThemes }}
      />
    </div>
  );
}

/**
 * Chart gallery card: title row on the frame rim, chart in an inset panel,
 * footnote below — coss ui "frame" layout (https://coss.com/ui, MIT).
 */
export function ChartExampleFrame({
  title,
  description,
  code,
  data,
  footer,
  hero = false,
  panelClassName,
  children,
}: {
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  hero?: boolean;
  panelClassName?: string;
  children: ReactNode;
}) {
  const fullCode = data ? `${data}\n\n${code}` : code;
  const TitleTag = hero ? "h2" : "h3";

  return (
    <Frame className="min-w-0">
      <FrameHeader className="flex-row items-start justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <FrameTitle className={hero ? "text-base" : "text-sm"}>
            <TitleTag>{title}</TitleTag>
          </FrameTitle>
          <FrameDescription className="text-pretty">
            {description}
          </FrameDescription>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <CopyButton text={fullCode} />
          <Sheet>
            <SheetTrigger render={<Button size="xs" variant="outline" />}>
              View Code
            </SheetTrigger>
            <SheetPopup>
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>{description}</SheetDescription>
              </SheetHeader>
              <SheetPanel className="space-y-4">
                <CodeBlock code={code} />
                {data ? (
                  <>
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Data
                    </p>
                    <CodeBlock code={data} />
                  </>
                ) : null}
              </SheetPanel>
            </SheetPopup>
          </Sheet>
        </div>
      </FrameHeader>
      <FramePanel
        className={cn("flex-1 overflow-visible p-4 sm:p-6", panelClassName)}
      >
        {children}
      </FramePanel>
      {footer ? (
        <FrameFooter className="px-4 py-3">
          <p className="text-muted-foreground text-xs">{footer}</p>
        </FrameFooter>
      ) : null}
    </Frame>
  );
}
