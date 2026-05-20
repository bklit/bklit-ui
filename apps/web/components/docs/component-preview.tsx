import type { ReactNode } from "react";
import { isChartSlug } from "@/components/charts/chart-slugs";
import { OpenInStudioButton } from "@/components/docs/open-in-studio-button";
import { OpenInV0Button } from "@/components/docs/open-in-v0-button";
import {
  Card,
  CardContent,
  previewCardClassName,
  previewCardContentClassName,
} from "@/components/ui/card";
import {
  registryJsonUrlForName,
  registryV0ExampleJsonUrl,
} from "@/lib/studio/chart-links";
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

  return (
    <div className={cn("not-prose my-6", className)}>
      {registryJsonUrl ? (
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="m-0 font-semibold text-foreground text-lg tracking-tight">
            Preview
          </h2>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {studioSlug ? <OpenInStudioButton slug={studioSlug} /> : null}
            <OpenInV0Button registryJsonUrl={registryJsonUrl} />
          </div>
        </div>
      ) : null}
      <Card className={cn("flex flex-col", previewCardClassName)}>
        <CardContent
          className={cn(previewCardContentClassName, "min-h-[200px] shrink-0")}
        >
          <div className="flex w-full items-center justify-center">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
