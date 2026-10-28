"use client";

import {
  registryV0ExampleJsonUrl,
  StudioCodeSheetTrigger,
  type StudioUrlState,
  studioChartDocsHref,
} from "@bklitui/studio";
import Link from "next/link";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { OpenInV0Button } from "@/components/docs/open-in-v0-button";
import { PackageManagerTabs } from "@/components/docs/package-manager-tabs";
import { Button } from "@/components/ui/button";

/** Code card sunk below the drawer surface (darker than `--popover` in both themes). */
const sheetCodeCardClass =
  "my-0 rounded-xl border bg-[color-mix(in_srgb,var(--popover),var(--color-black)_3%)] dark:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_32%)]";

const sheetCodeScrollClass = "max-h-80 overflow-auto overscroll-contain py-3";

export function WebStudioCodeSheet({ state }: { state: StudioUrlState }) {
  return (
    <StudioCodeSheetTrigger
      headerActions={
        <>
          <Button
            className="h-8 gap-1 px-3 text-xs"
            render={<Link href={studioChartDocsHref(state.chart)} />}
            variant="outline"
          >
            Documentation
          </Button>
          <OpenInV0Button
            chart={state.chart}
            registryJsonUrl={registryV0ExampleJsonUrl(state.chart)}
            surface="studio"
          />
        </>
      }
      installSection={
        <PackageManagerTabs className={sheetCodeCardClass} name={state.chart} />
      }
      renderDataCode={(data) => (
        <DocsCodeBlock
          className={sheetCodeCardClass}
          code={data ?? "// Example data for this chart is not available yet."}
          lang="tsx"
          viewportClassName={sheetCodeScrollClass}
        />
      )}
      renderUsageCode={(code) => (
        <DocsCodeBlock
          className={sheetCodeCardClass}
          code={code}
          lang="tsx"
          viewportClassName={sheetCodeScrollClass}
        />
      )}
      state={state}
      triggerClassName="w-full font-mono text-xs"
      triggerSize="sm"
    />
  );
}
