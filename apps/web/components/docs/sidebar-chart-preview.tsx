"use client";

import { lazy, type ReactElement, type ReactNode, Suspense } from "react";
import { SidebarChartPreviewLoader } from "@/components/docs/sidebar-chart-preview-loader";
import { getChartIllustration } from "@/components/illustrations/chart-illustrations";
import {
  PreviewCard,
  PreviewCardCreateHandle,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";

interface SidebarChartPreviewPayload {
  slug: string;
  title: ReactNode;
  description?: ReactNode;
}

/** One popup shared by every component link, so hovering down the list glides it. */
const sidebarChartPreviewHandle =
  PreviewCardCreateHandle<SidebarChartPreviewPayload>();

const componentsPathPrefix = "/docs/components/";

/** Card content width (`w-72` minus the `p-1` frame). */
const PREVIEW_WIDTH = 280;

/** Chart examples are a large module: load them the first time a card opens. */
const SidebarChartPreviewChart = lazy(
  () => import("@/components/docs/sidebar-chart-preview-chart")
);

/** Slug for `/docs/components/<slug>` pages that have an illustration. */
export function sidebarChartPreviewSlug(url: string): string | null {
  if (!url.startsWith(componentsPathPrefix)) {
    return null;
  }
  const slug = url.slice(componentsPathPrefix.length);
  return slug && getChartIllustration(slug) ? slug : null;
}

export function SidebarChartPreviewTrigger({
  slug,
  title,
  description,
  render,
}: SidebarChartPreviewPayload & { render: ReactElement }) {
  return (
    <PreviewCardTrigger
      closeDelay={120}
      delay={250}
      handle={sidebarChartPreviewHandle}
      payload={{ slug, title, description }}
      render={render}
    />
  );
}

export function SidebarChartPreview() {
  return (
    <PreviewCard handle={sidebarChartPreviewHandle}>
      {({ payload }) => (
        <PreviewCardPopup align="center" side="right" sideOffset={-16}>
          {payload ? <SidebarChartPreviewCard {...payload} /> : null}
        </PreviewCardPopup>
      )}
    </PreviewCard>
  );
}

function SidebarChartPreviewCard({
  slug,
  title,
  description,
}: SidebarChartPreviewPayload) {
  return (
    <div className="flex w-72 flex-col gap-1 p-1">
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--color-card),var(--color-sidebar))] dark:bg-background">
        <Suspense
          fallback={<SidebarChartPreviewLoader className="h-[174px]" />}
        >
          <SidebarChartPreviewChart
            fallback={<IllustrationFallback slug={slug} />}
            slug={slug}
            width={PREVIEW_WIDTH}
          />
        </Suspense>
      </div>
      <div className="flex flex-col gap-0.5 px-3 pt-2 pb-2.5">
        <p className="m-0 font-medium text-foreground text-sm">{title}</p>
        {description ? (
          <p className="m-0 line-clamp-2 text-muted-foreground text-xs">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function IllustrationFallback({ slug }: { slug: string }) {
  return (
    <div className="flex h-[174px] w-full items-center justify-center px-6">
      {getChartIllustration(slug)}
    </div>
  );
}
