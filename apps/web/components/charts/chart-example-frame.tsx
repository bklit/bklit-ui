"use client";

import { studioChartHref } from "@bklitui/studio";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";
import { ChartPreviewGate } from "@/components/charts/chart-preview-gate";
import { isChartSlug } from "@/components/charts/chart-slugs";
import { ComponentShowcase } from "@/components/docs/component-showcase";
import { ShowcaseReplayAction } from "@/components/showcase-replay-action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Chart gallery item: title row with docs / Studio actions, then the docs
 * `ComponentShowcase` (live preview with collapsible code below it). The
 * homepage's icon-only Replay control sits over the preview's top-right corner,
 * revealed on hover / focus (always shown on touch or reduced motion).
 */
export function ChartExampleFrame({
  anchorId,
  chartSlug,
  title,
  description,
  code,
  data,
  footer,
  hero = false,
  previewLayout = "cartesian",
  children,
}: {
  /** Deep-link target (`#anchorId`) placed on the title row for the gallery sidebar. */
  anchorId?: string;
  /** Gallery chart type (`/charts/[chart]`) — drives the docs and Studio links. */
  chartSlug: string;
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  hero?: boolean;
  previewLayout?: ChartExamplePreviewLayout;
  children: ReactNode;
}) {
  const [replayKey, setReplayKey] = useState(0);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showReplay =
    reducedMotion === true || coarsePointer || hovered || focused;
  const fullCode = data ? `${code}\n\n${data}` : code;
  const TitleTag = hero ? "h2" : "h3";

  return (
    <div
      className="flex min-w-0 flex-col gap-3"
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <header
        className="flex scroll-mt-[calc(var(--site-header-height)+4.5rem)] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:scroll-mt-[calc(var(--site-header-height)+1.5rem)]"
        id={anchorId}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <TitleTag
            className={cn(
              "m-0 font-semibold text-foreground tracking-tight",
              hero ? "text-base" : "text-sm"
            )}
          >
            {title}
          </TitleTag>
          <p className="m-0 text-pretty text-muted-foreground text-sm">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            render={<Link href={`/docs/components/${chartSlug}`} />}
            size="xs"
            variant="outline"
          >
            Open docs
          </Button>
          {isChartSlug(chartSlug) ? (
            <Button
              render={<Link href={studioChartHref(chartSlug)} />}
              size="xs"
              variant="outline"
            >
              Open in Studio
            </Button>
          ) : null}
        </div>
      </header>

      <ComponentShowcase
        className="my-0"
        code={fullCode}
        liveChartPreview
        previewMinHeight={0}
        previewOverlay={
          <div className="absolute top-3 right-3 z-10">
            <ShowcaseReplayAction
              index={0}
              onReplay={() => setReplayKey((key) => key + 1)}
              reducedMotion={reducedMotion}
              visible={showReplay}
            />
          </div>
        }
      >
        <ChartPreviewGate
          layout={previewLayout}
          previewRole={hero ? "hero" : "example"}
        >
          <Fragment key={replayKey}>{children}</Fragment>
        </ChartPreviewGate>
      </ComponentShowcase>

      {footer ? (
        <p className="m-0 text-muted-foreground text-xs">{footer}</p>
      ) : null}
    </div>
  );
}
