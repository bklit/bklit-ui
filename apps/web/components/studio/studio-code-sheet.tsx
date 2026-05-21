"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OpenInV0Button } from "@/components/docs/open-in-v0-button";
import { PackageManagerTabs } from "@/components/docs/package-manager-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  registryV0ExampleJsonUrl,
  studioChartDocsHref,
} from "@/lib/studio/chart-links";
import { generateStudioCode } from "@/lib/studio/codegen";
import type { StudioUrlState } from "@/lib/studio/studio-parsers";

const DocsCodeBlock = dynamic(
  () =>
    import("@/components/docs/docs-code-block").then(
      (mod) => mod.DocsCodeBlock
    ),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-lg border bg-muted/30 p-4 font-mono text-muted-foreground text-xs">
        Loading…
      </div>
    ),
  }
);

export function StudioCodeSheet({ state }: { state: StudioUrlState }) {
  const [open, setOpen] = useState(false);
  const generated = useMemo(
    () => generateStudioCode(state.chart, state),
    [state]
  );
  const { code, data, title } = generated;

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          className="h-10 px-4 font-mono text-[11px]"
          type="button"
          variant="white"
        >
          Get code_
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex flex-col gap-3 pr-8">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Install, then copy the snippet — props match your committed
                studio settings.
              </SheetDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                className="h-8 text-xs"
                size="sm"
                variant="outline"
              >
                <Link href={studioChartDocsHref(state.chart)}>
                  Documentation
                </Link>
              </Button>
              <OpenInV0Button
                registryJsonUrl={registryV0ExampleJsonUrl(state.chart)}
              />
            </div>
          </div>
        </SheetHeader>
        {open ? (
          <div className="space-y-6 px-6 pb-6">
            <Alert variant="indigo">
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              <AlertTitle>Motion settings not in snippet yet</AlertTitle>
              <AlertDescription>
                Enter animations from the Motion panel are not included in this
                code export yet. They will be added in a future update — copy
                duration and easing from the studio when wiring your chart.
              </AlertDescription>
            </Alert>
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Install
              </h3>
              <PackageManagerTabs name={state.chart} />
            </section>
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Usage
              </h3>
              <DocsCodeBlock code={code} lang="tsx" />
            </section>
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Data
              </h3>
              <DocsCodeBlock
                code={
                  data ?? "// Example data for this chart is not available yet."
                }
                lang="tsx"
              />
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
