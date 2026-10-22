"use client";

import { Icon } from "@bklitui/icons";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsiblePrimitive,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { cn } from "@/lib/utils";

/**
 * Benchmark card in the site's chart-gallery layout (see ChartExampleFrame):
 * title + description on the frame rim, content in inset panels, footnote
 * below — coss ui "frame" (https://coss.com/ui/docs/components/frame, MIT).
 */
export function BenchFrame({
  title,
  description,
  action,
  badge,
  footer,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned header slot (buttons). */
  action?: ReactNode;
  /** Inline next to the title (e.g. a "Reference" badge). */
  badge?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** One or more `BenchPanel`s. */
  children: ReactNode;
}) {
  return (
    <Frame className={cn("min-w-0", className)}>
      {/* Wraps the action under the text on narrow screens instead of
          squeezing the description into a thin column beside it. */}
      <FrameHeader className="flex-row flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
          <FrameTitle className="flex flex-wrap items-center gap-2 text-sm">
            <h3>{title}</h3>
            {badge}
          </FrameTitle>
          {description ? (
            <FrameDescription className="text-pretty">
              {description}
            </FrameDescription>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 items-center gap-1">{action}</div>
        ) : null}
      </FrameHeader>
      {children}
      {footer ? (
        <FrameFooter className="px-4 py-3">
          <div className="text-muted-foreground text-xs">{footer}</div>
        </FrameFooter>
      ) : null}
    </Frame>
  );
}

/**
 * `default`: the raised inset card that holds a frame's main content.
 * `ghost`: no card — content sits directly on the frame's muted rim, for
 * supporting content next to a raised panel (controls, notes, comparisons).
 */
export type BenchPanelVariant = "default" | "ghost";

export function BenchPanel({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: BenchPanelVariant;
  children: ReactNode;
}) {
  return (
    <FramePanel
      className={cn(
        "flex-1 overflow-visible p-4 sm:p-6",
        variant === "ghost" &&
          "rounded-lg border-transparent bg-transparent px-4 py-3 shadow-none before:hidden sm:px-4 sm:py-3",
        className
      )}
      data-variant={variant}
    >
      {children}
    </FramePanel>
  );
}

/**
 * Accordion variant of {@link BenchFrame}: the whole header toggles the panel.
 * Height eases open on Base UI's measured `--collapsible-panel-height`, and
 * the content fades and settles in just behind it. Reduced motion skips both.
 */
export function BenchCollapsibleFrame({
  title,
  description,
  defaultOpen = false,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** One or more `BenchPanel`s, revealed when open. */
  children: ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Frame className={cn("min-w-0", className)}>
        {/* The heading holds the button (valid HTML, announced as a
            heading); the button's ::after stretches over the whole header so
            the description and chevron area are clickable too. */}
        <FrameHeader className="relative flex-row items-start justify-between gap-4 rounded-xl px-4 py-3 transition-colors has-[button:hover]:bg-foreground/[0.03]">
          <div className="flex min-w-0 flex-col gap-0.5">
            <FrameTitle className="text-sm">
              <h3>
                <CollapsibleTrigger className="group/trigger cursor-pointer rounded-sm text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring">
                  {title}
                  <Icon
                    aria-hidden
                    className="absolute top-3.5 right-4 size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-panel-open/trigger:rotate-180 motion-reduce:transition-none"
                    name="IconChevronDownSmall"
                  />
                </CollapsibleTrigger>
              </h3>
            </FrameTitle>
            {description ? (
              <FrameDescription className="text-pretty pr-6">
                {description}
              </FrameDescription>
            ) : null}
          </div>
        </FrameHeader>
        <CollapsiblePrimitive.Panel className="group/panel h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
          <div className="flex flex-col transition-[opacity,translate,filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-ending-style/panel:-translate-y-1 group-data-starting-style/panel:-translate-y-1 group-data-ending-style/panel:opacity-0 group-data-starting-style/panel:opacity-0 group-data-ending-style/panel:blur-[2px] group-data-starting-style/panel:blur-[2px] motion-reduce:transition-none">
            {children}
          </div>
        </CollapsiblePrimitive.Panel>
      </Frame>
    </Collapsible>
  );
}
