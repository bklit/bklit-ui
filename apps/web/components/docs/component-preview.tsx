import {
  registryJsonUrlForName,
  registryV0ExampleJsonUrl,
} from "@bklitui/studio";
import type { ReactNode } from "react";
import { isChartSlug } from "@/components/charts/chart-slugs";
import { DocsChartPreviewShell } from "@/components/docs/docs-chart-preview-shell";
import { OpenInStudioButton } from "@/components/docs/open-in-studio-button";
import { OpenInV0Button } from "@/components/docs/open-in-v0-button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { cn } from "@/lib/utils";

/**
 * Primary docs preview with optional Open in v0 / Studio actions.
 * Kept as a Server Component so heavy chart MDX pages do not pull this into the client bundle.
 */
export function ComponentPreview({
  children,
  className,
  registryName,
}: {
  children: ReactNode;
  className?: string;
  /** Registry item name for Open in v0 / Studio actions on the primary preview. */
  registryName?: string;
}) {
  let registryJsonUrl: string | undefined;
  if (registryName) {
    registryJsonUrl = isChartSlug(registryName)
      ? registryV0ExampleJsonUrl(registryName)
      : registryJsonUrlForName(registryName);
  }
  const studioSlug =
    registryName && isChartSlug(registryName) ? registryName : undefined;

  // coss-style Frame: muted shell, optional header strip, chart on a white panel.
  return (
    <Frame className={cn("not-prose my-6", className)}>
      {registryJsonUrl ? (
        <FrameHeader className="flex-row items-center justify-between gap-4 py-1.5 ps-4 pe-1.5">
          <FrameTitle className="font-medium text-foreground">
            Preview
          </FrameTitle>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
            {studioSlug ? <OpenInStudioButton slug={studioSlug} /> : null}
            <OpenInV0Button
              chart={registryName}
              registryJsonUrl={registryJsonUrl}
            />
          </div>
        </FrameHeader>
      ) : null}
      <FramePanel className="flex min-h-[200px] w-full shrink-0 items-center justify-center p-6 sm:p-8">
        <DocsChartPreviewShell>
          <div className="flex w-full items-center justify-center">
            {children}
          </div>
        </DocsChartPreviewShell>
      </FramePanel>
    </Frame>
  );
}
